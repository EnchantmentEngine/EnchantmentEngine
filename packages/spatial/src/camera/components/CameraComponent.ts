import { ArrayCamera, PerspectiveCamera } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'

export const CameraComponent = defineComponent({
  name: 'CameraComponent',
  jsonID: 'EE_camera',

  schema: S.Object({
    fov: S.Number({ default: 60 }),
    aspect: S.Number({ default: 1 }),
    near: S.Number({ default: 0.1 }),
    far: S.Number({ default: 1000 })
  }),

  onInit: (entity, initial) =>
    new ArrayCamera([new PerspectiveCamera(initial.fov, initial.aspect, initial.near, initial.far)]) as any,

  reactor: () => {
    const entity = useEntityContext()
    const cameraComponent = useComponent(entity, CameraComponent)

    useImmediateEffect(() => {
      const camera = cameraComponent.value
      setComponent(entity, ObjectComponent, camera)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [cameraComponent])

    return null
  }
})

export const CameraGizmoTagComponent = defineComponent({ name: 'CameraGizmoTag' })
