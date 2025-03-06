import { Cache, Loader } from 'three'

class ImageLoader extends Loader {
  maxResolution: number | undefined
  autoDetectBitmap: boolean | undefined

  constructor(manager) {
    super(manager)
  }

  load(url, onLoad, onProgress, onError) {
    if (this.path !== undefined) url = this.path + url

    url = this.manager.resolveURL(url)

    const manager = this.manager

    const cached = Cache.get(url)

    if (cached !== undefined) {
      manager.itemStart(url)

      setTimeout(function () {
        if (onLoad) onLoad(cached)

        manager.itemEnd(url)
      }, 0)

      return cached
    }

    const image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img') as HTMLImageElement

    function onImageLoad() {
      removeEventListeners()

      Cache.add(url, this)

      if (onLoad) onLoad(this)

      manager.itemEnd(url)
    }

    function onImageError(event) {
      removeEventListeners()

      if (onError) onError(event)

      manager.itemError(url)
      manager.itemEnd(url)
    }

    function removeEventListeners() {
      image.removeEventListener('load', onImageLoad, false)
      image.removeEventListener('error', onImageError, false)
    }

    image.addEventListener('load', onImageLoad, false)
    image.addEventListener('error', onImageError, false)

    if (url.slice(0, 5) !== 'data:') {
      if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin
    }

    manager.itemStart(url)

    image.src = url

    return image
  }
}

export { ImageLoader }
