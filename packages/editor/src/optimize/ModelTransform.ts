import { DracoOptions, JoinOptions, PaletteOptions } from '@gltf-transform/functions'

import { OpaqueType } from '@ir-engine/hyperflux'

export type ParameterOverride<T> = OpaqueType<'ParameterOverride'> & {
  isParameterOverride: true
  enabled: boolean
  parameters: T
}

export function extractParameters<T>(parameters: ParameterOverride<T>) {
  if (!parameters.enabled) return {}
  if (typeof parameters.parameters === 'object' && !Array.isArray(parameters.parameters)) {
    return Object.fromEntries(
      Object.entries(parameters.parameters as object).map(([key, value]: [string, ParameterOverride<any>]) => {
        if (value.isParameterOverride) {
          if (value.enabled) return [key, extractParameters(value)]
          else return []
        } else return [key, value]
      })
    )
  } else if (Array.isArray(parameters.parameters)) {
    return [
      ...parameters.parameters.map((value) => {
        if (value.isParameterOverride) {
          if (value.enabled) return [extractParameters(value)]
          else return []
        } else return [value]
      })
    ]
  } else return parameters.parameters
}

export type ImageTransformParameters = ParameterOverride<{
  flipY: ParameterOverride<boolean>
  maxTextureSize: ParameterOverride<number>
  textureFormat: ParameterOverride<'default' | 'jpg' | 'ktx2' | 'png' | 'webp'>
  textureCompressionType: ParameterOverride<'etc1' | 'uastc'>
  textureCompressionQuality: ParameterOverride<number>
}>

export type ExtractedImageTransformParameters = {
  flipY: boolean
  linear: boolean
  mipmap: boolean
  maxTextureSize: number
  textureFormat: 'default' | 'jpg' | 'ktx2' | 'png' | 'webp'
  textureCompressionType: 'etc1' | 'uastc'
  textureCompressionQuality: number
  uastcLevel: number
  compLevel: number
  maxCodebooks: boolean
}

export type GeometryTransformParameters = ParameterOverride<{
  weld: ParameterOverride<number>
  dracoCompression: ParameterOverride<DracoOptions>
}>

export type ResourceTransforms = {
  geometries: GeometryTransformParameters[]
  images: ImageTransformParameters[]
}

export type ModelFormat = 'glb' | 'gltf' | 'vrm'

export type ModelTransformParameters = ExtractedImageTransformParameters & {
  dst: string
  resourceUri: string
  split: boolean
  combineMaterials: boolean
  instance: boolean
  dedup: boolean
  flatten: boolean

  join: {
    enabled: boolean
    options: JoinOptions
  }

  palette: {
    enabled: boolean
    options: PaletteOptions
  }

  prune: boolean
  reorder: boolean
  resample: boolean

  weld: {
    enabled: boolean
  }

  meshoptCompression: {
    enabled: boolean
  }

  dracoCompression: {
    enabled: boolean
    options: DracoOptions
  }

  simplifyRatio: number
  simplifyErrorThreshold: number
  adaptiveSimplification: boolean
  modelFormat: ModelFormat

  resources: ResourceTransforms
}

export const DefaultModelTransformParameters: ModelTransformParameters = {
  dst: '',
  resourceUri: '',
  modelFormat: 'gltf',
  split: true,
  combineMaterials: true,
  instance: true,
  dedup: true,
  flatten: true,
  join: {
    enabled: true,
    options: {
      keepMeshes: false,
      keepNamed: false
    }
  },
  palette: {
    enabled: false,
    options: {
      blockSize: 4,
      min: 2
    }
  },
  prune: true,
  reorder: true,
  resample: true,
  weld: {
    enabled: false
  },
  meshoptCompression: {
    enabled: true
  },
  dracoCompression: {
    enabled: false,
    options: {
      method: 'sequential',
      encodeSpeed: 0,
      decodeSpeed: 0,
      quantizePosition: 14,
      quantizeNormal: 8,
      quantizeColor: 8,
      quantizeTexcoord: 12,
      quantizeGeneric: 16,
      quantizationVolume: 'mesh'
    }
  },
  textureFormat: 'ktx2',
  textureCompressionType: 'etc1',
  uastcLevel: 4,
  compLevel: 4,
  maxCodebooks: true,
  flipY: false,
  linear: true,
  mipmap: true,
  textureCompressionQuality: 128,
  maxTextureSize: 1024,
  simplifyRatio: 1,
  simplifyErrorThreshold: 0.01,
  adaptiveSimplification: false,
  resources: {
    geometries: [],
    images: []
  }
}
