import { getComponent, getOptionalComponent } from '@ir-engine/ecs'
import { getState, Schema } from '@ir-engine/hyperflux'
import { Vector2 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { defineMaterialPlugin } from '../../materials/defineMaterialPlugin'
import { MaterialComponent } from '../../materials/MaterialComponent'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { getRendererEntity } from '../functions/useRendererEntity'
import { CSM } from './CSM'
import { CSMComponent } from './CSMComponent'
import { isCSMPluginSupportedByRenderer } from './Shader'

export const CSMPluginComponent = defineMaterialPlugin({
  name: 'CSMPluginComponent',

  uniforms: Schema.Object({
    cameraNear: Schema.Number(),
    cameraFar: Schema.Number(),
    shadowFar: Schema.Number(),
    CSM_cascades: Schema.Array(Schema.Number())
  }),

  onApply(entity, shader, renderer) {
    const material = MaterialComponent.get(entity)
    if (!material?.isMaterial) return

    const rendererEntity = getRendererEntity(entity)
    const csm = getOptionalComponent(rendererEntity, CSMComponent)
    if (!csm) return

    material.defines = material.defines || {}
    material.defines.USE_CSM = 1
    material.defines.CSM_CASCADES = csm.cascades

    // Check if CSM is supported by the current renderer
    if (!isCSMPluginSupportedByRenderer(rendererEntity)) {
      console.warn('CSM: Current renderer does not support Cascaded Shadow Maps')
      return
    }

    material.defines = material.defines || {}
    material.defines.USE_CSM = 1
    material.defines.CSM_CASCADES = csm.cascades

    const breaksVec2: Vector2[] = []

    const camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
    const far = Math.min(camera.far, csm.maxFar)
    const near = Math.min(csm.maxFar, camera.near)
    CSM.getExtendedBreaks(breaksVec2, rendererEntity)

    // Set uniforms (same for both WebGL and WebGPU)
    shader.uniforms.CSM_cascades = { value: breaksVec2 }
    shader.uniforms.cameraNear = { value: near }
    shader.uniforms.shadowFar = { value: far }

    material.needsUpdate = true

    return () => {
      //   if (material.defines) {
      //     delete material.defines.USE_CSM
      //     delete material.defines.CSM_CASCADES
      //     delete material.defines.CSM_FADE
      //   }
      //   material.needsUpdate = true
      // }
    }
  }
})
