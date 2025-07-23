import { defineState, getState, isClient } from '@ir-engine/hyperflux'

import { DomainConfigState } from '@ir-engine/spatial/src/resources/DomainConfigState'
import { DefaultLoadingManager } from 'three'
import { CORTOLoader } from '../loaders/corto/CORTOLoader'
import { DRACOLoader } from '../loaders/gltf/DRACOLoader'
import { loadDRACODecoderNode, NodeDRACOLoader } from '../loaders/gltf/NodeDracoLoader'

export const AssetLoaderState = defineState({
  name: 'AssetLoaderState',
  initial: () => {
    let dracoLoader: DRACOLoader
    if (isClient) {
      dracoLoader = new DRACOLoader()
      // todo we probably want to react to changes in the domain config state
      dracoLoader.setDecoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/')
      dracoLoader.setWorkerLimit(1)
    } else {
      loadDRACODecoderNode()
      dracoLoader = new NodeDRACOLoader() as any as DRACOLoader
      /* @ts-ignore */
      dracoLoader.preload = () => {
        return dracoLoader
      }
    }

    return {
      manager: DefaultLoadingManager,
      dracoLoader,
      cortoLoader: null! as CORTOLoader
    }
  }
})
