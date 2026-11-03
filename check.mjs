// 사이트 확인: node check.mjs
// 1) 캐릭터 그림이 앱 원본 규칙대로 옮겨졌는지
// 2) (Task 5) 링크 검사
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHARACTERS, MOODS, applyFace, toSVG } from './characters.js'

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

console.log(`\n${passed}개 통과`)
