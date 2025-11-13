import { transform, TransformPlan } from '@hexafield/json-transform-patch'
import {
  defineAction,
  defineState,
  fromJSONSchema,
  getMutableState,
  getState,
  JSONSchema,
  TObjectSchema
} from '@ir-engine/hyperflux'

export type EventSourceDefinition = {
  name: string
  initial: any
  /**
   * Event definitions, including JSONSchema for validation and a TransformPlan to apply the event to the state
   */
  events: Record<string, { schema: JSONSchema & { type: 'object' }; validate: TransformPlan; transform: TransformPlan }>
}

export const defineEventSourceFromJSON = (definition: EventSourceDefinition) => {
  const actions = Object.fromEntries(
    Object.entries(definition.events).map(([eventName, { schema }]) => [
      eventName,
      defineAction(fromJSONSchema(schema) as TObjectSchema<any>)
    ])
  )

  const state = defineState({
    name: definition.name,
    initial: () => definition.initial,
    receptors: Object.fromEntries(
      Object.entries(definition.events).map(([eventName, event]) => {
        event.validate.atomic = true // enforce atomic to rollback on failure
        return [
          eventName,
          actions[eventName]
            .receive((action) => {
              getMutableState(state).set((current) => {
                const result = transform(event.transform, { event: action, state: current })
                return result?.state ?? result
              })
            })
            .validate((action) => {
              if (!event.validate) return true
              try {
                transform(event.validate, { event: action, state: getState(state) })
                return true
              } catch (error) {
                return false
              }
            })
        ]
      })
    )
  })

  return { actions, state }
}
