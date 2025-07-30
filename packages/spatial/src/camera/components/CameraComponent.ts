import { ArrayCamera, OrthographicCamera } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'

export type CameraComponentType = ArrayCamera | OrthographicCamera

export const CameraComponent = defineComponent({
  name: 'CameraComponent',
  jsonID: 'EE_camera',

  schema: S.Type<CameraComponentType>({ serialized: false }),

  reactor: () => {
    const entity = useEntityContext()
    const camera = useComponent(entity, CameraComponent)

    useImmediateEffect(() => {
      setComponent(entity, ObjectComponent, camera as any)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [camera])

    return null
  }
})

export const CameraGizmoTagComponent = defineComponent({ name: 'CameraGizmoTag' })
