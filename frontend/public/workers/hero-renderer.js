/**
 * Hero frame renderer — off-thread image decoding and compositing.
 *
 * Architecture: worker maintains its own internal OffscreenCanvas for rendering.
 * Each painted frame is transferred back to the main thread as an ImageBitmap
 * (zero-copy GPU texture transfer) for display via ImageBitmapRenderingContext.
 *
 * This avoids canvas.transferControlToOffscreen() entirely, which causes
 * React StrictMode double-mount failures.
 *
 * Protocol (postMessage):
 *   main  → worker  { type:'init',       width, height, manifest }
 *   main  → worker  { type:'frame',      index }
 *   main  → worker  { type:'resize',     width, height }
 *   main  → worker  { type:'visibility', visible }
 *   main  → worker  { type:'destroy' }
 *   worker → main   { type:'frame_bitmap', bitmap: ImageBitmap }  [transferable]
 */
'use strict'

const TOTAL_RAW_FRAMES = 600
const FRAME_STEP = 4
const FRAME_COUNT = Math.floor(TOTAL_RAW_FRAMES / FRAME_STEP) // 150
const FRAMES_PER_SHEET = 25
const SHEET_COUNT = Math.ceil(FRAME_COUNT / FRAMES_PER_SHEET) // 6

let offscreen = null // internal OffscreenCanvas — never leaves the worker
let ctx = null
let manifest = null
let currentFrame = 0
let isActive = true

const sheets = new Array(SHEET_COUNT).fill(null)
const lowres = new Array(FRAME_COUNT).fill(null)

const getRaw = (i) => Math.min(TOTAL_RAW_FRAMES, i * FRAME_STEP + 1)
const pad = (n) => String(n).padStart(4, '0')

const nearestLowres = (target) => {
  if (lowres[target]) return lowres[target]
  for (let off = 1; off < FRAME_COUNT; off++) {
    if (target - off >= 0 && lowres[target - off]) return lowres[target - off]
    if (target + off < FRAME_COUNT && lowres[target + off]) return lowres[target + off]
  }
  return null
}

const drawCoverFit = (src, sx, sy, sw, sh) => {
  const { width: w, height: h } = offscreen
  const ratio = Math.max(w / sw, h / sh)
  const dx = (w - sw * ratio) / 2
  const dy = (h - sh * ratio) / 2
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(src, sx, sy, sw, sh, dx, dy, sw * ratio, sh * ratio)
}

const renderAndSend = (index) => {
  if (!ctx || !manifest || !offscreen) return

  const sheetIdx = Math.floor(index / FRAMES_PER_SHEET)
  const sheet = sheets[sheetIdx]

  if (sheet) {
    const cell = index % FRAMES_PER_SHEET
    const col = cell % manifest.sheetCols
    const row = Math.floor(cell / manifest.sheetCols)
    drawCoverFit(sheet, col * manifest.cellWidth, row * manifest.cellHeight, manifest.cellWidth, manifest.cellHeight)
  } else {
    const lr = nearestLowres(index)
    if (!lr) return
    drawCoverFit(lr, 0, 0, lr.width, lr.height)
  }

  // transferToImageBitmap is zero-copy on GPU — fast as a pointer swap
  const bitmap = offscreen.transferToImageBitmap()
  self.postMessage({ type: 'frame_bitmap', bitmap }, [bitmap])
}

const loadLowres = async () => {
  for (let b = 0; b < FRAME_COUNT; b += 20) {
    if (!isActive) break
    await Promise.all(
      Array.from({ length: Math.min(20, FRAME_COUNT - b) }, async (_, j) => {
        const i = b + j
        try {
          const res = await fetch(`/sequence/vdo1-lowres/output_${pad(getRaw(i))}.webp`, { cache: 'force-cache' })
          if (!res.ok || !isActive) return
          lowres[i] = await createImageBitmap(await res.blob())
          if (i === 0 || i === currentFrame) renderAndSend(currentFrame)
        } catch (_) {}
      })
    )
  }
}

const loadSheet = async (s) => {
  try {
    const res = await fetch(`/sequence/vdo1-sheets/sheet_${String(s).padStart(2, '0')}.webp`, { cache: 'force-cache' })
    if (!res.ok || !isActive) return
    sheets[s] = await createImageBitmap(await res.blob())
    if (Math.floor(currentFrame / FRAMES_PER_SHEET) === s) renderAndSend(currentFrame)
  } catch (_) {}
}

const loadSheets = async () => {
  await loadSheet(0) // Sheet 0 first — covers the initial viewport (frames 0-24)
  if (!isActive) return
  await Promise.all(Array.from({ length: SHEET_COUNT - 1 }, (_, i) => loadSheet(i + 1)))
}

self.onmessage = ({ data }) => {
  switch (data.type) {
    case 'init': {
      offscreen = new OffscreenCanvas(data.width, data.height)
      ctx = offscreen.getContext('2d', { alpha: true })
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      manifest = data.manifest

      loadLowres()
      setTimeout(loadSheets, 300)
      self.postMessage({ type: 'ready' })
      break
    }

    case 'frame': {
      currentFrame = data.index
      renderAndSend(currentFrame)
      break
    }

    case 'resize': {
      if (!offscreen) break
      offscreen.width = data.width
      offscreen.height = data.height
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
      }
      renderAndSend(currentFrame)
      break
    }

    case 'visibility': {
      if (data.visible) renderAndSend(currentFrame)
      break
    }

    case 'destroy': {
      isActive = false
      break
    }
  }
}
