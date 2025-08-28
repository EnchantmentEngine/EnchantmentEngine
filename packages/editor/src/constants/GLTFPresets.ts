import {
  DefaultModelTransformParameters as defaultParams,
  ModelTransformParameters
} from '@ir-engine/engine/src/assets/classes/ModelTransform'
import { Devices, VariantMetadata } from '@ir-engine/engine/src/scene/components/VariantComponent'

export type LODVariantDescriptor = {
  params: ModelTransformParameters
  suffix: string
  variantMetadata: VariantMetadata
}

export const LODList: LODVariantDescriptor[] = [
  {
    params: {
      ...defaultParams,
      dst: 'Desktop - Low',
      maxTextureSize: 1024
    },
    suffix: 'desktop-low',
    variantMetadata: { device: Devices.DESKTOP }
  },
  {
    params: {
      ...defaultParams,
      dst: 'Desktop - Medium',
      maxTextureSize: 2048
    },
    suffix: 'desktop-medium',
    variantMetadata: { device: Devices.DESKTOP }
  },
  {
    params: {
      ...defaultParams,
      dst: 'Desktop - High',
      maxTextureSize: 2048
    },
    suffix: 'desktop-high',
    variantMetadata: { device: Devices.DESKTOP }
  },
  {
    params: {
      ...defaultParams,
      dst: 'Mobile - Low',
      maxTextureSize: 512
    },
    suffix: 'mobile-low',
    variantMetadata: { device: Devices.MOBILE }
  },
  {
    params: {
      ...defaultParams,
      dst: 'Mobile - High',
      maxTextureSize: 512
    },
    suffix: 'mobile-high',
    variantMetadata: { device: Devices.MOBILE }
  },
  {
    params: {
      ...defaultParams,
      dst: 'XR - Low',
      maxTextureSize: 1024
    },
    suffix: 'xr-low',
    variantMetadata: { device: Devices.XR }
  },
  {
    params: {
      ...defaultParams,
      dst: 'XR - Medium',
      maxTextureSize: 1024
    },
    suffix: 'xr-medium',
    variantMetadata: { device: Devices.XR }
  },
  {
    params: {
      ...defaultParams,
      dst: 'XR - High',
      maxTextureSize: 2048
    },
    suffix: 'xr-high',
    variantMetadata: { device: Devices.XR }
  }
]

export const defaultLODs: LODVariantDescriptor[] = [
  {
    params: {
      ...defaultParams,
      dst: '-LOD0',
      maxTextureSize: 2048
    },
    suffix: '-LOD0',
    variantMetadata: {
      minDistance: 0,
      maxDistance: 10
    }
  },
  {
    params: {
      ...defaultParams,
      dst: '-LOD1',
      maxTextureSize: 1024,
      simplifyRatio: 1.0,
      simplifyErrorThreshold: 0.001
    },
    suffix: '-LOD1',
    variantMetadata: {
      minDistance: 10,
      maxDistance: 20
    }
  },
  {
    params: {
      ...defaultParams,
      dst: '-LOD2',
      maxTextureSize: 512,
      simplifyRatio: 1.0,
      simplifyErrorThreshold: 0.001
    },
    suffix: '-LOD2',
    variantMetadata: {
      minDistance: 20,
      maxDistance: 30
    }
  }
]
