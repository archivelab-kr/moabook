// 언어별 페이지 만들기: node dev/i18n.mjs  (확인만: node dev/i18n.mjs --check, 바뀔 파일이 있으면 실패)
// 한국어 페이지(index.html · privacy/ · support/)가 원문입니다. dev/i18n.json의 rows로 문구를 바꿔 <언어 폴더>/에 쓰고,
// 모든 언어 페이지에 hreflang 링크와 바닥글 언어 고르기를 넣습니다.
// 스크린샷은 assets/shots/<언어 폴더>/에 같은 이름이 있으면 그것을, 없으면 한국어 스크린샷을 씁니다.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://archivelab-kr.github.io/moabook/'
const PAGES = ['', 'privacy/', 'support/']
const checkOnly = process.argv.includes('--check')
const { langs, rows } = JSON.parse(readFileSync(join(root, 'dev/i18n.json'), 'utf8'))
const source = langs[0]
const BLOCK = /\n[ \t]*<!-- i18n:(head|langs) -->[\s\S]*?<!-- \/i18n:\1 -->/g

const problems = []
const changed = []
const writes = []

/** 한 단계 깊은 언어 폴더로 옮길 때: 페이지 링크(…/)는 그 언어 안을 가리키게 두고, 파일은 한 단계 위로 */
function relocate(html, lang) {
  return html.replace(/\b(href|src)="([^"]+)"/g, (whole, attr, ref) => {
    if (/^(https?:|mailto:|#|data:)/.test(ref) || ref.endsWith('/') || ref === '.') return whole
    const shot = ref.match(/^((?:\.\.\/)*)assets\/shots\/([^/]+)$/)
    if (shot && existsSync(join(root, 'assets/shots', lang.dir, shot[2]))) ref = `${shot[1]}assets/shots/${lang.dir}/${shot[2]}`
    return `${attr}="../${ref}"`
  })
}

function translate(html, lang, page) {
  for (const row of rows) {
    const to = row[lang.code]
    if (to === undefined) { problems.push(`${lang.code}: 번역 없음 → ${row.ko.slice(0, 40)}`); continue }
    html = html.split(row.ko).join(to)
  }
  html = html
    .replace(`<html lang="${source.code}">`, `<html lang="${lang.code}">`)
    .replace(`content="${source.og}"`, `content="${lang.og}"`)
    .replace(`content="${SITE}${page}"`, `content="${SITE}${lang.dir}/${page}"`)
  // 한국어 주석은 원문 페이지에만 둡니다.
  html = html.replace(/\n[ \t]*<!--[\s\S]*?-->/g, '')
  for (const [, line] of html.matchAll(/^(.*[가-힣].*)$/gm)) problems.push(`${lang.code} ${page || '첫 페이지'}: 한국어가 남음 → ${line.trim().slice(0, 80)}`)
  return relocate(html, lang)
}

const url = (lang, page) => `${SITE}${lang.dir ? lang.dir + '/' : ''}${page}`

function inject(html, lang, page) {
  const head = [
    '<!-- i18n:head -->',
    ...langs.map(l => `<link rel="alternate" hreflang="${l.code}" href="${url(l, page)}">`),
    `<link rel="alternate" hreflang="x-default" href="${url(langs[1], page)}">`,
    '<!-- /i18n:head -->'
  ].join('\n')
  const from = posix.join('/', lang.dir, page)
  const links = langs.map(l => {
    const rel = posix.relative(from, posix.join('/', l.dir, page)) || '.'
    const current = l === lang ? ' aria-current="true"' : ''
    return `      <a href="${rel === '.' ? './' : rel + '/'}" hreflang="${l.code}" lang="${l.code}"${current}>${l.label}</a>`
  })
  const foot = [
    '<!-- i18n:langs -->',
    `    <nav class="langs" aria-label="${lang.langsLabel}">`,
    ...links,
    '    </nav>',
    '    <!-- /i18n:langs -->'
  ].join('\n')
  if (!html.includes('</head>') || !html.includes('    <p>© 2026')) problems.push(`${lang.code} ${page}: 넣을 자리가 없음`)
  return html.replace('</head>', `${head}\n</head>`).replace('    <p>© 2026', `    ${foot}\n    <p>© 2026`)
}

for (const page of PAGES) {
  const original = readFileSync(join(root, page, 'index.html'), 'utf8')
  const plain = original.replace(BLOCK, '')
  for (const lang of langs) {
    const html = inject(lang === source ? plain : translate(plain, lang, page), lang, page)
    const file = join(root, lang.dir, page, 'index.html')
    if (existsSync(file) && readFileSync(file, 'utf8') === html) continue
    changed.push(posix.join(lang.dir, page, 'index.html'))
    writes.push([file, html])
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
if (checkOnly && changed.length) {
  console.error(`언어 페이지가 최신이 아님(node dev/i18n.mjs): ${changed.join(', ')}`)
  process.exit(1)
}
// 문제가 하나라도 있으면 아무것도 쓰지 않습니다(반쯤 바뀐 언어 페이지가 남지 않게).
if (!checkOnly) for (const [file, html] of writes) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}
console.log(checkOnly ? '언어 페이지 최신' : `썼음: ${changed.join(', ') || '바뀐 것 없음'}`)
