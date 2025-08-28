import { UASTCFlags } from '@ir-engine/xrui/core/textures/KTX2Encoder'

export type KTX2EncodeArguments = {
  src: string | Blob
  flipY: boolean
  format: 'ktx2' | 'basis'
  srgb: boolean
  mode: 'ETC1S' | 'UASTC'
  quality: number
  mipmaps: boolean
  resize: boolean
  resizeWidth: number
  resizeHeight: number
  resizeMethod: 'stretch' | 'aspect'
  compressionLevel: number
  uastcFlags: number
  normalMap: boolean
  uastcZstandard: boolean
}

export const KTX2EncodeDefaultArguments: KTX2EncodeArguments = {
  src: '',
  flipY: false,
  format: 'ktx2',
  srgb: true,
  mode: 'ETC1S',
  quality: 128,
  mipmaps: true,
  resize: false,
  resizeWidth: 0,
  resizeHeight: 0,
  resizeMethod: 'stretch',
  compressionLevel: 2,
  uastcFlags: UASTCFlags.UASTCLevelFastest,
  normalMap: false,
  uastcZstandard: false
}
