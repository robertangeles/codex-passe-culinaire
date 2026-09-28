'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const FILM_DURATION = 128
const PORTRAIT_MAX_WIDTH = 760

type SaveDataConnection = {
  saveData?: boolean
}

type NavigatorWithConnection = Navigator & {
  connection?: SaveDataConnection
}

type Chapter = {
  at: number
  title: string
  description: string
  button: HTMLButtonElement
}

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds)
    ? Math.max(0, Math.min(FILM_DURATION, seconds))
    : 0

  return `${Math.floor(safeSeconds / 60)}:${String(Math.floor(safeSeconds % 60)).padStart(2, '0')}`
}

export function KitchenFilmPlayer({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const video = root.querySelector<HTMLVideoElement>('video[data-kitchen-video]')
    const stage = root.querySelector<HTMLElement>('[data-film-stage]')
    const poster = root.querySelector<HTMLElement>('[data-film-poster]')
    const controls = root.querySelector<HTMLElement>('[data-film-controls]')
    const playButton = root.querySelector<HTMLButtonElement>('button[data-film-play]')
    const seek = root.querySelector<HTMLInputElement>('input[data-film-seek]')
    const timeText = root.querySelector<HTMLSpanElement>('span[data-film-time]')
    const fullscreenButton = root.querySelector<HTMLButtonElement>('button[data-film-fullscreen]')
    const cinema = root.querySelector<HTMLElement>('[data-film-cinema]')
    const chapterList = root.querySelector<HTMLElement>('[data-film-chapters]')
    const chapterTitle = root.querySelector<HTMLElement>('h4[data-film-title]')
    const chapterDescription = root.querySelector<HTMLElement>('p[data-film-description]')
    const errorMessage = root.querySelector<HTMLElement>('[data-film-error]')

    if (
      !video || !stage || !poster || !controls || !playButton || !seek || !timeText ||
      !fullscreenButton || !cinema || !chapterList || !chapterTitle || !chapterDescription || !errorMessage
    ) return

    const chapters: Chapter[] = Array.from(
      chapterList.querySelectorAll<HTMLButtonElement>('button[data-film-at]'),
    )
      .map((button) => ({
        at: Number(button.dataset.filmAt),
        title: button.dataset.filmTitle ?? '',
        description: button.dataset.filmDescription ?? '',
        button,
      }))
      .filter((chapter) => Number.isFinite(chapter.at))
      .sort((first, second) => first.at - second.at)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as NavigatorWithConnection).connection
    const saveData = connection?.saveData === true
    const format = window.matchMedia(`(max-width: ${PORTRAIT_MAX_WIDTH}px)`).matches
      ? 'portrait'
      : 'landscape'

    stage.dataset.format = format
    video.muted = true
    video.playsInline = true
    video.preload = 'none'
    seek.min = '0'
    seek.max = String(FILM_DURATION)
    seek.step = '0.1'
    controls.hidden = false
    chapterList.hidden = false
    errorMessage.hidden = true

    let visible = false
    let sourceAttached = video.hasAttribute('src')
    let mediaFailed = false
    let manuallyPaused = false
    let resumeWhenVisible = false
    let automaticStartAttempted = false
    let pendingSeek: number | null = null
    let activeChapterIndex = -1

    const listeners: Array<() => void> = []
    const listen = (target: EventTarget, type: string, handler: EventListener) => {
      target.addEventListener(type, handler)
      listeners.push(() => target.removeEventListener(type, handler))
    }

    const updateChapter = (seconds: number) => {
      let nextIndex = -1
      for (let index = 0; index < chapters.length; index += 1) {
        if (seconds >= chapters[index].at) nextIndex = index
        else break
      }

      if (nextIndex < 0 || nextIndex === activeChapterIndex) return
      activeChapterIndex = nextIndex
      const chapter = chapters[nextIndex]
      chapterTitle.textContent = chapter.title
      chapterDescription.textContent = chapter.description

      chapters.forEach((item, index) => {
        if (index === nextIndex) item.button.setAttribute('aria-current', 'step')
        else item.button.removeAttribute('aria-current')
      })
    }

    const updateTime = (seconds: number) => {
      const safeSeconds = Number.isFinite(seconds)
        ? Math.max(0, Math.min(FILM_DURATION, seconds))
        : 0
      seek.value = String(safeSeconds)
      seek.setAttribute('aria-valuetext', `${formatTime(safeSeconds)} of ${formatTime(FILM_DURATION)}`)
      timeText.textContent = `${formatTime(safeSeconds)} / ${formatTime(FILM_DURATION)}`
      updateChapter(safeSeconds)
    }

    const updatePlayButton = () => {
      const playing = !video.paused && !video.ended
      const label = playing
        ? 'Pause the kitchen film'
        : video.ended
          ? 'Replay the kitchen film'
          : 'Play the kitchen film'
      playButton.textContent = playing ? 'Pause' : video.ended ? 'Replay' : 'Play'
      playButton.setAttribute('aria-label', label)
    }

    const attachSource = (manual: boolean) => {
      if (mediaFailed) return false
      const expectedSource = format === 'portrait'
        ? video.dataset.mobileSrc
        : video.dataset.desktopSrc
      if (!expectedSource) return false

      if (!sourceAttached) {
        video.poster = format === 'portrait' ? video.dataset.mobilePoster ?? '' : video.dataset.desktopPoster ?? ''
        video.preload = manual || reducedMotion.matches || saveData ? 'metadata' : 'auto'
        video.src = expectedSource
        video.load()
        sourceAttached = true
      }
      return true
    }

    const play = async (manual: boolean) => {
      if (mediaFailed || !attachSource(manual)) return
      if (manual) {
        automaticStartAttempted = true
        manuallyPaused = false
        resumeWhenVisible = false
      }
      if (video.ended || video.currentTime >= FILM_DURATION - 0.05) {
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) video.currentTime = 0
        else pendingSeek = 0
      }

      try {
        await video.play()
      } catch {
        updatePlayButton()
      }
    }

    const setTime = (seconds: number) => {
      const safeSeconds = Number.isFinite(seconds)
        ? Math.max(0, Math.min(FILM_DURATION, seconds))
        : 0
      manuallyPaused = true
      resumeWhenVisible = false
      video.pause()
      updateTime(safeSeconds)

      if (!attachSource(true)) return
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        video.currentTime = safeSeconds
        pendingSeek = null
      } else {
        pendingSeek = safeSeconds
      }
    }

    const tryAutomaticStart = () => {
      if (
        !visible || manuallyPaused || mediaFailed || document.hidden ||
        reducedMotion.matches || saveData || automaticStartAttempted
      ) return

      automaticStartAttempted = true
      void play(false)
    }

    const resumeIfAllowed = () => {
      if (!visible || document.hidden || reducedMotion.matches || mediaFailed || manuallyPaused) return
      if (resumeWhenVisible) {
        resumeWhenVisible = false
        void play(false)
      } else {
        tryAutomaticStart()
      }
    }

    const pauseForVisibility = () => {
      if (!video.paused && !video.ended && !manuallyPaused) resumeWhenVisible = true
      video.pause()
    }

    const handlePlayClick: EventListener = () => {
      if (video.paused || video.ended) void play(true)
      else {
        manuallyPaused = true
        resumeWhenVisible = false
        video.pause()
      }
    }

    const handleSeek: EventListener = () => setTime(Number(seek.value))

    const handleFullscreenClick: EventListener = async () => {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen()
        } catch {
          // Browsers may deny a fullscreen transition.
        }
      } else {
        try {
          await cinema.requestFullscreen()
        } catch {
          // Keep inline playback available if fullscreen is denied.
        }
      }
    }

    const handleFullscreenChange: EventListener = () => {
      const fullscreen = document.fullscreenElement === cinema
      fullscreenButton.textContent = fullscreen ? 'Exit full screen' : 'Full screen'
      fullscreenButton.setAttribute(
        'aria-label',
        fullscreen ? 'Exit full screen' : 'View the kitchen film full screen',
      )
    }

    const handleMetadata: EventListener = () => {
      if (pendingSeek !== null) {
        video.currentTime = pendingSeek
        pendingSeek = null
      }
      updateTime(video.currentTime)
    }

    const handleLoadedData: EventListener = () => {
      poster.hidden = true
      video.hidden = false
      video.classList.add('is-ready')
      controls.hidden = false
      chapterList.hidden = false
    }

    const handleMediaError: EventListener = () => {
      mediaFailed = true
      video.hidden = true
      poster.hidden = false
      errorMessage.hidden = false
      playButton.disabled = true
      seek.disabled = true
      fullscreenButton.disabled = true
      chapters.forEach(({ button }) => { button.disabled = true })
    }

    listen(playButton, 'click', handlePlayClick)
    listen(seek, 'input', handleSeek)
    listen(fullscreenButton, 'click', handleFullscreenClick)
    listen(document, 'fullscreenchange', handleFullscreenChange)
    listen(video, 'loadedmetadata', handleMetadata)
    listen(video, 'loadeddata', handleLoadedData)
    listen(video, 'error', handleMediaError)
    listen(video, 'timeupdate', () => updateTime(video.currentTime))
    listen(video, 'seeked', () => updateTime(video.currentTime))
    listen(video, 'play', updatePlayButton)
    listen(video, 'pause', updatePlayButton)
    listen(video, 'ended', () => {
      updateTime(FILM_DURATION)
      updatePlayButton()
      manuallyPaused = false
      resumeWhenVisible = false
    })
    listen(document, 'visibilitychange', () => {
      if (document.hidden) pauseForVisibility()
      else resumeIfAllowed()
    })
    listen(reducedMotion, 'change', () => {
      if (reducedMotion.matches) {
        manuallyPaused = true
        resumeWhenVisible = false
        video.pause()
      }
    })

    chapters.forEach(({ at, button }) => {
      // The opening frame of each chapter has transparent titles during its reveal.
      listen(button, 'click', () => setTime(at + 1))
    })

    const observer = new IntersectionObserver((entries) => {
      const entry = entries.find((item) => item.target === stage)
      if (!entry) return
      visible = entry.intersectionRatio >= 0.5
      if (visible) {
        if (!sourceAttached && !reducedMotion.matches && !saveData) attachSource(false)
        resumeIfAllowed()
      } else {
        pauseForVisibility()
      }
    }, { threshold: [0, 0.5, 1] })
    observer.observe(stage)

    updateTime(0)
    updatePlayButton()
    handleFullscreenChange(new Event('fullscreenchange'))

    return () => {
      observer.disconnect()
      listeners.forEach((removeListener) => removeListener())
      video.pause()
    }
  }, [])

  return <div ref={rootRef}>{children}</div>
}
