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

import jsonLogic from 'json-logic-js'
import { EvaluationContext, EvaluationResult, Expression } from '../types'

/**
 * Evaluates a JSON Logic expression
 *
 * @param expression - The expression to evaluate
 * @param context - The context for evaluation
 * @returns The result of the evaluation
 */
export function evaluateExpression(expression: Expression, context: EvaluationContext): EvaluationResult {
  // If the expression is a primitive value, return it directly
  if (
    expression === null ||
    typeof expression === 'string' ||
    typeof expression === 'number' ||
    typeof expression === 'boolean'
  ) {
    return expression
  }

  // If the expression is an array, evaluate each item
  if (Array.isArray(expression)) {
    return expression.map((item) => evaluateExpression(item, context))
  }

  // Otherwise, it's a JSON Logic object, evaluate it
  try {
    // Handle special operations for state manipulation
    if (expression && typeof expression === 'object') {
      // If this is a set operation for state manipulation
      if (expression.set && Array.isArray(expression.set) && expression.set.length >= 2) {
        const setOp = expression.set as Expression[]
        const target = setOp[0]
        const value = setOp[1]

        // Evaluate the target and value
        const targetEval = evaluateExpression(target, context)
        const valueEval = evaluateExpression(value, context)

        // If the target is a state object, set its value
        if (
          targetEval &&
          typeof targetEval === 'object' &&
          'set' in targetEval &&
          typeof targetEval.set === 'function'
        ) {
          targetEval.set(valueEval)
          return valueEval
        } else if (
          target &&
          typeof target === 'object' &&
          'var' in target &&
          typeof target.var === 'string' &&
          context[target.var]
        ) {
          // If the target is a variable in the context
          const stateKey = target.var
          if (
            context[stateKey] &&
            typeof context[stateKey] === 'object' &&
            'set' in context[stateKey] &&
            typeof context[stateKey].set === 'function'
          ) {
            context[stateKey].set(valueEval)
            return valueEval
          }
        }
      }
    }

    return jsonLogic.apply(expression, context)
  } catch (error) {
    console.error('Error evaluating expression:', expression, error)
    return null
  }
}

/**
 * Adds custom operations to JSON Logic
 */
export function extendJsonLogic(): void {
  // Add a merge operation for merging objects
  jsonLogic.add_operation('merge', function (...args) {
    return Object.assign({}, ...args)
  })

  // Add a set operation for setting object properties
  jsonLogic.add_operation('set', function (obj, key, value) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    const result = { ...obj }
    result[key] = value
    return result
  })

  // Add a chain operation for chaining operations
  jsonLogic.add_operation('chain', function (...operations) {
    // The last operation is the result
    return operations[operations.length - 1]
  })
}

// Initialize custom operations
extendJsonLogic()
