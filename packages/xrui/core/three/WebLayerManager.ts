import {
  CanvasTexture,
  ClampToEdgeWrapping,
  CompressedTexture,
  LinearMipmapLinearFilter,
  Mesh,
  SRGBColorSpace,
  WebGLRenderer
} from 'three'
import { WebGPURenderer } from 'three/webgpu'

import { TextureData, TextureHash, WebLayerManagerBase } from '../WebLayerManagerBase'
import { WebLayer3D } from './WebLayer3D'

export interface ThreeTextureData {
  canvasTexture?: CanvasTexture
  compressedTexture?: CompressedTexture
}
export class WebLayerManager extends WebLayerManagerBase {
  static initialize(renderer: WebGLRenderer | WebGPURenderer, ktx2Loader) {
    WebLayerManager.instance = new WebLayerManager()
    WebLayerManager.instance.renderer = renderer
    WebLayerManager.instance.ktx2Loader = ktx2Loader
    WebLayerManager.instance.ktx2Encoder.setWorkerLimit(1)
  }

  static instance: WebLayerManager

  renderer!: WebGLRenderer | WebGPURenderer
  textureEncoding = SRGBColorSpace
  // ktx2Loader: KTX2Loader // todo, currently the type exists in the engine package, which we cannot import here
  ktx2Loader: any

  texturesByHash = new Map<string, ThreeTextureData>()
  // texturesByCharacter = new Map<number, ThreeTextureData>()
  layersByElement = new WeakMap<Element, WebLayer3D>()
  layersByMesh = new WeakMap<Mesh, WebLayer3D>()

  getTexture(textureHash: TextureHash) {
    const textureData = this.getTextureState(textureHash)
    if (!this.texturesByHash.has(textureHash)) {
      this.texturesByHash.set(textureHash, {})
    }
    this._loadCompressedTextureIfNecessary(textureData)
    this._loadCanvasTextureIfNecessary(textureData)
    return this.texturesByHash.get(textureHash)!
  }

  _compressedTexturePromise = new Map<string, (value?: any) => void>()

  private _loadCompressedTextureIfNecessary(textureData: TextureData) {
    const ktx2Url = textureData.ktx2Url
    if (!ktx2Url) return
    if (!this._compressedTexturePromise.has(textureData.hash)) {
      new Promise((resolve) => {
        this._compressedTexturePromise.set(textureData.hash, resolve)
        this.ktx2Loader.load(
          ktx2Url,
          (t) => {
            t.wrapS = ClampToEdgeWrapping
            t.wrapT = ClampToEdgeWrapping
            t.minFilter = LinearMipmapLinearFilter
            t.colorSpace = this.textureEncoding
            this.texturesByHash.get(textureData.hash)!.compressedTexture = t
            // Once compressed texture is ready, drop CPU-side canvas to save memory
            this.clearTextureCanvas(textureData)
            resolve(undefined)
          },
          () => {},
          resolve
        )
      })
    }
  }

  _canvasTexturePromise = new Map<string, (value?: any) => void>()

  private _loadCanvasTextureIfNecessary(textureData: TextureData) {
    const threeTextureData = this.texturesByHash.get(textureData.hash)!
    if (threeTextureData.compressedTexture) {
      threeTextureData.canvasTexture?.dispose()
      threeTextureData.canvasTexture = undefined
      return
    }
    const canvas = textureData.canvas
    if (!canvas) return
    if (!threeTextureData.canvasTexture && !threeTextureData.compressedTexture) {
      const t = new CanvasTexture(canvas)
      t.wrapS = ClampToEdgeWrapping
      t.wrapT = ClampToEdgeWrapping
      t.minFilter = LinearMipmapLinearFilter
      t.colorSpace = this.textureEncoding
      t.flipY = false
      threeTextureData.canvasTexture = t
    }
  }
}
