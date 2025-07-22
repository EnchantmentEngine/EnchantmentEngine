import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, hasComponent, removeComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { CallbackComponent, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

const LoadTagModeSchema = S.LiteralUnion(['distance', 'trigger'], { default: 'distance' })

export const SceneDynamicLoadComponent = defineComponent({
  name: 'SceneDynamicLoadComponent',
  jsonID: 'EE_dynamic_load',

  schema: S.Object({
    mode: LoadTagModeSchema,
    distance: S.Number({ default: 20 }),
    loaded: S.Bool({ default: false, serialized: false })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, SceneDynamicLoadComponent)

    /** Trigger mode */
    useEffect(() => {
      if (component.mode.value !== 'trigger') return

      function doLoad() {
        component.loaded.set(true)
      }

      function doUnload() {
        component.loaded.set(false)
      }

      if (hasComponent(entity, CallbackComponent)) {
        removeComponent(entity, CallbackComponent)
      }

      setCallback(entity, 'doLoad', doLoad)
      setCallback(entity, 'doUnload', doUnload)

      return () => {
        removeComponent(entity, CallbackComponent)
      }
    }, [component.mode])

    return null
  }
})
