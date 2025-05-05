/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { JSONSchema } from '@ir-engine/ecs'
import { defineAction, defineState, getMutableState, getState, HyperFlux } from '@ir-engine/hyperflux'
import { DSLInterpreter } from '@ir-engine/hyperflux/src/dsl'
import { TreeRoot } from '@ir-engine/hyperflux/src/dsl/types'
import jsonLogic, { RulesLogic } from 'json-logic-js'
import React from 'react'
import { validateRuleAgainstSchema } from './jsonLogicUtils'

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
  reactor?: TreeRoot
}

/**
 * Applies a JSON Logic rule to transform state
 * @param state The current state object
 * @param rule The JSON Logic rule to apply
 * @param data Additional data to be used in the rule evaluation
 * @returns The transformed state
 */
export const applyStateTransformation = (state: any, rule: RulesLogic, data: any = {}) => {
  const context = {
    state,
    data
  }
  return jsonLogic.apply(rule, context)
}

/**
 * Validates a JSON Logic rule against a schema
 * @param rule The JSON Logic rule to validate
 * @param schema The JSON Schema to validate against
 * @returns Whether the rule is valid for the schema
 */
export const validateRule = (rule: RulesLogic, schema: JSONSchema): boolean => {
  if (typeof rule !== 'object' || rule === null) {
    return false
  }
  return validateRuleAgainstSchema(rule, schema)
}

/**
 * Creates a React component from a DSL tree
 * @param dsl The DSL tree
 * @param stateName The name of the state to provide context to the DSL
 * @returns A React component that renders the DSL
 */
const createReactorFromDSL = (dsl: TreeRoot, stateName: string) => {
  return () => {
    // Get the current state from the HyperFlux store
    const currentState = HyperFlux.store.stateMap[stateName]?.get({ noproxy: true }) || {}

    // Create the DSL interpreter with the current state as context
    return <DSLInterpreter dsl={dsl} initialContext={{ state: currentState }} />
  }
}

/**
 * Defines an activity with state, actions, and receptors using JSON Logic
 * @param description The activity description
 * @returns The defined activity with state and actions
 */
export const defineActivity = (description: ActivityDescription) => {
  const actions = description.actions.reduce(
    (acc, actionDesc) => {
      // Create a basic action with just the type
      acc[actionDesc.name] = defineAction({
        type: actionDesc.jsonID
      })
      return acc
    },
    {} as Record<string, ReturnType<typeof defineAction>>
  )

  // Create state definition options
  const stateOptions: any = {
    name: description.jsonID,
    initial: { count: 0 },
    receptors: Object.entries(description.state.receptors).reduce((acc, [actionName, rule]) => {
      const actionKey = Object.keys(actions).find((key) => actions[key].type === actionName || key === actionName)

      if (!actionKey) {
        console.warn(`No action found for receptor: ${actionName}`)
        return acc
      }

      acc[`on${actionKey.charAt(0).toUpperCase() + actionKey.slice(1)}`] = actions[actionKey].receive(
        (action: Record<string, any>) => {
          const currentState = getState(state)
          const newState = applyStateTransformation(currentState, rule, action)
          getMutableState(state).set({ count: newState })
        }
      )

      return acc
    }, {})
  }

  // Add reactor if provided
  if (description.reactor) {
    stateOptions.reactor = createReactorFromDSL(description.reactor, description.jsonID)
  }

  const state = defineState(stateOptions)

  return {
    state,
    actions
  }
}
