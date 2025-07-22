import { useEffect } from 'react'
import { Mesh } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'

export const ShadowComponent = defineComponent({
  name: 'ShadowComponent',
  jsonID: 'EE_shadow',

  schema: S.Object({
    cast: S.Bool({ default: true }),
    receive: S.Bool({ default: true })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const shadowComponent = useComponent(entity, ShadowComponent)
    const object = useComponent(entity, ObjectComponent).get(NO_PROXY) as Mesh
    const mesh = useOptionalComponent(entity, MeshComponent)

    useEffect(() => {
      return () => {
        object.castShadow = false
        object.receiveShadow = false
      }
    }, [])

    useEffect(() => {
      object.castShadow = shadowComponent.cast.value
      object.receiveShadow = shadowComponent.receive.value
    }, [!!object, mesh, shadowComponent.cast, shadowComponent.receive])

    return null
  }
})
