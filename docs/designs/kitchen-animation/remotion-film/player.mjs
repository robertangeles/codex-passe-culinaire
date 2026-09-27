const chapters = [
  { at: 0, title: 'Before the first knife.', description: 'The chef and owner look ahead to service. Expected covers and the preparation plan shape what the team will make.' },
  { at: 6, title: 'Begin with the day ahead.', description: 'Forecast covers, recipe yields and menu costs help the chef decide what to prepare.' },
  { at: 14, title: 'From pantry to section.', description: 'Ingredients are drawn from the pantry for mise en place, with a record of what moves to the section.' },
  { at: 22, title: 'The work behind the plate.', description: 'Pears are weighed and prepared for a batch. Recipe quantities connect the ingredients to the dishes.' },
  { at: 32, title: 'Preparation becomes service.', description: 'The team finishes the tart and brings its preparation through to the pass.' },
  { at: 38, title: 'Account for what was used.', description: 'Record what went into the recipe, what usable stock returned and what preparation waste remained.' },
  { at: 46, title: 'Receive what actually arrives.', description: 'Inspect the delivery against the purchase order and record any shortage.' },
  { at: 54, title: 'A team with the same picture.', description: 'Review the roster, section responsibilities and the handover for service.' },
  { at: 62, title: 'Close the day with the facts.', description: 'Upload sales data and compare the service with the preparation plan.' },
  { at: 72, title: 'One kitchen. The whole picture.', description: 'Review purchasing, stock, preparation, waste, people and sales before planning tomorrow.' }
]
const duration = 80
const video = document.querySelector('#kitchen-film')
const poster = document.querySelector('#poster')
const stage = document.querySelector('#stage')
const playButton = document.querySelector('#play')
const seek = document.querySelector('#seek')
const cinema = document.querySelector('#cinema')
const fullscreenButton = document.querySelector('#fullscreen')
const controls = document.querySelector('.transport')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const autoplayAllowed = !new URLSearchParams(location.search).has('paused')
let activeChapter = -1
let manuallyPaused = false
let hasStarted = false
let resumeWhenVisible = false
let isVisible = false
let failed = false

const portrait = matchMedia('(max-width: 760px)').matches
stage.dataset.format = portrait ? 'portrait' : 'landscape'
video.poster = portrait ? 'poster-mobile.jpg' : 'poster.jpg'
video.src = portrait ? 'kitchen-day-mobile.mp4' : 'kitchen-day.mp4'
video.muted = true

function formatTime(seconds) {
  const safe = Math.max(0, Math.min(duration, seconds))
  return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, '0')}`
}

function update(time) {
  const current = Math.max(0, Math.min(duration, time))
  const chapterIndex = Math.max(0, chapters.findLastIndex(chapter => current >= chapter.at))
  if (chapterIndex !== activeChapter) {
    activeChapter = chapterIndex
    const chapter = chapters[chapterIndex]
    document.querySelector('#chapter-title').textContent = chapter.title
    document.querySelector('#chapter-body').textContent = chapter.description
    document.querySelectorAll('[data-at]').forEach((button, index) => {
      if (index === chapterIndex) button.setAttribute('aria-current', 'step')
      else button.removeAttribute('aria-current')
    })
  }
  seek.value = String(current)
  seek.setAttribute('aria-valuetext', `${formatTime(current)} of 1 minute 20 seconds`)
  document.querySelector('#time').innerHTML = `${formatTime(current)} <span aria-hidden="true">/</span> 1:20`
}

function updatePlayControl() {
  const isPlaying = !video.paused && !video.ended
  const label = isPlaying ? 'Pause the kitchen film' : video.ended ? 'Replay the kitchen film' : 'Play the kitchen film'
  playButton.textContent = isPlaying ? 'Pause' : video.ended ? 'Replay' : 'Play'
  playButton.setAttribute('aria-label', label)
}

async function start() {
  if (failed) return
  hasStarted = true
  if (video.ended || video.currentTime >= duration - 0.05) video.currentTime = 0
  try {
    await video.play()
  } catch {
    updatePlayControl()
  }
}

function pauseForVisibility() {
  if (!video.paused && !video.ended && !manuallyPaused) resumeWhenVisible = true
  video.pause()
}

function resumeIfAllowed() {
  if (isVisible && (!hasStarted || resumeWhenVisible) && !manuallyPaused && !document.hidden && autoplayAllowed && !reducedMotion.matches && !failed) {
    resumeWhenVisible = false
    void start()
  }
}

playButton.addEventListener('click', () => {
  if (video.paused || video.ended) {
    manuallyPaused = false
    resumeWhenVisible = false
    void start()
  } else {
    manuallyPaused = true
    resumeWhenVisible = false
    video.pause()
  }
})

seek.addEventListener('input', () => {
  manuallyPaused = true
  resumeWhenVisible = false
  video.pause()
  video.currentTime = Number(seek.value)
  update(video.currentTime)
})

document.querySelectorAll('[data-at]').forEach(button => {
  button.addEventListener('click', () => {
    manuallyPaused = true
    resumeWhenVisible = false
    video.pause()
    video.currentTime = Number(button.dataset.at)
    update(video.currentTime)
    stage.scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'auto' : 'smooth' })
  })
})

fullscreenButton.addEventListener('click', async () => {
  if (!document.fullscreenElement && cinema.requestFullscreen) {
    try { await cinema.requestFullscreen() } catch { /* Fullscreen can be denied by the browser. */ }
  } else if (document.fullscreenElement && document.exitFullscreen) {
    try { await document.exitFullscreen() } catch { /* Keep native playback available if exit is denied. */ }
  }
})

document.addEventListener('fullscreenchange', () => {
  const fullscreen = Boolean(document.fullscreenElement)
  fullscreenButton.textContent = fullscreen ? 'Exit full screen' : 'Full screen'
  fullscreenButton.setAttribute('aria-label', fullscreen ? 'Exit full screen' : 'View the film full screen')
})

for (const event of ['play', 'pause', 'ended']) video.addEventListener(event, updatePlayControl)
for (const event of ['timeupdate', 'seeked', 'loadedmetadata']) video.addEventListener(event, () => update(video.currentTime))
video.addEventListener('ended', () => update(duration))

video.addEventListener('loadeddata', () => {
  poster.hidden = true
  video.classList.add('is-ready')
  controls.hidden = false
  document.querySelector('.chapters').hidden = false
  resumeIfAllowed()
})

video.addEventListener('error', () => {
  failed = true
  video.hidden = true
  poster.hidden = false
  document.querySelector('#film-fallback').hidden = false
  playButton.disabled = true
  seek.disabled = true
  fullscreenButton.disabled = true
  document.querySelectorAll('[data-at]').forEach(button => { button.disabled = true })
})

new IntersectionObserver(entries => {
  isVisible = entries[0].intersectionRatio >= 0.5
  if (!isVisible) pauseForVisibility()
  else resumeIfAllowed()
}, { threshold: [0, 0.5, 1] }).observe(stage)

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseForVisibility()
  else resumeIfAllowed()
})

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    resumeWhenVisible = false
    manuallyPaused = true
    video.pause()
  }
})

update(0)
updatePlayControl()
window.__filmAPI = {
  video,
  duration,
  get time() { return video.currentTime },
  get playing() { return !video.paused && !video.ended },
  seek(time) {
    manuallyPaused = true
    resumeWhenVisible = false
    video.pause()
    video.currentTime = Math.max(0, Math.min(duration, time))
    update(video.currentTime)
  },
  play() {
    manuallyPaused = false
    resumeWhenVisible = false
    return start()
  },
  pause() {
    manuallyPaused = true
    resumeWhenVisible = false
    video.pause()
  }
}
window.__film = window.__filmAPI
