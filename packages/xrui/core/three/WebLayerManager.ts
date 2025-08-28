import { Mesh, SRGBColorSpace, WebGLRenderer } from 'three'

import { WebLayerManagerBase } from '../WebLayerManagerBase'
import { HTMLTextureData } from '../XRUIState'
import { WebLayer3D } from './WebLayer3D'

export class WebLayerManager extends WebLayerManagerBase {
  static initialize(renderer: WebGLRenderer, ktx2Loader) {
    WebLayerManager.instance = new WebLayerManager()
    WebLayerManager.instance.renderer = renderer
    WebLayerManager.instance.ktx2Loader = ktx2Loader
    WebLayerManager.instance.ktx2Encoder.setWorkerLimit(1)
  }

  static instance: WebLayerManager

  renderer!: WebGLRenderer
  textureEncoding = SRGBColorSpace
  // ktx2Loader: KTX2Loader // todo, currently the type exists in the engine package, which we cannot import here
  ktx2Loader: any

  texturesByHash = new Map<string, HTMLTextureData>()
  // texturesByCharacter = new Map<number, ThreeTextureData>()
  layersByElement = new WeakMap<Element, WebLayer3D>()
  layersByMesh = new WeakMap<Mesh, WebLayer3D>()

  // getTexture(textureHash: TextureHash) {
  //   const textureData = this.getTextureState(textureHash)
  //   if (!this.texturesByHash.has(textureHash)) {
  //     this.texturesByHash.set(textureHash, {})
  //   }
  //   this._loadCompressedTextureIfNecessary(textureData)
  //   this._loadCanvasTextureIfNecessary(textureData)
  //   return this.texturesByHash.get(textureHash)!
  // }

  _compressedTexturePromise = new Map<string, (value?: any) => void>()

  private _loadCompressedTextureIfNecessary(textureData: HTMLTextureData) {
    // const ktx2Url = textureData.ktx2Url
    // if (!ktx2Url) return
    // if (!this._compressedTexturePromise.has(textureData.hash)) {
    //   new Promise((resolve) => {
    //     this._compressedTexturePromise.set(textureData.hash, resolve)
    //     this.ktx2Loader.load(
    //       ktx2Url,
    //       (t) => {
    //         t.wrapS = ClampToEdgeWrapping
    //         t.wrapT = ClampToEdgeWrapping
    //         t.minFilter = LinearMipmapLinearFilter
    //         t.colorSpace = this.textureEncoding
    //         this.texturesByHash.get(textureData.hash)!.compressedTexture = t
    //         resolve(undefined)
    //       },
    //       () => {},
    //       resolve
    //     )
    //   })
    // }
  }

  _canvasTexturePromise = new Map<string, (value?: any) => void>()

  private _loadCanvasTextureIfNecessary(textureData: HTMLTextureData) {
    const threeTextureData = this.texturesByHash.get(textureData.hash)!
    if (threeTextureData.compressedTexture) {
      threeTextureData.canvasTexture?.dispose()
      threeTextureData.canvasTexture = undefined
      return
    }
    const canvas = textureData.canvasTexture
    if (!canvas) return
    if (!threeTextureData.canvasTexture && !threeTextureData.compressedTexture) {
      // const t = new CanvasTexture(canvas)
      // t.wrapS = ClampToEdgeWrapping
      // t.wrapT = ClampToEdgeWrapping
      // t.minFilter = LinearMipmapLinearFilter
      // t.colorSpace = this.textureEncoding
      // t.flipY = false
      // threeTextureData.canvasTexture = t
    }
  }
}
