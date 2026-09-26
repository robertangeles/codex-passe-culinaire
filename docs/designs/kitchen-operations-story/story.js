const chapters = [...document.querySelectorAll('[data-chapter]')]
const steps = [...document.querySelectorAll('[data-step]')]
const illustration = document.querySelector('#kitchen')
const progress = document.querySelector('#progress')
const previous = document.querySelector('#previous')
const next = document.querySelector('#next')
const replay = document.querySelector('#replay')
const names = ['Before opening', 'The delivery', 'Mise en place', 'Service', 'At the close']
const captions = [
  'It begins with a dish, its ingredients and a plan for the day.',
  'Ten kilos received. The order and the delivery tell different stories.',
  'Six kilos to pastry. Four in storage. The work has a place.',
  'A prepared section. A shared handover. The team brings it together.',
  'The day leaves a record. Tomorrow begins with a better question.',
]
const mobile = matchMedia('(max-width: 740px)')
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
let current = 0
let transferTimer

function updateDrawing(transfer = false) {
  const root = illustration.contentDocument?.documentElement
  if (!root || root.tagName.toLowerCase() !== 'svg') return
  clearTimeout(transferTimer)
  const crate = root.querySelector('#transfer-crate')
  crate?.classList.remove('transfer-active')
  root.dataset.stage = String(current)
  const mobileViews = ['200 110 520 390', '20 105 520 390', '120 105 700 525', '640 100 460 345', '740 240 340 255']
  root.setAttribute('viewBox', mobile.matches ? mobileViews[current] : '0 0 1100 640')
  if (transfer && !reducedMotion.matches) {
    // Restart the one-shot CSS demonstration only after explicit chapter navigation or replay.
    void root.getBoundingClientRect()
    crate?.classList.add('transfer-active')
    replay.textContent = 'Replay receiving → prep'
    transferTimer = setTimeout(() => crate?.classList.remove('transfer-active'), 1400)
  }
}

function showChapter(index, transfer = false) {
  current = Math.max(0, Math.min(chapters.length - 1, index))
  chapters.forEach((chapter, i) => { chapter.hidden = i !== current })
  steps.forEach((step, i) => {
    if (i === current) step.setAttribute('aria-current', 'step')
    else step.removeAttribute('aria-current')
  })
  previous.disabled = current === 0
  next.disabled = current === chapters.length - 1
  next.textContent = current === chapters.length - 1 ? 'End of the working day' : `${names[current + 1]} →`
  progress.textContent = `Chapter ${current + 1} of ${chapters.length} · ${names[current]}`
  document.querySelector('#scene-time').textContent = names[current]
  document.querySelector('#scene-caption').textContent = captions[current]
  updateDrawing(transfer)
}
steps.forEach((step, index) => {
  step.addEventListener('click', () => showChapter(index, current === 1 && index === 2))
  step.addEventListener('keydown', event => {
    let target
    if (event.key === 'ArrowRight') target = Math.min(steps.length - 1, index + 1)
    else if (event.key === 'ArrowLeft') target = Math.max(0, index - 1)
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = steps.length - 1
    else return
    event.preventDefault()
    steps[target].focus()
    showChapter(target, current === 1 && target === 2)
  })
})
previous.addEventListener('click', () => showChapter(current - 1))
next.addEventListener('click', () => showChapter(current + 1, current === 1))
replay.addEventListener('click', () => showChapter(2, true))
illustration.addEventListener('load', () => updateDrawing())
mobile.addEventListener('change', () => updateDrawing())
reducedMotion.addEventListener('change', () => updateDrawing())
document.documentElement.classList.add('enhanced')
document.querySelector('.chapters').hidden = false
document.querySelector('.story-controls').hidden = false
replay.hidden = false
showChapter(0)
