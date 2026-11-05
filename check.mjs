// 사이트 확인: node check.mjs
// 1) 캐릭터 그림이 앱 원본 규칙대로 옮겨졌는지 · 픽셀 사진(scenes.js)이 칸 수와 색을 다 갖췄는지
// 2) 언어 페이지가 한국어 원문과 dev/i18n.json에서 만든 그대로인지(구조가 같음)
// 3) 모든 HTML의 상대 경로가 실제 파일을 가리키고, '/'로 시작하는 절대 경로가 없는지
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { CHARACTERS, MOODS, applyFace, toSVG } from './characters.js'
import { SCENES, SCENE_WIDTH, SCENE_HEIGHT, sceneSVG } from './scenes.js'

const root = dirname(fileURLToPath(import.meta.url))
let passed = 0
function check(name, fn) {
  fn()
  passed += 1
  console.log(`ok  ${name}`)
}

// 캐릭터 ------------------------------------------------------------------

const moa = CHARACTERS[0]

check('캐릭터 순서', () => {
  assert.deepEqual(CHARACTERS.map(c => c.id), ['moa', 'chalkak', 'pola', 'rolly', 'nyang'])
  assert.deepEqual(CHARACTERS.map(c => c.name), ['모아', '찰칵', '폴라', '롤리', '냥이'])
})

check('12×12 그림', () => {
  for (const c of CHARACTERS) {
    assert.equal(c.rows.length, 12, c.id)
    c.rows.forEach(r => assert.equal(r.length, 12, c.id))
  }
})

check('표정 목록', () => {
  assert.deepEqual(MOODS, ['happy', 'cheer', 'sleepy', 'wow', 'worried'])
})

check('기쁨은 기본 그림 그대로', () => {
  assert.deepEqual(applyFace(moa.rows, 'happy', false), moa.rows)
})

check('깜빡이면 눈 옆 칸까지 선', () => {
  const b = applyFace(moa.rows, 'happy', true)
  assert.equal(b[5][4], 'k')
  assert.equal(b[5][7], 'k')
})

check('신남은 팔을 머리 옆으로', () => {
  const ch = applyFace(moa.rows, 'cheer', false)
  assert.equal(ch[2][0], 'k')
  assert.equal(ch[8][0], '.')
  assert.equal(ch[8][5], 'p')
})

check('놀람은 눈이 커짐', () => {
  const w = applyFace(moa.rows, 'wow', false)
  assert.equal(w[4][3], 'k')
  assert.equal(w[4][8], 'k')
})

check('걱정은 입꼬리가 내려감', () => {
  const w = applyFace(moa.rows, 'worried', false)
  assert.equal(w[8][4], 'k')
  assert.equal(w[8][7], 'k')
})

check('원본 그림을 바꾸지 않음', () => {
  const before = [...moa.rows]
  applyFace(moa.rows, 'cheer', true)
  assert.deepEqual(moa.rows, before)
})

check('SVG 틀', () => {
  assert.match(toSVG(moa), /^<svg[^>]+viewBox="0 0 1[24] 1[24]"/)
  assert.match(toSVG(moa), /shape-rendering="crispEdges"/)
})

check('팔레트에 없는 글자가 없음', () => {
  for (const c of CHARACTERS) {
    for (const mood of MOODS) {
      for (const scheme of ['light', 'dark']) {
        const svg = toSVG(c, { mood, blinking: true, scheme })
        assert.ok(!svg.includes('undefined'), `${c.id} ${mood} ${scheme}`)
        const used = new Set(applyFace(c.rows, mood, true).join('').replace(/\./g, ''))
        for (const ch of used) assert.ok(c.palette[scheme][ch], `${c.id} ${scheme} '${ch}'`)
      }
    }
  }
})

check('다크는 스티커 테두리', () => {
  assert.ok(!toSVG(moa).includes('class="edge"'))
  assert.ok(toSVG(moa, { scheme: 'dark' }).includes('class="edge"'))
})

check('소품은 몸 밖으로 넘쳐 그림', () => {
  const svg = toSVG(moa, { accessories: ['partyHat'] })
  assert.match(svg, /viewBox="0 0 14 14"/)
  assert.match(svg, /y="-/)
})

// 픽셀 사진 ------------------------------------------------------------------

check('픽셀 사진은 14×11칸, 모든 글자에 색', () => {
  for (const [id, scene] of Object.entries(SCENES)) {
    assert.equal(scene.rows.length, SCENE_HEIGHT, id)
    for (const row of scene.rows) {
      assert.equal(row.length, SCENE_WIDTH, id)
      for (const ch of row) assert.ok(scene.palette[ch], `${id} '${ch}'`)
    }
  }
})

check('픽셀 사진 SVG 틀', () => {
  for (const id of Object.keys(SCENES)) {
    for (const scheme of ['light', 'dark']) {
      const svg = sceneSVG(id, { scheme })
      assert.match(svg, /viewBox="0 0 20 19"/, id)
      assert.match(svg, /shape-rendering="crispEdges"/, id)
      assert.ok(!svg.includes('undefined'), `${id} ${scheme}`)
    }
    assert.match(sceneSVG(id, { frame: false }), /viewBox="0 0 14 11"/, id)
  }
  assert.ok(!sceneSVG('sea').includes('#FFFFFF'), '라이트는 스티커 테두리 없음')
  assert.ok(sceneSVG('sea', { scheme: 'dark' }).includes('#FFFFFF'), '다크는 스티커 테두리')
})

// 링크 ------------------------------------------------------------------

function htmlFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    if (name.startsWith('.') || name === 'node_modules') return []
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return htmlFiles(p)
    return name.endsWith('.html') ? [p] : []
  })
}

const pages = htmlFiles(root)

const { langs } = JSON.parse(readFileSync(join(root, 'dev/i18n.json'), 'utf8'))

check('언어마다 세 페이지가 있음', () => {
  for (const lang of langs) {
    for (const p of ['index.html', 'privacy/index.html', 'support/index.html']) {
      assert.ok(existsSync(join(root, lang.dir, p)), join(lang.dir, p))
    }
  }
})

check('언어 페이지가 최신(node dev/i18n.mjs)', () => {
  const run = spawnSync(process.execPath, [join(root, 'dev/i18n.mjs'), '--check'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
})

check('언어 페이지는 한국어 원문과 구조가 같음', () => {
  const tags = html => ['<section', '<article', '<img', '<a ', '<h2', '<h3', '<details', '<li'].map(tag => html.split(tag).length)
  for (const p of ['index.html', 'privacy/index.html', 'support/index.html']) {
    const source = tags(readFileSync(join(root, p), 'utf8'))
    for (const lang of langs.slice(1)) assert.deepEqual(tags(readFileSync(join(root, lang.dir, p), 'utf8')), source, join(lang.dir, p))
  }
})

check('상대 경로만 쓰고 모두 실제 파일', () => {
  for (const file of pages) {
    const html = readFileSync(file, 'utf8')
    const refs = [...html.matchAll(/\b(?:href|src|content)="([^"]+)"/g)].map(m => m[1])
    for (const ref of refs) {
      const name = relative(root, file)
      if (/^(https?:|mailto:|#|data:)/.test(ref)) continue
      if (!/[./]/.test(ref) || /\s/.test(ref)) continue // content="width=device-width" 같은 값
      if (ref.startsWith('/')) assert.fail(`${name}: 절대 경로 ${ref}`)
      if (!/^\.{0,2}\/?[\w./-]+$/.test(ref)) continue
      const clean = ref.split(/[?#]/)[0]
      if (!clean.includes('/') && !clean.includes('.')) continue
      let target = join(dirname(file), clean)
      if (clean.endsWith('/') || clean === '.' || clean === '..') target = join(target, 'index.html')
      assert.ok(existsSync(target), `${name}: ${ref} 없음`)
    }
  }
})

check('외부 요청 없음 · 바깥 링크는 App Store와 Firebase 개인정보 안내만, 문의는 메일', () => {
  const appStore = 'https://apps.apple.com/app/id6472587949'
  const mail = 'mailto:archivelabapps@gmail.com'
  const allowed = [appStore, 'https://firebase.google.com/support/privacy']
  for (const file of pages) {
    const html = readFileSync(file, 'utf8')
    const fetches = html.replace(/<link rel="alternate"[^>]+>/g, '') // hreflang 링크는 요청하지 않음
    assert.ok(!/<(script|link|img|iframe)[^>]+(src|href)="https?:/.test(fetches), relative(root, file))
    for (const [, url] of html.matchAll(/<a[^>]+href="(https?:[^"]+)"/g)) assert.ok(allowed.includes(url), `${relative(root, file)}: ${url}`)
    for (const [, kind, url] of html.matchAll(/data-link="(appstore|mail)"[^>]*href="([^"]+)"/g)) assert.equal(url, kind === 'appstore' ? appStore : mail, relative(root, file))
    assert.ok(!html.includes('forms.gle'), `${relative(root, file)}: 예전 문의 설문`)
  }
})

console.log(`\n${passed}개 통과`)
