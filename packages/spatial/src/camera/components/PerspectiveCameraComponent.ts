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
import { useImmediateEffect } from '@ir-engine/hyperflux'
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

  reactor: () => {
    const entity = useEntityContext()
    const { fov, aspect, near, far } = useComponent(entity, PerspectiveCameraComponent)
    const camera = useOptionalComponent(entity, CameraComponent) as ArrayCamera

    useImmediateEffect(() => {
      setComponent(entity, CameraComponent, new ArrayCamera([new PerspectiveCamera(fov, aspect, near, far)]))

      return () => {
        removeComponent(entity, CameraComponent)
      }
    }, [])

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

export const CameraGizmoTagComponent = defineComponent({ name: 'CameraGizmoTag' })
