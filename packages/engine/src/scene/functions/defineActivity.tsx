import { JSONSchema } from '@ir-engine/ecs'
import { RulesLogic } from 'json-logic-js'

type ActivityActionDescription = {
  name: string
  jsonID: string
  schema: JSONSchema
}

type ActivityDescription = {
  name: string
  jsonID: string
  state: {
    schema: JSONSchema
    receptors: {
      [action: string]: RulesLogic
    }
  }
  actions: ActivityActionDescription[]
}

export const defineActivity = (description: ActivityDescription) => {}
