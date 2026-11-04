// 페이지 전체 스크린샷: node dev/capture.mjs <저장 폴더> <주소 기준> <페이지...>
// Chrome 헤드리스를 DevTools 프로토콜로 움직여 폭 · 라이트/다크를 바꿔 가며 페이지 끝까지 찍습니다.
// 폭은 WIDTHS(기본 "360 390 1280"), 자바스크립트를 끄려면 NOJS=1.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [out, base, ...pages] = process.argv.slice(2)
const widths = (process.env.WIDTHS || '360 390 1280').split(/\s+/).map(Number)
const schemes = (process.env.SCHEMES || 'light dark').split(/\s+/)
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(out, { recursive: true })

const profile = mkdtempSync(join(tmpdir(), 'moabook-shots-'))
const port = 9300 + Math.floor(Math.random() * 500)
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' })

const sleep = ms => new Promise(r => setTimeout(r, ms))
let target
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200)
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    target = list.find(t => t.type === 'page')
  } catch {}
}
if (!target) throw new Error('Chrome에 붙지 못했어요')

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r, { once: true }))
let id = 0
const waiting = new Map()
const events = []
ws.addEventListener('message', e => {
  const msg = JSON.parse(e.data)
  if (msg.id && waiting.has(msg.id)) {
    const { resolve, reject } = waiting.get(msg.id)
    waiting.delete(msg.id)
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
  } else if (msg.method) events.push(msg.method)
})
const send = (method, params = {}) => new Promise((resolve, reject) => {
  id += 1
  waiting.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params }))
})

await send('Page.enable')
await send('Runtime.enable')
if (process.env.NOJS === '1') await send('Emulation.setScriptExecutionDisabled', { value: true })

const report = []
for (const page of pages) {
  const name = (page.replace(/\/$/, '') || 'index').replace(/\//g, '-')
  for (const width of widths) {
    for (const scheme of schemes) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 })
      await send('Emulation.setEmulatedMedia', { features: [
        { name: 'prefers-color-scheme', value: scheme },
        { name: 'prefers-reduced-motion', value: process.env.REDUCE === '1' ? 'reduce' : 'no-preference' }
      ] })
      events.length = 0
      await send('Page.navigate', { url: base + page })
      for (let i = 0; i < 50 && !events.includes('Page.loadEventFired'); i++) await sleep(100)
      // 말풍선이 모두 나오도록 끝까지 조금씩 내렸다 올립니다.
      for (let y = 0; y < 30000; y += 500) {
        const { result: r } = await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y}); document.documentElement.scrollHeight`, returnByValue: true })
        await sleep(60)
        if (y > r.value) break
      }
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' })
      await sleep(Number(process.env.WAIT || 900))
      const { result } = await send('Runtime.evaluate', {
        expression: 'JSON.stringify({h: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, out: [...document.querySelectorAll("body *")].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && !e.closest("[aria-hidden=true], .phone, .pile, .extras-row") }).map(e => e.tagName + "." + e.className).slice(0, 5)})',
        returnByValue: true
      })
      const { h, sw, out: over } = JSON.parse(result.value)
      // SEG를 주면 그 높이씩 나눠 찍습니다(긴 페이지를 나눠 보기).
      const seg = Number(process.env.SEG || 0) || h
      for (let y = 0, i = 0; y < h; y += seg, i += 1) {
        const shot = await send('Page.captureScreenshot', {
          format: 'png', captureBeyondViewport: true,
          clip: { x: 0, y, width, height: Math.min(seg, h - y), scale: 1 }
        })
        const suffix = seg < h ? `_p${i}` : ''
        const file = join(out, `${name}_${width}_${scheme}${suffix}.png`)
        writeFileSync(file, Buffer.from(shot.data, 'base64'))
      }
      report.push(`${name}_${width}_${scheme}  높이 ${h}${sw > width ? `  가로 넘침 ${sw}px` : ''}${over.length ? `  오른쪽으로 나간 요소 ${over.join(', ')}` : ''}`)
    }
  }
}
console.log(report.join('\n'))
ws.close()
chrome.kill()
await sleep(300)
rmSync(profile, { recursive: true, force: true })
