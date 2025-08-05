import { getComponent, getOptionalComponent } from '@ir-engine/ecs'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { Vector2 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { MaterialComponent } from '../../materials/MaterialComponent'
import { defineMaterialPlugin } from '../../materials/defineMaterialPlugin'
import { getRendererEntity } from '../functions/useRendererEntity'
import { CSM } from './CSM'
import { CSMComponent } from './CSMComponent'

export const CSMPluginComponent = defineMaterialPlugin({
  name: 'CSMPluginComponent',

  uniforms: S.Object({
    cameraNear: S.Number(),
    cameraFar: S.Number(),
    shadowFar: S.Number(),
    CSM_cascades: S.Array(S.Number())
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

    if (csm.fade) {
      material.defines.CSM_FADE = ''
    }

    const breaksVec2: Vector2[] = []

    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    const far = Math.min(camera.far, csm.maxFar)
    const near = Math.min(csm.maxFar, camera.near)
    CSM.getExtendedBreaks(breaksVec2, rendererEntity)

    shader.uniforms.CSM_cascades = { value: breaksVec2 }
    shader.uniforms.cameraNear = { value: near }
    shader.uniforms.shadowFar = { value: far }

    material.needsUpdate = true

    // return () => {
    //   removePlugin(materialComponent.material as Material, callback)

    //   if (material.defines) {
    //     delete material.defines.USE_CSM
    //     delete material.defines.CSM_CASCADES
    //     delete material.defines.CSM_FADE
    //   }

    //   material.needsUpdate = true
    // }
  }
})
