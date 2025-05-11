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
import { createEvaluationContext, createStateValue, evaluateExpression } from '@ir-engine/hyperflux/src/dsl'
import { TreeRoot } from '@ir-engine/hyperflux/src/dsl/types'
import jsonLogic, { RulesLogic } from 'json-logic-js'
import { validateRuleAgainstSchema } from './jsonLogicUtils'

/**
 * Description of an activity action
 */
type ActivityActionDescription = {
  /** The name of the action */
  name: string
  /** The JSON ID of the action */
  jsonID: string
  /** The JSON schema for the action payload */
  schema: JSONSchema
}

/**
 * Description of an activity
 */
type ActivityDescription = {
  /** The name of the activity */
  name: string
  /** The JSON ID of the activity */
  jsonID: string
  /** The state definition for the activity */
  state: {
    /** The JSON schema for the state */
    schema: JSONSchema
    /** The receptors for the state, mapping action types to JSON Logic rules */
    receptors: {
      [action: string]: RulesLogic
    }
  }
  /** The actions for the activity */
  actions: ActivityActionDescription[]
  /** Optional reactive DSL tree for side effects */
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
 * Creates a reactor function from a DSL tree
 * @param dsl The DSL tree
 * @param stateName The name of the state to provide context to the DSL
 * @returns A function that processes the DSL logic
 */
const createReactorFromDSL = (dsl: TreeRoot, stateName: string) => {
  // Create a map to store state objects
  const states: Record<string, any> = {}

  // Process each node in the tree
  dsl.tree.forEach((node) => {
    if (node.type === 'hookstate') {
      // Get the current state from the HyperFlux store
      const currentState = HyperFlux.store.stateMap[stateName]?.get({ noproxy: true }) || {}

      // Create the evaluation context with the current state
      const context = createEvaluationContext(states, { state: currentState })

      // Create the state value
      const key = typeof node.key === 'string' ? node.key : evaluateExpression(node.key, context)
      states[key] = createStateValue(key, node.scope || 'local', node.initial, context)
    }
  })

  // Return a function that will be called when the state changes
  return () => {
    // Get the current state from the HyperFlux store
    const currentState = HyperFlux.store.stateMap[stateName]?.get({ noproxy: true }) || {}

    // Create the evaluation context with the current state
    const context = createEvaluationContext(states, { state: currentState })

    // Process each node in the tree
    dsl.tree.forEach((node) => {
      if (node.type === 'effect') {
        // Check if any dependencies have changed
        const shouldRun = node.deps.some((dep) => {
          if (dep.startsWith('state.')) {
            const path = dep.substring(6)
            return currentState[path] !== undefined
          }
          return states[dep] !== undefined
        })

        if (shouldRun) {
          // Evaluate the effect body
          evaluateExpression(node.body, context)

          // Evaluate cleanup if provided
          if (node.cleanup) {
            return () => evaluateExpression(node.cleanup!, context)
          }
        }
      } else if (node.type === 'conditional') {
        // Evaluate the condition
        const condResult = evaluateExpression(node.cond, context)

        // Process the appropriate branch
        const nodesToProcess = condResult ? node.then : node.else || []

        // Process each node in the branch
        nodesToProcess.forEach((childNode) => {
          if (childNode.type === 'hookstate') {
            const key = typeof childNode.key === 'string' ? childNode.key : evaluateExpression(childNode.key, context)
            if (!states[key]) {
              states[key] = createStateValue(key, childNode.scope || 'local', childNode.initial, context)
            } else {
              // Update existing state
              if (childNode.initial !== undefined) {
                const value = evaluateExpression(childNode.initial, context)
                states[key].set(value)
              }
            }
          }
        })
      } else if (node.type === 'map') {
        // Evaluate the items
        const items = evaluateExpression(node.items, context)

        // Process each item
        if (Array.isArray(items)) {
          items.forEach((item) => {
            // Create a context with the item
            const itemContext = { ...context, [node.itemName]: item }

            // Process each node in the body
            node.body.forEach((childNode) => {
              if (childNode.type === 'hookstate') {
                const key =
                  typeof childNode.key === 'string' ? childNode.key : evaluateExpression(childNode.key, itemContext)
                if (!states[key]) {
                  states[key] = createStateValue(key, childNode.scope || 'local', childNode.initial, itemContext)
                } else {
                  // Update existing state
                  if (childNode.initial !== undefined) {
                    const value = evaluateExpression(childNode.initial, itemContext)
                    states[key].set(value)
                  }
                }
              }
            })
          })
        }
      }
    })
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
    // Initialize with default values based on schema
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

          // If the result is an object, merge it with the current state
          if (typeof newState === 'object' && newState !== null) {
            getMutableState(state).merge(newState)
          } else {
            // For primitive values, assume it's for a property that matches the action name
            // This is a common pattern for simple counters, etc.
            const propName = actionKey.toLowerCase()
            getMutableState(state).set({ [propName]: newState })
          }
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
