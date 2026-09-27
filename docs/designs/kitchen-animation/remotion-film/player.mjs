const video = document.querySelector('#kitchen-film')
const chapterButtons = [...document.querySelectorAll('.chapters [data-at]')]
const chapters = chapterButtons.map(button => ({
  at: Number(button.dataset.at),
  title: button.dataset.title,
  description: button.dataset.description
}))
const duration = Number(video.dataset.duration)
const poster = document.querySelector('#poster')
const stage = document.querySelector('#stage')
const playButton = document.querySelector('#play')
const seek = document.querySelector('#seek')
const cinema = document.querySelector('#cinema')
const fullscreenButton = document.querySelector('#fullscreen')
const controls = document.querySelector('.transport')
const durationText = `${Math.floor(duration / 60)} minute${Math.floor(duration / 60) === 1 ? '' : 's'} ${duration % 60} seconds`
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
  seek.setAttribute('aria-valuetext', `${formatTime(current)} of ${durationText}`)
  document.querySelector('#time').innerHTML = `${formatTime(current)} <span aria-hidden="true">/</span> ${formatTime(duration)}`
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
