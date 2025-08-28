import { isClient } from '@ir-engine/hyperflux'
import { LoadingManager, Texture } from 'three'
import { iOS } from '../../../common/functions/isMobile'
import { Loader } from '../base/Loader'
import { ImageBitmapLoader } from '../image/ImageBitmapLoader'

// import resource state such that we have type override
import '../../ResourceState'

const iOSMaxResolution = 1024

const getScaledBitmap = (img: ImageBitmap, maxResolution: number) => {
  const originalWidth = img.width
  const originalHeight = img.height

  let resizingFactor = 1
  if (originalWidth >= originalHeight) {
    if (originalWidth > maxResolution) {
      resizingFactor = maxResolution / originalWidth
    }
  } else {
    if (originalHeight > maxResolution) {
      resizingFactor = maxResolution / originalHeight
    }
  }

  const canvasWidth = originalWidth * resizingFactor
  const canvasHeight = originalHeight * resizingFactor

  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

  return canvas.transferToImageBitmap()
}

class TextureLoader extends Loader<Texture> {
  maxResolution: number | undefined
  flipped: boolean

  constructor(manager?: LoadingManager, maxResolution?: number, flipped: boolean = true) {
    super(manager)
    if (maxResolution) this.maxResolution = maxResolution
    else if (iOS) this.maxResolution = iOSMaxResolution
    this.flipped = flipped
  }

  override async load(
    url: string,
    onLoad: (loadedTexture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {
    const texture = new Texture()

    texture.userData = { url }

    if (!isClient) {
      onLoad(texture)
      return
    }

    const loader = new ImageBitmapLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)

    if (this.flipped) loader.setOptions({ imageOrientation: 'flipY' })

    const onImage = (i: ImageBitmap) => {
      if (signal?.aborted) return
      const isBitmap = i instanceof ImageBitmap
      const image = this.maxResolution && isBitmap ? getScaledBitmap(i, this.maxResolution) : i
      if (!isBitmap) texture.flipY = this.flipped
      texture.source.data = image
      texture.needsUpdate = true
      onLoad(texture)
    }

    loader.load(url, onImage, onProgress, onError)
  }
}

export { TextureLoader }
