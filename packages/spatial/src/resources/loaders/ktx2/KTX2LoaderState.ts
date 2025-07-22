import { defineState, getState, isClient } from '@ir-engine/hyperflux'

import { WebGLRenderer } from 'three'
import { DomainConfigState } from '../../DomainConfigState'
import { KTX2Loader } from './KTX2Loader'

export const KTX2LoaderState = defineState({
  name: 'KTX2LoaderState',
  initial: () => {
    const ktx2Loader = new KTX2Loader()
    ktx2Loader.setTranscoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/basis/')
    if (isClient) {
      const renderer = new WebGLRenderer()
      ktx2Loader.detectSupport(renderer)
      renderer.dispose()
    } else {
      // @ts-ignore - make nodejs happy
      ktx2Loader.workerConfig = {
        astcSupported: false,
        etc1Supported: false,
        etc2Supported: false,
        dxtSupported: false,
        bptcSupported: false,
        pvrtcSupported: false
      }
    }
    return ktx2Loader
  }
})
