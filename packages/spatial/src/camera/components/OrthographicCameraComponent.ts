import { useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useEffect } from 'react'
import { OrthographicCamera } from 'three'
import { CameraComponent } from './CameraComponent'

export const OrthographicCameraComponent = defineComponent({
  name: 'OrthographicCameraComponent',
  jsonID: 'EE_orthographic_camera',

  schema: S.Object({
    width: S.Number({ default: 1 }),
    height: S.Number({ default: 1 }),
    near: S.Number({ default: 0.1 }),
    far: S.Number({ default: 1000 })
  }),

  onInit: (entity, initial) => {
    const { width, height, near, far } = initial
    setComponent(
      entity,
      CameraComponent,
      new OrthographicCamera(-width / 2, width / 2, height / 2, height / 2, near, far)
    ) // initialize the camera synchronously
    return initial
  },

  onRemove: (entity) => {
    removeComponent(entity, CameraComponent)
  },

  reactor: () => {
    const entity = useEntityContext()
    const { width, height, near, far } = useComponent(entity, OrthographicCameraComponent)
    const camera = useOptionalComponent(entity, CameraComponent) as OrthographicCamera

    useEffect(() => {
      if (!camera) return
      camera.left = -width / 2
      camera.right = width / 2
      camera.top = height / 2
      camera.bottom = -height / 2
      camera.near = near
      camera.far = far
      camera.updateProjectionMatrix()
    }, [width, height, near, far, camera])

    return null
  }
})

export const CameraGizmoTagComponent = defineComponent({ name: 'CameraGizmoTag' })
