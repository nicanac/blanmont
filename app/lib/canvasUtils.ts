export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed for external images
    image.setAttribute('referrerPolicy', 'no-referrer')
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

export interface CropOutputOptions {
  /** Longest side of the output image in px. The crop is scaled down (never up) to fit. */
  maxSize?: number
  /** JPEG quality, 0–1 (browser default ≈ 0.92 when omitted). */
  quality?: number
}

/**
 * Output size for a crop: the crop itself, scaled down so its longest side is at most `maxSize`.
 */
export function getOutputSize(
  width: number,
  height: number,
  maxSize?: number
): { width: number; height: number } {
  if (!maxSize || maxSize <= 0) return { width: Math.round(width), height: Math.round(height) }
  const scale = Math.min(1, maxSize / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/**
 * Crops `imageSrc` to `pixelCrop` and returns a JPEG Blob.
 *
 * Without rotation or flip, the crop is drawn straight from the source rectangle into a canvas
 * of the output size: no full-resolution intermediate canvas, which phone photos (12–48 MP)
 * can push past mobile Safari's canvas memory limit. With `maxSize`, the result is downscaled
 * so it stays small enough for a Server Action body (1 MB by default in Next.js).
 *
 * Adapted from the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  options: CropOutputOptions = {}
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const out = getOutputSize(pixelCrop.width, pixelCrop.height, options.maxSize)

  if (rotation % 360 === 0 && !flip.horizontal && !flip.vertical) {
    // Fast path: one draw from the source rectangle to the (possibly downscaled) output.
    canvas.width = out.width
    canvas.height = out.height
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      out.width,
      out.height
    )
    return toJpegBlob(canvas, options.quality)
  }

  const rotRad = getRadianAngle(rotation)

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // draw rotated image
  ctx.drawImage(image, 0, 0)

  if (out.width !== Math.round(pixelCrop.width) || out.height !== Math.round(pixelCrop.height)) {
    // Downscale: copy the crop region of the rotated canvas into an output-sized canvas.
    const outCanvas = document.createElement('canvas')
    const outCtx = outCanvas.getContext('2d')
    if (!outCtx) return null
    outCanvas.width = out.width
    outCanvas.height = out.height
    outCtx.imageSmoothingQuality = 'high'
    outCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      out.width,
      out.height
    )
    return toJpegBlob(outCanvas, options.quality)
  }

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0)

  return toJpegBlob(canvas, options.quality)
}

/**
 * Most bytes a cropped photo may weigh when it goes through a Server Action: the 1 MB
 * default body limit minus room for the multipart boundaries and the other fields.
 */
export const SERVER_ACTION_PHOTO_BYTES = 900 * 1024

/** Encodings tried in order for a member photo (#260): sharp first, smaller only if too heavy. */
export const MEMBER_PHOTO_STEPS: readonly CropOutputOptions[] = [
  { maxSize: 1600, quality: 0.9 },
  { maxSize: 1600, quality: 0.82 },
  { maxSize: 1280, quality: 0.82 },
  { maxSize: 1024, quality: 0.8 },
]

/**
 * Crops like `getCroppedImg` (no rotation), trying each encoding of `steps` in order and
 * returning the first JPEG of at most `maxBytes`. When none fits, the last (smallest) one
 * is returned: the caller's upload then fails loudly instead of silently losing quality.
 */
export async function getCroppedImgWithin(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  maxBytes: number,
  steps: readonly CropOutputOptions[] = MEMBER_PHOTO_STEPS
): Promise<Blob | null> {
  let blob: Blob | null = null
  for (const step of steps) {
    blob = await getCroppedImg(imageSrc, pixelCrop, 0, undefined, step)
    if (!blob || blob.size <= maxBytes) return blob
  }
  return blob
}

/**
 * Shortest side, in source px, below which a member portrait looks soft on /members
 * (the card is ~1160 device px wide on a phone; the crop is never upscaled).
 */
export const MIN_SHARP_PHOTO_PX = 800

/** True when the cropped area holds too few source pixels for a sharp portrait (#260). */
export function isLowResolutionCrop(
  pixelCrop: { width: number; height: number },
  minPx: number = MIN_SHARP_PHOTO_PX
): boolean {
  return Math.min(pixelCrop.width, pixelCrop.height) < minPx
}

function toJpegBlob(canvas: HTMLCanvasElement, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((file) => resolve(file), 'image/jpeg', quality)
  })
}
