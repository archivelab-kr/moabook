// 앱(MoaBook)의 픽셀 캐릭터를 웹으로 옮긴 사본입니다. 이 파일 하나에만 둡니다.
// 원본: AppFactory/Apps/iOS/MoaBookApp/MoaBook/Targets/Sources/Presentation/Common/Character/
//   그림 · 색   Characters/MoaCharacter.swift, Characters/PhotoThingCharacters.swift
//   표정 규칙   Characters/StandardPixelCharacter.swift (StandardFace.apply)
//   소품       Model/CharacterAccessory.swift
//   색 값      Targets/Resources/Colors.xcassets (라이트 · 다크)
// 앱에서 그림이나 색을 바꾸면 여기도 손으로 맞춥니다.

/** Colors.xcassets 값. 다크 값이 없는 색은 라이트와 같습니다. */
const COLORS = {
  moaInk: { light: '#26283A', dark: '#26283A' },
  moaCream: { light: '#FFFBF2', dark: '#EFE9DC' },
  primary1: { light: '#007AFF', dark: '#0A84FF' },
  primary2: { light: '#FF3B30', dark: '#FF453A' },
  accentPink: { light: '#FF6B9A', dark: '#FF7FAA' },
  accentYellow: { light: '#FFC93C', dark: '#FFD25A' },
  accentMint: { light: '#2FB58F', dark: '#3CCB9F' },
  accentLilac: { light: '#9B7BFF', dark: '#A98CFF' },
  charCloud: { light: '#E8EAF2', dark: '#E8EAF2' },
  charPeach: { light: '#FFD9B8', dark: '#FFD9B8' },
  charSky: { light: '#BFE3FF', dark: '#BFE3FF' },
  charSteel: { light: '#9AA0B0', dark: '#9AA0B0' },
  propBrown: { light: '#A86B3C', dark: '#A86B3C' },
  propOrange: { light: '#F28A3A', dark: '#F28A3A' },
  propStraw: { light: '#F2D27A', dark: '#F2D27A' },
  white: { light: '#FFFFFF', dark: '#FFFFFF' },
  systemGray3: { light: '#C7C7CC', dark: '#48484A' }
}

/** 글자 → 색 이름 표를 라이트 · 다크 hex 표로 */
function paletteOf(names) {
  const out = { light: {}, dark: {} }
  for (const [ch, name] of Object.entries(names)) {
    out.light[ch] = COLORS[name].light
    out.dark[ch] = COLORS[name].dark
  }
  return out
}

/**
 * 다섯 캐릭터. rows는 기쁨 표정의 기본 그림(12×12), '.'은 빈칸입니다.
 * theme은 앱의 대표 색(theme<캐릭터>, 모아는 primary1)입니다.
 */
export const CHARACTERS = [
  {
    id: 'moa',
    name: '모아',
    kind: '앨범 책',
    theme: { light: '#007AFF', dark: '#0A84FF' },
    rows: [
      '.kkkkkkkkkk.',
      '.kcccccbbck.',
      '.kcccccbbck.',
      '.kccccccbck.',
      '.kcccccccck.',
      '.kckcccckck.',
      '.kcccccccck.',
      '.kpcckkccpk.',
      'kkcccccccckk',
      '.kcccccccck.',
      '.kkkkkkkkkk.',
      '..kk....kk..'
    ],
    palette: paletteOf({ k: 'moaInk', c: 'moaCream', b: 'primary1', p: 'accentPink' })
  },
  {
    id: 'chalkak',
    name: '찰칵',
    kind: '카메라',
    theme: { light: '#5E5CE6', dark: '#7D7AFF' },
    rows: [
      '...kkkk.....',
      '..kgwgk.kbk.',
      '.kkkkkkkkkk.',
      '.kggggggggk.',
      '.kcccccccck.',
      '.kckcccckck.',
      '.kcccccccck.',
      '.kpcckkccpk.',
      'kkcccccccckk',
      '.kcccccccck.',
      '.kkkkkkkkkk.',
      '..kk....kk..'
    ],
    palette: paletteOf({ k: 'moaInk', c: 'charCloud', w: 'white', g: 'charSteel', b: 'primary2', p: 'accentPink' }),
    anchors: { headTop: [5, 0], headCorner: [2, 1] }
  },
  {
    id: 'pola',
    name: '폴라',
    kind: '즉석 사진',
    theme: { light: '#1D9BD8', dark: '#1D9BD8' },
    rows: [
      '.kkkkkkkkkk.',
      '.kwwwwwwwwk.',
      '.kwybbbbbwk.',
      '.kwbbbbbbwk.',
      '.kwbbbbbbwk.',
      '.kwkbbbbkwk.',
      '.kwbbbbbbwk.',
      '.kwpbkkbpwk.',
      'kkwwwwwwwwkk',
      '.kwwwwwwwwk.',
      '.kkkkkkkkkk.',
      '..kk....kk..'
    ],
    palette: paletteOf({ k: 'moaInk', w: 'white', y: 'accentYellow', b: 'charSky', p: 'accentPink' })
  },
  {
    id: 'rolly',
    name: '롤리',
    kind: '필름 통',
    theme: { light: '#E07800', dark: '#E07800' },
    rows: [
      '....kkkk....',
      '.kkkkggkkkk.',
      '.kggggggggk.',
      '.kbbbbbbbbk.',
      '.kcccccccck.',
      '.kckcccckck.',
      '.kcccccccck.',
      '.kpcckkccpk.',
      'kkcccccccckk',
      '.kggggggggk.',
      '.kkkkkkkkkk.',
      '..kk....kk..'
    ],
    palette: paletteOf({ k: 'moaInk', g: 'charSteel', c: 'accentYellow', b: 'primary1', p: 'accentPink' })
  },
  {
    id: 'nyang',
    name: '냥이',
    kind: '고양이',
    theme: { light: '#12A58A', dark: '#12A58A' },
    rows: [
      '.kk......kk.',
      '.kpk....kpk.',
      '.kckkkkkkck.',
      '.kcccccccck.',
      '.kcccccccck.',
      '.kckcccckck.',
      '.kcccccccck.',
      '.kpcckkccpk.',
      'kkcccccccckk',
      '.kbbbbbbbbk.',
      '.kkkkkkkkkk.',
      '..kk....kk..'
    ],
    palette: paletteOf({ k: 'moaInk', c: 'charPeach', b: 'accentMint', p: 'accentPink' }),
    anchors: { headTop: [5, 2], headCorner: [3, 2] }
  }
]

/** 앱 CharacterMood 순서 */
export const MOODS = ['happy', 'cheer', 'sleepy', 'wow', 'worried']

/** StandardPixelCharacter의 기본 소품 자리(x, y) */
const DEFAULT_ANCHORS = {
  headTop: [5, 0],
  headCorner: [2, 0],
  rightHand: [12, 8],
  neck: [1, 9],
  besideHead: [11, -1]
}

/** 소품(마무리 장면에서 몇 개만 씌움). pivot 칸이 캐릭터의 anchor 자리에 옵니다. */
export const ACCESSORIES = {
  partyHat: {
    name: '파티 모자',
    anchor: 'headTop',
    pivot: [2, 5],
    rows: ['..w..', '..y..', '.ypy.', '.yyy.', 'ypypy', 'yyyyy'],
    palette: paletteOf({ w: 'white', y: 'accentYellow', p: 'accentPink' })
  },
  crown: {
    name: '왕관',
    anchor: 'headTop',
    pivot: [3, 3],
    rows: ['y..yy..y', 'yy.yy.yy', 'yyyyyyyy', 'yryyyyry'],
    palette: paletteOf({ y: 'accentYellow', r: 'primary2' })
  },
  ribbon: {
    name: '리본',
    anchor: 'headTop',
    pivot: [2, 2],
    rows: ['p...p', 'ppkpp', 'p...p'],
    palette: paletteOf({ p: 'accentPink', k: 'moaInk' })
  },
  strawHat: {
    name: '밀짚모자',
    anchor: 'headTop',
    pivot: [5, 2],
    rows: ['...hhhhhh...', '...hrrrrh...', 'hhhhhhhhhhhh'],
    palette: paletteOf({ h: 'propStraw', r: 'accentPink' })
  },
  flower: {
    name: '꽃',
    anchor: 'headCorner',
    pivot: [1, 2],
    rows: ['.p.', 'pyp', '.p.'],
    palette: paletteOf({ p: 'accentPink', y: 'accentYellow' })
  },
  heart: {
    name: '하트',
    anchor: 'rightHand',
    pivot: [0, 1],
    rows: ['pp.pp', 'pwppp', 'ppppp', '.ppp.', '..p..'],
    palette: paletteOf({ p: 'accentPink', w: 'white' })
  },
  camera: {
    name: '카메라',
    anchor: 'rightHand',
    pivot: [0, 2],
    rows: ['.kk..r', 'kkkkkk', 'kgwkgk', 'kgkkgk', 'kkkkkk'],
    palette: paletteOf({ k: 'moaInk', g: 'systemGray3', w: 'white', r: 'primary2' })
  },
  scarf: {
    name: '목도리',
    anchor: 'neck',
    pivot: [0, 0],
    rows: ['rrrrrrrrrr', '.......rr.', '.......rr.'],
    palette: paletteOf({ r: 'primary2' })
  },
  sun: {
    name: '해',
    anchor: 'besideHead',
    pivot: [0, 4],
    rows: ['y.y.y', '.yyy.', 'yyyyy', '.yyy.', 'y.y.y'],
    palette: paletteOf({ y: 'accentYellow' })
  }
}

/**
 * StandardFace.apply를 한 줄씩 옮김. 기쁨(기본 그림)에서 눈 · 입 · 팔 칸만 바꿉니다.
 * @param {string[]} rows 기본 그림
 * @param {string} mood MOODS 중 하나
 * @param {boolean} blinking 깜빡이는 중인지
 * @returns {string[]} 새 그림(원본은 그대로)
 */
export function applyFace(rows, mood, blinking) {
  const grid = rows.map(r => r.split(''))
  const set = (x, y, ch) => { grid[y][x] = ch }
  const closeEyes = () => {
    grid[5][4] = 'k'
    grid[5][7] = 'k'
  }
  switch (mood) {
    case 'cheer':
      // 두 팔을 머리 옆으로 들고 입을 크게 벌립니다.
      set(0, 2, 'k'); set(11, 2, 'k')
      set(0, 8, '.'); set(11, 8, '.')
      set(4, 7, 'k'); set(7, 7, 'k')
      set(4, 8, 'k'); set(5, 8, 'p'); set(6, 8, 'p'); set(7, 8, 'k')
      set(5, 9, 'k'); set(6, 9, 'k')
      break
    case 'sleepy':
      closeEyes()
      break
    case 'wow':
      // 눈이 커지고 입이 동그래집니다.
      set(3, 4, 'k'); set(8, 4, 'k')
      set(4, 8, 'k'); set(5, 8, 'p'); set(6, 8, 'p'); set(7, 8, 'k')
      set(5, 9, 'k'); set(6, 9, 'k')
      break
    case 'worried':
      // 입꼬리가 내려갑니다.
      set(4, 8, 'k'); set(7, 8, 'k')
      break
    default:
      break
  }
  if (blinking && mood !== 'sleepy') {
    grid[4] = rows[4].split('')
    closeEyes()
  }
  return grid.map(r => r.join(''))
}

/** 다크 모드 스티커 테두리(앱 CharacterView.stickerEdge: 흰색 55%) */
const STICKER_EDGE = 'rgba(255,255,255,0.55)'

/** 몸 + 소품을 칸 목록으로 합칩니다(몸 왼쪽 위가 0,0). 뒤에 놓인 것이 위에 그려집니다. */
function cellsOf(character, mood, blinking, scheme, accessories) {
  const cells = new Map()
  const put = (x, y, color) => cells.set(`${x},${y}`, { x, y, color })
  applyFace(character.rows, mood, blinking).forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      if (ch !== '.') put(x, y, character.palette[scheme][ch])
    })
  })
  for (const id of accessories) {
    const acc = ACCESSORIES[id]
    if (!acc) continue
    const [ax, ay] = (character.anchors && character.anchors[acc.anchor]) || DEFAULT_ANCHORS[acc.anchor]
    const ox = ax - acc.pivot[0]
    const oy = ay - acc.pivot[1]
    acc.rows.forEach((row, y) => {
      ;[...row].forEach((ch, x) => {
        if (ch !== '.') put(ox + x, oy + y, acc.palette[scheme][ch])
      })
    })
  }
  return cells
}

/** 채운 칸과 상하좌우로 맞닿은 빈칸(PixelSprite.outlineCells) */
function outlineOf(cells) {
  const out = new Map()
  for (const { x, y } of cells.values()) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${x + dx},${y + dy}`
      if (!cells.has(key)) out.set(key, { x: x + dx, y: y + dy })
    }
  }
  return [...out.values()]
}

/**
 * 캐릭터를 SVG 문자열로. 틀은 몸 12칸 + 둘레 1칸(다크 스티커 테두리 자리) = 14칸입니다.
 * 소품은 앱처럼 몸 크기를 바꾸지 않고 틀 밖으로 넘쳐 그립니다(overflow: visible).
 * @param {object} character CHARACTERS의 한 항목
 * @param {{mood?: string, blinking?: boolean, scheme?: 'light'|'dark', accessories?: string[], title?: string}} options
 */
export function toSVG(character, { mood = 'happy', blinking = false, scheme = 'light', accessories = [], title } = {}) {
  const cells = cellsOf(character, mood, blinking, scheme, accessories)
  const rect = (x, y, fill) => `<rect x="${x + 1}" y="${y + 1}" width="1.02" height="1.02" fill="${fill}"/>`
  const parts = []
  if (scheme === 'dark') {
    parts.push(`<g class="edge" fill="${STICKER_EDGE}">`)
    for (const { x, y } of outlineOf(cells)) parts.push(`<rect x="${x + 1}" y="${y + 1}" width="1.02" height="1.02"/>`)
    parts.push('</g>')
  }
  // 같은 색 칸을 한 묶음으로 두어 SVG를 짧게 합니다.
  const byColor = new Map()
  for (const { x, y, color } of cells.values()) {
    if (!byColor.has(color)) byColor.set(color, [])
    byColor.get(color).push(rect(x, y, color).replace(/ fill="[^"]+"/, ''))
  }
  for (const [color, rects] of byColor) parts.push(`<g fill="${color}">${rects.join('')}</g>`)
  const label = title ? `<title>${title}</title>` : ''
  const aria = title ? 'role="img"' : 'aria-hidden="true" focusable="false"'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" shape-rendering="crispEdges" overflow="visible" ${aria}>${label}${parts.join('')}</svg>`
}

/** id로 찾기 */
export function characterById(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0]
}
