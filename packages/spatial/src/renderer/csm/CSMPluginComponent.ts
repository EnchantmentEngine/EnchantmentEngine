import { defineComponent, Entity, getComponent, getOptionalComponent } from '@ir-engine/ecs'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Schema } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Material, Vector2 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { supportsOnBeforeCompile } from '../functions/RendererBackendUtils'
import { getRendererEntity } from '../functions/useRendererEntity'
import { MaterialStateComponent } from '../materials/MaterialComponent'
import { removePlugin, setPlugin } from '../materials/materialFunctions'
import { CSM } from './CSM'
import { CSMComponent } from './CSMComponent'
import { isCSMPluginSupportedByRenderer } from './Shader'

export const CSMPluginComponent = defineComponent({
  name: 'CSMPluginComponent',

  schema: Schema.Object({}),

  reactor: (props: { entity: Entity }) => {
    const entity = props.entity
    useEffect(() => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
      if (!materialComponent) return

      const material = materialComponent.material
      if (!material?.isMaterial) return

      const rendererEntity = getRendererEntity(entity)
      const csm = getOptionalComponent(rendererEntity, CSMComponent)
      if (!csm) return

      // Check if CSM is supported by the current renderer
      if (!isCSMPluginSupportedByRenderer(rendererEntity)) {
        console.warn('CSM: Current renderer does not support Cascaded Shadow Maps')
        return
      }

      material.defines = material.defines || {}
      material.defines.USE_CSM = 1
      material.defines.CSM_CASCADES = csm.cascades

      if (csm.fade) {
        material.defines.CSM_FADE = ''
      }

      const breaksVec2: Vector2[] = []

      const createShaderCallback = (isWebGPU: boolean) => (shader: any) => {
        const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
        const far = Math.min(camera.far, csm.maxFar)
        const near = Math.min(csm.maxFar, camera.near)
        CSM.getExtendedBreaks(breaksVec2, rendererEntity)

        // Set uniforms (same for both WebGL and WebGPU)
        shader.uniforms.CSM_cascades = { value: breaksVec2 }
        shader.uniforms.cameraNear = { value: near }
        shader.uniforms.shadowFar = { value: far }
      }

      // Apply the plugin based on renderer capabilities
      if (supportsOnBeforeCompile(rendererEntity)) {
        // WebGL: Use onBeforeCompile callback with GLSL
        const callback = createShaderCallback(false)
        setPlugin(materialComponent.material as Material, callback)
      }

      material.needsUpdate = true

      return () => {
        const currentCallback = createShaderCallback(false)
        removePlugin(materialComponent.material as Material, currentCallback)

        if (material.defines) {
          delete material.defines.USE_CSM
          delete material.defines.CSM_CASCADES
          delete material.defines.CSM_FADE
        }

        material.needsUpdate = true
      }
    }, [])

    return null
  }
})
