import { defineComponent, removeComponent, setComponent, useEntityContext } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { useEffect } from 'react'

export const TriggerCallbackComponent = defineComponent({
  name: 'TriggerCallbackComponent',
  jsonID: 'EE_trigger',

  schema: S.Object({
    triggers: S.Array(
      S.Object({
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        onEnter: S.String(),
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
         */
        onExit: S.String(),
        /**
         * empty string represents self
         */
        target: S.EntityID()
      })
    )
  }),

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      setComponent(entity, TriggerComponent)
      return () => {
        removeComponent(entity, TriggerComponent)
      }
    }, [])

    return null
  }
})
