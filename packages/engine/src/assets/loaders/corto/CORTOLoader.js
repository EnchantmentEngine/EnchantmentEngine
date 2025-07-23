


import { BufferAttribute, BufferGeometry } from 'three'
import { FileLoader } from '@ir-engine/spatial/src/resources/loaders/base/FileLoader'

class CORTOLoader {
  constructor() {
    this.decoderPath = ''
    this.decoderPending = null

    this.worker = null
    this.lastRequest = 0
    this.callbacks = {}

    this.defaultAttributes = [
      { name: 'position', numComponents: '3' },
      { name: 'normal', numComponents: '3' },
      { name: 'color', numComponents: '4' },
      { name: 'uv', numComponents: '2' }
    ]
  }

  setDecoderPath(path) {
    this.decoderPath = path
    return this
  }

  load(url, byteStart, byteEnd, onLoad) {
    if (!this.decoderPending) {
      this.preload()
    }

    this.decoderPending.then(() => {
      const request = this.lastRequest++
      this.worker.postMessage({
        request: request,
        url: url,
        byteStart: byteStart,
        byteEnd: byteEnd
      })
      this.callbacks[request] = { onLoad: onLoad }
    })
  }

  preload() {
    if (this.decoderPending) return this.decoderPending

    let that = this
    let callbacks = this.callbacks
    let lib = 'corto.js'

    this.decoderPending = this._loadLibrary(lib, 'text').then((text) => {
      text = URL.createObjectURL(new Blob([text]))
      this.worker = new Worker(text)

      this.worker.onmessage = function (e) {
        var message = e.data
        if (!callbacks[message.request]) return

        const callback = callbacks[message.request]
        const geometry = that._createGeometry(message.geometry)
        callback.onLoad(geometry)
        delete callbacks[message.request]
      }
    })

    return this.decoderPending
  }

  dispose() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    return this
  }

  _createGeometry(geometry) {
    if (!geometry) {
      return null
    }
    var bufferGeometry = new BufferGeometry()

    if (geometry.index) bufferGeometry.setIndex(new BufferAttribute(geometry.index, 1))

    for (let i = 0; i < this.defaultAttributes.length; i++) {
      let attr = this.defaultAttributes[i]
      if (!geometry[attr.name]) continue
      let buffer = geometry[attr.name]
      bufferGeometry.setAttribute(attr.name, new BufferAttribute(buffer, attr.numComponents))
    }
    return bufferGeometry
  }

  _loadLibrary(url, responseType) {
    var loader = new FileLoader(this.manager)
    loader.setPath(this.decoderPath)
    loader.setResponseType(responseType)

    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject)
    })
  }
}

export { CORTOLoader }
