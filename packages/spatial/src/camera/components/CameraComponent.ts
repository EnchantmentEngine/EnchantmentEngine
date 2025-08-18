import { ArrayCamera, PerspectiveCamera } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema, useImmediateEffect } from '@ir-engine/hyperflux'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'

export const CameraComponent = defineComponent({
  name: 'CameraComponent',
  jsonID: 'EE_camera',

  schema: Schema.Object({
    fov: Schema.Number({ default: 60 }),
    aspect: Schema.Number({ default: 1 }),
    near: Schema.Number({ default: 0.1 }),
    far: Schema.Number({ default: 1000 })
  }),

  onInit: (entity, initial) =>
    new ArrayCamera([new PerspectiveCamera(initial.fov, initial.aspect, initial.near, initial.far)]),

  reactor: () => {
    const entity = useEntityContext()
    const camera = useComponent(entity, CameraComponent)

    useImmediateEffect(() => {
      setComponent(entity, ObjectComponent, camera)
      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])
    return null
  }
})

export const CameraGizmoTagComponent = defineComponent({ name: 'CameraGizmoTag' })
