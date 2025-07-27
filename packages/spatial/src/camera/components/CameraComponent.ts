import { ArrayCamera, OrthographicCamera, PerspectiveCamera } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'

export type CameraComponentType = ArrayCamera | OrthographicCamera

export const isOrthographicCamera = (camera: any): camera is OrthographicCamera => {
  return camera && camera.isOrthographicCamera
}

export const isPerspectiveCamera = (camera: any): camera is PerspectiveCamera => {
  return camera && camera.isPerspectiveCamera
}

export const CameraComponent = defineComponent({
  name: 'CameraComponent',
  jsonID: 'EE_camera',

  schema: S.Object({
    fov: S.Number({ default: 60 }),
    aspect: S.Number({ default: 1 }),
    near: S.Number({ default: 0.1 }),
    far: S.Number({ default: 1000 })
  }),

  onInit: (entity, initial): CameraComponentType => {
    // Create a PerspectiveCamera and wrap it in an ArrayCamera
    const perspectiveCamera = new PerspectiveCamera(initial.fov, initial.aspect, initial.near, initial.far)
    return new ArrayCamera([perspectiveCamera])
  },

  reactor: () => {
    const entity = useEntityContext()
    const cameraComponent = useComponent(entity, CameraComponent)

    useImmediateEffect(() => {
      const camera = cameraComponent.value
      setComponent(entity, ObjectComponent, camera as any)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [cameraComponent])

    return null
  }
})

export const CameraGizmoTagComponent = defineComponent({ name: 'CameraGizmoTag' })
