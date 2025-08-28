import { defineComponent, EntitySchema, removeComponent, setComponent, useEntityContext } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { useEffect } from 'react'

export const TriggerCallbackComponent = defineComponent({
  name: 'TriggerCallbackComponent',
  jsonID: 'EE_trigger',

  schema: Schema.Object({
    triggers: Schema.Array(
      Schema.Object({
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        onEnter: Schema.String(),
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
         */
        onExit: Schema.String(),
        /**
         * empty string represents self
         */
        target: EntitySchema.EntityID()
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
