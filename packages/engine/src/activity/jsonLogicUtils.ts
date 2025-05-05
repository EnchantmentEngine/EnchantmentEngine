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
import { RulesLogic } from 'json-logic-js'

/**
 * Creates a rule to get a value from state
 * @param path The path to the value in state
 * @returns A JSON Logic rule that retrieves the value
 */
export const getStateValue = (path: string | string[]): RulesLogic => {
  const pathArray = Array.isArray(path) ? path : path.split('.')
  let rule: RulesLogic<any> = { var: 'state' }
  for (const segment of pathArray) {
    rule = { var: segment, in: rule }
  }
  return rule
}

/**
 * Creates a rule to get a value from the action data
 * @param path The path to the value in the action data
 * @returns A JSON Logic rule that retrieves the value
 */
export const getActionValue = (path: string | string[]): RulesLogic => {
  const pathArray = Array.isArray(path) ? path : path.split('.')
  let rule: RulesLogic<any> = { var: 'data' }
  for (const segment of pathArray) {
    rule = { var: segment, in: rule }
  }
  return rule
}

/**
 * Creates a rule to merge an object into state
 * @param statePath The path to the state object to merge into
 * @param valueRule The rule that produces the value to merge
 * @returns A JSON Logic rule that merges the value into state
 */
export const mergeIntoState = (statePath: string | string[], valueRule: RulesLogic): RulesLogic => {
  return {
    merge: [getStateValue(statePath), valueRule]
  }
}

/**
 * Creates a rule to set a specific state property
 * @param statePath The path to the state property to set
 * @param valueRule The rule that produces the value to set
 * @returns A JSON Logic rule that sets the state property
 */
export const setStateProperty = (statePath: string | string[], valueRule: RulesLogic): RulesLogic<any> => {
  const pathArray = Array.isArray(statePath) ? statePath : statePath.split('.')
  const propertyName = pathArray.pop()
  const parentPath = pathArray
  return {
    set: [getStateValue(parentPath), propertyName, valueRule]
  }
}

/**
 * Creates a conditional rule
 * @param condition The condition rule
 * @param thenRule The rule to apply if condition is true
 * @param elseRule The rule to apply if condition is false
 * @returns A JSON Logic rule for the conditional
 */
export const ifThenElse = (condition: RulesLogic, thenRule: RulesLogic, elseRule?: RulesLogic): RulesLogic<any> => {
  return {
    if: [condition, thenRule, ...(elseRule ? [elseRule] : [])]
  }
}

/**
 * Creates a rule for numerical operations
 * @param operator The operator to use ('+', '-', '*', '/', '%')
 * @param operands The operands for the operation
 * @returns A JSON Logic rule for the numerical operation
 */
export const mathOperation = (operator: '+' | '-' | '*' | '/' | '%', ...operands: RulesLogic[]): RulesLogic<any> => {
  return {
    [operator]: operands
  }
}

/**
 * Creates a rule for string operations
 * @param strings The strings or rules to concatenate
 * @returns A JSON Logic rule for string concatenation
 */
export const concat = (...strings: (string | RulesLogic)[]): RulesLogic<any> => {
  return {
    cat: strings
  }
}

/**
 * Creates a rule for logical operations
 * @param operator The logical operator to use ('and', 'or', '!')
 * @param operands The operands for the operation
 * @returns A JSON Logic rule for the logical operation
 */
export const logicalOperation = (operator: 'and' | 'or' | '!', ...operands: RulesLogic[]): RulesLogic<any> => {
  return {
    [operator]: operands
  }
}

/**
 * Creates a rule for comparison operations
 * @param operator The comparison operator to use ('==', '===', '!=', '!==', '>', '>=', '<', '<=')
 * @param left The left operand
 * @param right The right operand
 * @returns A JSON Logic rule for the comparison
 */
export const comparison = (
  operator: '==' | '===' | '!=' | '!==' | '>' | '>=' | '<' | '<=',
  left: RulesLogic,
  right: RulesLogic
): RulesLogic<any> => {
  return {
    [operator]: [left, right]
  }
}

/**
 * Validates that a JSON Logic rule only accesses properties defined in a schema
 * @param rule The JSON Logic rule to validate
 * @param schema The JSON Schema to validate against
 * @returns Whether the rule only accesses valid properties
 */
export const validateRuleAgainstSchema = (rule: RulesLogic, schema: JSONSchema): boolean => {
  if (typeof rule !== 'object' || rule === null) {
    return true
  }

  for (const [key, value] of Object.entries(rule)) {
    if (key === 'var' && typeof value === 'string' && value !== 'state' && value !== 'data') {
      if (!schema.properties || !(value in schema.properties)) {
        return false
      }
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (!validateRuleAgainstSchema(item, schema)) {
            return false
          }
        }
      } else {
        if (!validateRuleAgainstSchema(value, schema)) {
          return false
        }
      }
    }
  }

  return true
}

/**
 * Creates a complete state transformation rule from a set of operations
 * @param operations The operations to apply to the state
 * @returns A JSON Logic rule that applies all operations
 */
export const createStateTransformation = (...operations: RulesLogic[]): RulesLogic<any> => {
  if (operations.length === 1) {
    return operations[0]
  }
  return {
    chain: operations
  }
}
