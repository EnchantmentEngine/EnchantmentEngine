import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'

export const ShadowComponent = defineComponent({
  name: 'ShadowComponent',
  jsonID: 'EE_shadow',

  schema: Schema.Object({
    cast: Schema.Bool({ default: true }),
    receive: Schema.Bool({ default: true })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const shadowComponent = useComponent(entity, ShadowComponent)
    const object = useComponent(entity, ObjectComponent)
    const mesh = useOptionalComponent(entity, MeshComponent)

    useEffect(() => {
      return () => {
        object.castShadow = false
        object.receiveShadow = false
      }
    }, [])

    useEffect(() => {
      object.castShadow = shadowComponent.cast
      object.receiveShadow = shadowComponent.receive
    }, [!!object, mesh, shadowComponent.cast, shadowComponent.receive])

    return null
  }
})
