import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { DataTexture, Texture } from 'three'
import { afterEach, beforeEach } from 'vitest'
import { FileLoader } from '../../src/resources/loaders/base/FileLoader'
import { TextureLoader } from '../../src/resources/loaders/texture/TextureLoader'

const toArrayBuffer = (buf) => {
  const arrayBuffer = new ArrayBuffer(buf.length)
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return arrayBuffer
}

const original = FileLoader.prototype.load
const textureOriginal = TextureLoader.prototype.load

export function overrideFileLoaderLoad() {
  beforeEach(() => {
    function overrideLoad(url, onLoad, onProgress, onError) {
      try {
        const assetPathAbsolute = path.join(appRootPath.path, url)
        const buffer = toArrayBuffer(fs.readFileSync(assetPathAbsolute))
        setTimeout(() => onLoad(buffer), 0)
      } catch (e) {
        onError(e)
      }
    }
    FileLoader.prototype.load = overrideLoad
  })
  afterEach(() => {
    FileLoader.prototype.load = original
  })
}

export function overrideTextureLoaderLoad() {
  beforeEach(() => {
    function overrideLoad(
      url: string,
      onLoad: (loadedTexture: Texture) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (err: unknown) => void,
      signal?: AbortSignal
    ) {
      try {
        const assetPathAbsolute = path.join(appRootPath.path, url)
        const buffer = toArrayBuffer(fs.readFileSync(assetPathAbsolute))
        const data = new Uint8Array(buffer)
        const texture = new DataTexture(data)
        onLoad(texture)
      } catch (e) {
        onError?.(e)
      }
    }
    //@ts-ignore
    TextureLoader.prototype.load = overrideLoad
  })
  afterEach(() => {
    TextureLoader.prototype.load = textureOriginal
  })
}

// export const overrideAssetLoaders = async (assetPath: string, includeMaterials = false): Promise<GLTF> => {
//   const assetPathAbsolute = path.join(appRootPath.path, assetPath)
//   const loader = createGLTFLoader(includeMaterials)
//   const modelBuffer = toArrayBuffer(await fs.promises.readFile(assetPathAbsolute))
//   return new Promise((resolve, reject) => loader.parse(modelBuffer, appRootPath.path, resolve, reject))
// }
