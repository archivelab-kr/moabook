// 캐릭터 그리기와 움직임. 세 페이지가 함께 씁니다.
// 글과 버튼은 HTML에 있으므로 이 파일이 없어도 읽을 수 있고, 캐릭터만 빠집니다.
import { MOODS, characterById, toSVG } from './characters.js'
import { sceneSVG } from './scenes.js'

const root = document.documentElement
root.classList.add('js')

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
const darkScheme = matchMedia('(prefers-color-scheme: dark)')
const scheme = () => root.dataset.theme || (darkScheme.matches ? 'dark' : 'light')

// 캐릭터 그리기 -------------------------------------------------------------

/** @type {Map<HTMLElement, {mood: string, base: string, blinking: boolean}>} */
const states = new Map()

function draw(el) {
  const state = states.get(el)
  const character = characterById(el.dataset.char)
  const accessories = (el.dataset.acc || '').split(',').filter(Boolean)
  el.innerHTML = toSVG(character, { mood: state.mood, blinking: state.blinking, scheme: scheme(), accessories })
}

function mount(el) {
  const size = Number(el.dataset.size || 84)
  el.style.setProperty('--size', `${size}px`)
  el.setAttribute('aria-hidden', 'true')
  const mood = el.dataset.mood || 'happy'
  states.set(el, { mood, base: mood, blinking: false })
  draw(el)
}

/** 다른 표정으로 바꿔 그립니다(마무리 장면에서 고른 친구 등). */
export function setMood(el, mood, { asBase = false } = {}) {
  const state = states.get(el)
  if (!state) return
  state.mood = mood
  if (asBase) state.base = mood
  draw(el)
}

document.querySelectorAll('.char[data-char]').forEach(mount)

// 픽셀 사진(널브러진 폴라로이드 · 기기 화면 사진). data-flat이면 틀 없이 사진만 그립니다.
const snaps = [...document.querySelectorAll('.snap[data-scene]')]
const drawSnaps = () => snaps.forEach(el => {
  el.innerHTML = sceneSVG(el.dataset.scene, { scheme: scheme(), frame: el.dataset.flat === undefined })
})
drawSnaps()

darkScheme.addEventListener('change', () => {
  states.forEach((_, el) => draw(el))
  drawSnaps()
})

// 깜빡임: 캐릭터마다 2~5초 무작위 간격, 120ms ---------------------------------

function scheduleBlink(el) {
  const wait = 2000 + Math.random() * 3000
  setTimeout(() => {
    const state = states.get(el)
    if (!reduceMotion.matches && state.mood !== 'sleepy' && !document.hidden) {
      state.blinking = true
      draw(el)
      setTimeout(() => {
        state.blinking = false
        draw(el)
      }, 120)
    }
    scheduleBlink(el)
  }, wait)
}
states.forEach((_, el) => {
  if (el.dataset.still === undefined) scheduleBlink(el)
})

// 누르면 다음 표정, 0.8초 뒤 원래 표정 --------------------------------------

for (const button of document.querySelectorAll('.char-btn')) {
  const el = button.querySelector('.char[data-char]')
  if (!el || button.dataset.pick) continue
  let timer
  button.addEventListener('click', () => {
    const state = states.get(el)
    const next = MOODS[(MOODS.indexOf(state.mood) + 1) % MOODS.length]
    setMood(el, next === state.base ? MOODS[(MOODS.indexOf(next) + 1) % MOODS.length] : next)
    clearTimeout(timer)
    timer = setTimeout(() => setMood(el, state.base), 800)
  })
}

// 말풍선 등장 ---------------------------------------------------------------

const pops = document.querySelectorAll('.bubble[data-pop]')
if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  pops.forEach(b => b.classList.add('is-in'))
} else {
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-in')
      io.unobserve(entry.target)
    }
  }, { threshold: 0.6 })
  pops.forEach(b => io.observe(b))
}

// 마무리: 친구 고르기 --------------------------------------------------------

const picker = document.querySelector('[data-picker]')
if (picker) {
  const buttons = [...picker.querySelectorAll('[data-pick]')]
  const bubble = picker.querySelector('[data-pick-bubble]')
  const who = bubble.querySelector('.who')
  const line = bubble.querySelector('[data-pick-line]')
  const cta = picker.querySelector('[data-pick-cta]')
  const ctaLabel = cta.querySelector('[data-pick-label]')

  const choose = (button, { animate = true } = {}) => {
    for (const b of buttons) {
      const selected = b === button
      b.setAttribute('aria-pressed', String(selected))
      const el = b.querySelector('.char[data-char]')
      setMood(el, selected ? 'cheer' : 'happy', { asBase: true })
    }
    const color = getComputedStyle(button).getPropertyValue('--theme').trim()
    picker.style.setProperty('--theme', color)
    // 이름 · 대사 · 버튼 글은 HTML에 언어별로 있습니다(dev/i18n.mjs가 옮김).
    who.textContent = button.querySelector('.pick-name').textContent
    line.textContent = button.dataset.line
    ctaLabel.textContent = button.dataset.cta
    // 말풍선 꼬리를 고른 친구 쪽으로
    const tail = button.offsetLeft + button.offsetWidth / 2 - bubble.offsetLeft - 6
    bubble.style.setProperty('--tail', `${Math.max(16, Math.min(tail, bubble.offsetWidth - 24))}px`)
    if (animate && !reduceMotion.matches) {
      bubble.classList.remove('is-in')
      void bubble.offsetWidth
      bubble.classList.add('is-in')
      cta.classList.remove('nudge')
      void cta.offsetWidth
      cta.classList.add('nudge')
    }
  }

  buttons.forEach(b => b.addEventListener('click', () => choose(b)))
  choose(buttons[0], { animate: false })
  addEventListener('resize', () => {
    const current = buttons.find(b => b.getAttribute('aria-pressed') === 'true')
    if (current) choose(current, { animate: false })
  })
}
