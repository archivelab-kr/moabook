// 소개 페이지의 널브러진 사진 · 기기 화면 사진: 14×11칸 픽셀 풍경과 폴라로이드 틀.
// characters.js처럼 칸마다 rect를 찍는 SVG(shape-rendering="crispEdges")로 그립니다.

/** 풍경 색. 사진이라 라이트 · 다크에서 같고, 틀만 바뀝니다. */
const SKY = '#9fd6ff'
const CLOUD = '#ffffff'
const SUN = '#ffc93c'
const GRASS = '#7cc77f'
const GRASS_DARK = '#5fb36f'

/**
 * 풍경. rows는 14칸 × 11줄, '.'은 쓰지 않습니다(사진은 빈칸 없이 채움).
 */
export const SCENES = {
  sea: {
    name: '바다',
    palette: { s: SKY, w: CLOUD, y: SUN, d: '#2a7fc4', b: '#3d9fe0', f: '#e8f6ff', a: '#f2d27a' },
    rows: [
      'ssssssssssssss',
      'sssswwssssyyss',
      'sswwwwwsssyyss',
      'ssssssssssssss',
      'ssssssssssssss',
      'dddddddddddddd',
      'bbbbbbbbbbbbbb',
      'bbbfbbbbbbfbbb',
      'ffbbbbffbbbbff',
      'aaffaaaaffaaaa',
      'aaaaaaaaaaaaaa'
    ]
  },
  mountain: {
    name: '산',
    palette: { s: '#bfe3ff', w: CLOUD, m: '#6f7fa8', n: '#56648a', h: '#8fd18f', g: GRASS_DARK },
    rows: [
      'ssssssssssssss',
      'sssssssssswwss',
      'sssssswsssssss',
      'ssssswwwssssss',
      'ssssmwwmmsssss',
      'sssmmmmmmmssns',
      'ssmmmmmmmmmnnn',
      'smmmmmmmmmnnnn',
      'hhhhhhhhhhhhhh',
      'hhghhhhhghhhhh',
      'gggggggggggggg'
    ]
  },
  sunset: {
    name: '노을',
    palette: { l: '#c9b8ff', p: '#ff8fa8', o: '#ffcf8a', y: '#ffe9a8', v: '#7d7aff', d: '#5e5ce6' },
    rows: [
      'llllllllllllll',
      'llllllllllllll',
      'pppppppppppppp',
      'pppppyyyyppppp',
      'ooooyyyyyyoooo',
      'ooooyyyyyyoooo',
      'vvvvvvvvvvvvvv',
      'vvvvoyyyyovvvv',
      'dddddvoovddddd',
      'dddddddddddddd',
      'dddddddddddddd'
    ]
  },
  flower: {
    name: '꽃밭',
    palette: { s: '#bfe3ff', w: CLOUD, g: GRASS, k: GRASS_DARK, p: '#ff6b9a', y: SUN },
    rows: [
      'ssssssssssssss',
      'ssssssssssssss',
      'sswwssssssssss',
      'ssssssssssssss',
      'gggggggggggggg',
      'gpggggygggggpg',
      'pypggyyyggpypg',
      'gpgkggykgggpgk',
      'gkgkgggkgkgkgg',
      'kgkgkkgkgkgkkg',
      'kkkkkkkkkkkkkk'
    ]
  },
  city: {
    name: '밤 도시',
    palette: { n: '#2c3048', t: '#ffe08a', m: '#fff6d0', b: '#5e6ca8', c: '#45507f', l: SUN },
    rows: [
      'nnnnnnnnnnnmmn',
      'nntnnnnnnnnmmn',
      'nnnnnnntnnnnnn',
      'nnnbbnnnnnnnnn',
      'nnnblnnnccnnnn',
      'bbnbbnnnclnnbb',
      'blnblccncccnbl',
      'bbnbbclnclcnbb',
      'blbbbccbcccbbl',
      'bbblbclbclcblb',
      'bbbbbccbcccbbb'
    ]
  },
  tree: {
    name: '나무',
    palette: { s: '#a8dcff', w: CLOUD, l: '#2fb58f', k: '#1f8f6f', t: '#a86b3c', h: '#8fd18f', g: GRASS_DARK },
    rows: [
      'ssssssssssssss',
      'sssssllllsssss',
      'ssssllkllllsss',
      'sssllllllklsss',
      'sssklllllllsww',
      'ssssllkllllsss',
      'ssssssttssssss',
      'hhhhhhtthhhhhh',
      'hhhhhhtthhhhhh',
      'ghhhhhhhhhhhgh',
      'gggggggggggggg'
    ]
  }
}

export const SCENE_WIDTH = 14
export const SCENE_HEIGHT = 11

/** 폴라로이드 틀 색: 선 · 종이 · (다크) 스티커 테두리. 캐릭터와 같은 잉크색(moaInk) · 크림색(moaCream)입니다. */
const FRAME = {
  light: { line: '#26283A', paper: '#FFFBF2', edge: null },
  dark: { line: '#26283A', paper: '#EFE9DC', edge: '#FFFFFF' }
}

/**
 * 풍경을 SVG 문자열로.
 * frame이 true면 폴라로이드(선 1칸 · 종이 1칸, 아래 종이 3칸)를 두르고 둘레에 1칸(다크 스티커 테두리 자리)을 둡니다: 20×19칸.
 * frame이 false면 사진만 14×11칸입니다.
 * @param {string} id SCENES 이름
 * @param {{scheme?: 'light'|'dark', frame?: boolean}} options
 */
export function sceneSVG(id, { scheme = 'light', frame = true } = {}) {
  const scene = SCENES[id] || SCENES.sea
  const cells = []
  const put = (x, y, color) => cells.push({ x, y, color })
  const ox = frame ? 3 : 0
  const oy = frame ? 3 : 0
  scene.rows.forEach((row, y) => [...row].forEach((ch, x) => put(ox + x, oy + y, scene.palette[ch])))
  let width = SCENE_WIDTH
  let height = SCENE_HEIGHT
  if (frame) {
    const colors = FRAME[scheme] || FRAME.light
    width = SCENE_WIDTH + 6
    height = SCENE_HEIGHT + 8
    // 틀 안쪽(선 1칸 안): x 2..17, y 2..16 중 사진 자리를 뺀 곳이 종이
    for (let y = 2; y <= height - 3; y++) {
      for (let x = 2; x <= width - 3; x++) {
        const inPhoto = x >= ox && x < ox + SCENE_WIDTH && y >= oy && y < oy + SCENE_HEIGHT
        if (!inPhoto) put(x, y, colors.paper)
      }
    }
    // 선: 네 모서리 칸은 비워 둥글게
    const left = 1
    const right = width - 2
    const top = 1
    const bottom = height - 2
    for (let x = left + 1; x < right; x++) {
      put(x, top, colors.line)
      put(x, bottom, colors.line)
    }
    for (let y = top + 1; y < bottom; y++) {
      put(left, y, colors.line)
      put(right, y, colors.line)
    }
    if (colors.edge) {
      for (let x = left + 1; x < right; x++) {
        put(x, top - 1, colors.edge)
        put(x, bottom + 1, colors.edge)
      }
      for (let y = top + 1; y < bottom; y++) {
        put(left - 1, y, colors.edge)
        put(right + 1, y, colors.edge)
      }
      for (const [x, y] of [[left, top], [right, top], [left, bottom], [right, bottom]]) put(x, y, colors.edge)
    }
  }
  const byColor = new Map()
  for (const { x, y, color } of cells) {
    if (!byColor.has(color)) byColor.set(color, [])
    byColor.get(color).push(`<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`)
  }
  const parts = [...byColor].map(([color, rects]) => `<g fill="${color}">${rects.join('')}</g>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${parts.join('')}</svg>`
}
