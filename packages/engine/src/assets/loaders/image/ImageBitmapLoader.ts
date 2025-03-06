import { Cache, Loader } from 'three'

class ImageBitmapLoader extends Loader {
  isImageBitmapLoader = true
  options: ImageBitmapOptions

  constructor(manager) {
    super(manager)

    if (typeof createImageBitmap === 'undefined') {
      console.warn('THREE.ImageBitmapLoader: createImageBitmap() not supported.')
    }

    if (typeof fetch === 'undefined') {
      console.warn('THREE.ImageBitmapLoader: fetch() not supported.')
    }

    this.options = { premultiplyAlpha: 'none' }
  }

  setOptions(options) {
    this.options = options

    return this
  }

  load(url, onLoad, onProgress, onError) {
    if (url === undefined) url = ''

    if (this.path !== undefined) url = this.path + url

    url = this.manager.resolveURL(url)

    const manager = this.manager
    const options = this.options

    const cached = Cache.get(url)

    if (cached !== undefined) {
      manager.itemStart(url)

      setTimeout(function () {
        if (onLoad) onLoad(cached)

        manager.itemEnd(url)
      }, 0)

      return cached
    }

    const fetchOptions = {} as {
      credentials: 'same-origin' | 'include'
      headers: any
    }
    fetchOptions.credentials = this.crossOrigin === 'anonymous' ? 'same-origin' : 'include'
    fetchOptions.headers = this.requestHeader

    fetch(url, fetchOptions)
      .then(function (res) {
        return res.blob()
      })
      .then(function (blob) {
        return createImageBitmap(blob, Object.assign(options, { colorSpaceConversion: 'none' }))
      })
      .then(function (imageBitmap) {
        Cache.add(url, imageBitmap)

        if (onLoad) onLoad(imageBitmap)

        manager.itemEnd(url)
      })
      .catch(function (e) {
        if (onError) onError(e)

        manager.itemError(url)
        manager.itemEnd(url)
      })

    manager.itemStart(url)
  }
}

export { ImageBitmapLoader }
