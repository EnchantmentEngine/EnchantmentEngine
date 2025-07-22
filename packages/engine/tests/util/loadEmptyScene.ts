import { GLTF } from '@gltf-transform/core'
import { Cache } from 'three'

import { AssetState } from '../../src/gltf/GLTFState'

export const loadEmptyScene = () => {
  const gltf: GLTF.IGLTF = {
    asset: {
      version: '2.0'
    },
    scenes: [{ nodes: [] }],
    scene: 0,
    nodes: []
  }
  Cache.add('/test.gltf', gltf)
  Cache.enabled = true
  return AssetState.load('/test.gltf')
}
