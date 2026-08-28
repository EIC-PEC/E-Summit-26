/**
 * Frame sequence optimisation pipeline.
 *
 * Produces three output directories from the source PNG sequence:
 *   vdo1-lowres/  — 25% scale WebP per selected frame (~5 KB each)
 *   vdo1-sheets/  — Sprite sheets of 25 frames each (full-quality WebP)
 *   sequence/manifest.json — Dimensions and layout metadata for the renderer
 *
 * Run once after adding/changing the frame sequence:
 *   node scripts/convert-frames.mjs
 */

import sharp from 'sharp'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const PUBLIC = resolve('public')
const SRC_DIR = join(PUBLIC, 'sequence', 'vdo1')
const LOWRES_DIR = join(PUBLIC, 'sequence', 'vdo1-lowres')
const SHEETS_DIR = join(PUBLIC, 'sequence', 'vdo1-sheets')
const MANIFEST_PATH = join(PUBLIC, 'sequence', 'manifest.json')

const TOTAL_RAW_FRAMES = 600
const FRAME_STEP = 4
const FRAME_COUNT = Math.floor(TOTAL_RAW_FRAMES / FRAME_STEP) // 150

// Sprite sheet layout — 5 columns × 5 rows = 25 frames per sheet
const SHEET_COLS = 5
const SHEET_ROWS = 5
const FRAMES_PER_SHEET = SHEET_COLS * SHEET_ROWS // 25
const SHEET_COUNT = Math.ceil(FRAME_COUNT / FRAMES_PER_SHEET) // 6

// Cell resolution inside each sprite sheet (half of typical 1920x1080 source)
// Upscaled by canvas with hardware bilinear — visually identical at normal viewing distance
const CELL_W = 960
const CELL_H = 540

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(4, '0')
const getRawFrameNum = (i) => Math.min(TOTAL_RAW_FRAMES, i * FRAME_STEP + 1)

for (const dir of [LOWRES_DIR, SHEETS_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

// ─── Step 1: Detect source frame dimensions ───────────────────────────────────

const firstFramePath = join(SRC_DIR, `output_${pad(1)}.png`)
const { width: SRC_W, height: SRC_H } = await sharp(firstFramePath).metadata()
console.log(`Source frame: ${SRC_W}x${SRC_H}`)
console.log(`Selected frames: ${FRAME_COUNT} (every ${FRAME_STEP} from ${TOTAL_RAW_FRAMES} total)`)
console.log(`Sprite sheets: ${SHEET_COUNT} × ${FRAMES_PER_SHEET} frames at ${CELL_W}x${CELL_H} per cell\n`)

// Write manifest so the renderer knows how to slice sheets at runtime
writeFileSync(
  MANIFEST_PATH,
  JSON.stringify(
    {
      cellWidth: CELL_W,
      cellHeight: CELL_H,
      frameCount: FRAME_COUNT,
      framesPerSheet: FRAMES_PER_SHEET,
      sheetCols: SHEET_COLS,
      sheetRows: SHEET_ROWS,
      sheetCount: SHEET_COUNT,
      sheetWidth: CELL_W * SHEET_COLS,
      sheetHeight: CELL_H * SHEET_ROWS,
    },
    null,
    2
  )
)
console.log('manifest.json written.\n')

// ─── Step 2: Convert selected frames to low-res WebP ─────────────────────────

console.log('Step 1/2 — Converting low-res WebP frames...')

const BATCH = 12
const selectedRawNums = Array.from({ length: FRAME_COUNT }, (_, i) => getRawFrameNum(i))

for (let b = 0; b < selectedRawNums.length; b += BATCH) {
  const slice = selectedRawNums.slice(b, b + BATCH)
  await Promise.all(
    slice.map(async (rawNum) => {
      const frameStr = pad(rawNum)
      const dest = join(LOWRES_DIR, `output_${frameStr}.webp`)
      if (existsSync(dest)) return // skip if already converted

      await sharp(join(SRC_DIR, `output_${frameStr}.png`))
        .resize(Math.round(SRC_W * 0.25)) // 480x270 for 1920x1080 source
        .webp({ quality: 60 })
        .toFile(dest)
    })
  )
  const done = Math.min(b + BATCH, selectedRawNums.length)
  process.stdout.write(`\r  ${done}/${selectedRawNums.length} frames`)
}
console.log('\n  Done.\n')

// ─── Step 3: Build sprite sheets ─────────────────────────────────────────────

console.log('Step 2/2 — Building sprite sheets...')

for (let s = 0; s < SHEET_COUNT; s++) {
  const dest = join(SHEETS_DIR, `sheet_${String(s).padStart(2, '0')}.webp`)
  if (existsSync(dest)) {
    console.log(`  Sheet ${s + 1}/${SHEET_COUNT} already exists, skipping.`)
    continue
  }

  const startIdx = s * FRAMES_PER_SHEET
  const framesInSheet = Math.min(FRAMES_PER_SHEET, FRAME_COUNT - startIdx)
  const sheetH = CELL_H * Math.ceil(framesInSheet / SHEET_COLS)

  // Build composites by first resizing each cell frame individually
  const compositeInputs = await Promise.all(
    Array.from({ length: framesInSheet }, async (_, f) => {
      const frameIdx = startIdx + f
      const rawNum = getRawFrameNum(frameIdx)
      const frameStr = pad(rawNum)
      const col = f % SHEET_COLS
      const row = Math.floor(f / SHEET_COLS)

      const resizedBuffer = await sharp(join(SRC_DIR, `output_${frameStr}.png`))
        .resize(CELL_W, CELL_H, { fit: 'cover' })
        .toFormat('raw')
        .toBuffer({ resolveWithObject: true })

      return {
        // sharp composite requires raw pixel input with explicit info
        input: resizedBuffer.data,
        raw: { width: CELL_W, height: CELL_H, channels: 3 },
        left: col * CELL_W,
        top: row * CELL_H,
      }
    })
  )

  await sharp({
    create: {
      width: CELL_W * SHEET_COLS,
      height: sheetH,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite(compositeInputs)
    .webp({ quality: 82, effort: 4 })
    .toFile(dest)

  console.log(`  Sheet ${s + 1}/${SHEET_COUNT} written.`)
}

console.log('\nAll done! Commit the vdo1-lowres/ and vdo1-sheets/ directories to your repo.')
