import { ArrayCamera, PerspectiveCamera } from 'three'

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
import { CameraComponent } from './CameraComponent'

export const PerspectiveCameraComponent = defineComponent({
  name: 'PerspectiveCameraComponent',
  jsonID: 'EE_perspective_camera',

  schema: S.Object({
    fov: S.Number({ default: 60 }),
    aspect: S.Number({ default: 1 }),
    near: S.Number({ default: 0.1 }),
    far: S.Number({ default: 1000 })
  }),

  onInit: (entity, initial) => {
    const { fov, aspect, near, far } = initial

    setComponent(entity, CameraComponent, new ArrayCamera([new PerspectiveCamera(fov, aspect, near, far)])) // we want to synchronously set the camera component for initialize engine
    return initial
  },

  onRemove: (entity) => {
    removeComponent(entity, CameraComponent)
  },

  reactor: () => {
    const entity = useEntityContext()
    const { fov, aspect, near, far } = useComponent(entity, PerspectiveCameraComponent)
    const camera = useOptionalComponent(entity, CameraComponent) as ArrayCamera

    useEffect(() => {
      if (!camera) return
      camera.fov = fov
      camera.aspect = aspect
      camera.near = near
      camera.far = far
      camera.updateProjectionMatrix()
    }, [fov, aspect, near, far, camera])

    return null
  }
})
