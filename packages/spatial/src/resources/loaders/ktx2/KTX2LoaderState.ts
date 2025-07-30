import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineState, getState, isClient } from '@ir-engine/hyperflux'
import { WebGPURenderer } from 'three/webgpu'
import { ReferenceSpaceState } from '../../../ReferenceSpaceState'
import { RendererComponent } from '../../../renderer/components/RendererComponent'
import { RenderBackends } from '../../../renderer/constants/RenderModes'
import { RendererState } from '../../../renderer/RendererState'
import { DomainConfigState } from '../../DomainConfigState'
import { KTX2Loader } from './KTX2Loader'

export const KTX2LoaderState = defineState({
  name: 'KTX2LoaderState',
  initial: () => {
    const ktx2Loader = new KTX2Loader()
    ktx2Loader.setTranscoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/basis/')
    if (isClient) {
      const renderer = getState(RendererState)

      const viewerEntity = getState(ReferenceSpaceState).viewerEntity
      const rendererComponent = getComponent(viewerEntity, RendererComponent)

      console.log(renderer)
      if (renderer.backend == RenderBackends.WEBGPU) {
        const r = new WebGPURenderer()
        ktx2Loader.detectWebGPUSupport(r)
      } else {
        ktx2Loader.detectWebGLSupport(rendererComponent.renderer)
      }
    }

    return ktx2Loader
  }
})
