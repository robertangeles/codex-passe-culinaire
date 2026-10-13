const FRAME_COLUMNS = 4;
const FRAME_ROWS = 4;
const FRAME_COUNT = FRAME_COLUMNS * FRAME_ROWS;
const FRAMES_PER_SECOND = 12;
const CYCLES = 4;
const DURATION = (FRAME_COUNT * CYCLES) / FRAMES_PER_SECOND;

const canvas = document.querySelector("#sprite-canvas");
const artwork = document.querySelector("#artwork");
const fallback = document.querySelector("#sprite-fallback");
const loadFallback = document.querySelector("#load-fallback");
const button = document.querySelector("#play-button");
const replayButton = document.querySelector("#replay-button");
const timeline = document.querySelector("#timeline");
const readout = document.querySelector("#time-readout");
const status = document.querySelector("#player-status");
const context = canvas.getContext("2d", { alpha: false });
const sprite = new Image();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let frameWidth = 0;
let frameHeight = 0;
let currentTime = 0;
let currentFrame = 0;
let playing = false;
let playbackIntent = !reducedMotion.matches;
let startedAt = 0;
let startOffset = 0;
let animationFrame = 0;
let visible = !("IntersectionObserver" in window);

timeline.max = String(DURATION);
document.querySelector(".player").hidden = false;
setPlaying(false);

function formatTime(seconds) {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

function updateReadout() {
  timeline.value = String(currentTime);
  readout.innerHTML = `${formatTime(currentTime)} <span aria-hidden="true">/</span> ${formatTime(DURATION)}`;
}

function drawFrame(frame) {
  if (!context || !frameWidth || !frameHeight) return;
  currentFrame = Math.max(0, Math.min(FRAME_COUNT - 1, frame));
  const sourceX = (currentFrame % FRAME_COLUMNS) * frameWidth;
  const sourceY = Math.floor(currentFrame / FRAME_COLUMNS) * frameHeight;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(sprite, sourceX, sourceY, frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);
}

function setPlaying(nextPlaying) {
  playing = nextPlaying;
  button.setAttribute("aria-pressed", String(playing));
  button.setAttribute("aria-label", playing ? "Pause movement study" : "Play movement study");
  status.textContent = playing ? "Playing" : currentTime >= DURATION ? "Study complete" : "Paused";
}

function stopClock() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  setPlaying(false);
}

function canPlay() {
  return playbackIntent && visible && !document.hidden && frameWidth > 0 && currentTime < DURATION;
}

function syncPlayback() {
  if (!canPlay()) {
    stopClock();
    return;
  }
  if (playing) return;
  startedAt = performance.now();
  startOffset = currentTime;
  setPlaying(true);
  animationFrame = requestAnimationFrame(tick);
}

function tick(now) {
  if (!playing) return;
  currentTime = Math.min(DURATION, startOffset + (now - startedAt) / 1000);
  if (currentTime >= DURATION) {
    currentTime = DURATION;
    drawFrame(FRAME_COUNT - 1);
    updateReadout();
    playbackIntent = false;
    stopClock();
    return;
  }
  const cycleTime = currentTime % (FRAME_COUNT / FRAMES_PER_SECOND);
  const frame = Math.floor(cycleTime * FRAMES_PER_SECOND);
  drawFrame(frame);
  updateReadout();
  animationFrame = requestAnimationFrame(tick);
}

function seek(seconds) {
  const nextTime = Math.max(0, Math.min(DURATION, Number(seconds) || 0));
  const wasPlaying = playing;
  currentTime = nextTime;
  if (nextTime >= DURATION) {
    playbackIntent = false;
    stopClock();
    drawFrame(FRAME_COUNT - 1);
  } else {
    drawFrame(Math.floor((nextTime % (FRAME_COUNT / FRAMES_PER_SECOND)) * FRAMES_PER_SECOND));
    if (wasPlaying) {
      startedAt = performance.now();
      startOffset = currentTime;
    }
  }
  updateReadout();
  syncPlayback();
}

function play() {
  if (currentTime >= DURATION) currentTime = 0;
  playbackIntent = true;
  drawFrame(Math.floor((currentTime % (FRAME_COUNT / FRAMES_PER_SECOND)) * FRAMES_PER_SECOND));
  updateReadout();
  syncPlayback();
}

function pause() {
  playbackIntent = false;
  stopClock();
}

button.addEventListener("click", () => {
  if (playbackIntent) pause();
  else play();
});

replayButton.addEventListener("click", () => {
  currentTime = 0;
  drawFrame(0);
  updateReadout();
  play();
});

timeline.addEventListener("input", () => seek(Number(timeline.value)));

document.addEventListener("visibilitychange", syncPlayback);
reducedMotion.addEventListener("change", (event) => {
  if (event.matches) pause();
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
    syncPlayback();
  }, { threshold: [0, 0.5, 1] });
  observer.observe(artwork);
}

sprite.addEventListener("load", () => {
  frameWidth = sprite.naturalWidth / FRAME_COLUMNS;
  frameHeight = sprite.naturalHeight / FRAME_ROWS;
  if (frameWidth !== frameHeight) {
    sprite.dispatchEvent(new Event("error"));
    return;
  }
  canvas.width = Math.ceil(frameWidth * 2);
  canvas.height = Math.ceil(frameHeight * 2);
  canvas.hidden = false;
  fallback.hidden = true;
  timeline.disabled = false;
  drawFrame(0);
  updateReadout();
  status.textContent = reducedMotion.matches ? "Paused for reduced motion" : "Ready";
  syncPlayback();
});

sprite.addEventListener("error", () => {
  canvas.hidden = true;
  fallback.hidden = true;
  loadFallback.hidden = false;
  timeline.disabled = true;
  button.disabled = true;
  replayButton.disabled = true;
  status.textContent = "Movement study unavailable";
});

sprite.src = "./sprite-sheet.png";

window.__humanMotion = {
  seek,
  play,
  pause,
  get time() { return currentTime; },
  get duration() { return DURATION; },
  get playing() { return playing; },
  get frame() { return currentFrame; },
  canvas,
};
