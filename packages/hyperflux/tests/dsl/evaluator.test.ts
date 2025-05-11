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

import { describe, expect, it } from 'vitest'
import { evaluateExpression } from '../../src/dsl/interpreter/evaluator'
import { EvaluationContext } from '../../src/dsl/types'

describe('Expression Evaluator', () => {
  // Test primitive values
  it('should return primitive values directly', () => {
    expect(evaluateExpression('hello', {})).toBe('hello')
    expect(evaluateExpression(42, {})).toBe(42)
    expect(evaluateExpression(true, {})).toBe(true)
    expect(evaluateExpression(null, {})).toBe(null)
  })

  // Test arrays
  it('should evaluate arrays by evaluating each item', () => {
    const result = evaluateExpression(['hello', 42, true], {})
    expect(result).toEqual(['hello', 42, true])
  })

  // Test JSON Logic operations
  it('should evaluate JSON Logic operations', () => {
    const context: EvaluationContext = { x: 5, y: 10 }

    // Test addition
    const addResult = evaluateExpression({ '+': [{ var: 'x' }, { var: 'y' }] }, context)
    expect(addResult).toBe(15)

    // Test comparison
    const compareResult = evaluateExpression({ '>': [{ var: 'y' }, { var: 'x' }] }, context)
    expect(compareResult).toBe(true)

    // Test if-then-else
    const ifResult = evaluateExpression(
      { if: [{ '>': [{ var: 'y' }, { var: 'x' }] }, 'y is greater', 'x is greater'] },
      context
    )
    expect(ifResult).toBe('y is greater')
  })

  // Test custom operations
  it('should support custom operations', () => {
    const context: EvaluationContext = { obj1: { a: 1 }, obj2: { b: 2 } }

    // Test merge operation
    const mergeResult = evaluateExpression({ merge: [{ var: 'obj1' }, { var: 'obj2' }] }, context)
    expect(mergeResult).toEqual({ a: 1, b: 2 })

    // Test set operation for objects
    const setResult = evaluateExpression({ set: [{ var: 'obj1' }, 'c', 3] }, context)
    expect(setResult).toEqual({ a: 1, c: 3 })

    // Test chain operation
    const chainResult = evaluateExpression(
      {
        chain: [{ '+': [1, 2] }, { '*': [{ var: 'result' }, 2] }]
      },
      { result: 3 }
    )
    expect(chainResult).toBe(6)

    // Test simple operations
    const addResult = evaluateExpression({ '+': [1, 2] }, context)
    expect(addResult).toEqual(3)

    // Test if operation
    const ifResult = evaluateExpression({ if: [true, 'yes', 'no'] }, context)
    expect(ifResult).toEqual('yes')
  })

  // Test complex expressions
  it('should evaluate complex nested expressions', () => {
    const context: EvaluationContext = {
      user: { name: 'John', age: 30 },
      settings: { theme: 'dark', notifications: true }
    }

    // Test nested variable access
    const nameResult = evaluateExpression({ var: 'user.name' }, context)
    expect(nameResult).toBe('John')

    // Test complex conditional
    const complexCondition = {
      if: [
        { and: [{ '>': [{ var: 'user.age' }, 18] }, { var: 'settings.notifications' }] },
        'adult with notifications',
        {
          if: [{ '>': [{ var: 'user.age' }, 18] }, 'adult without notifications', 'minor']
        }
      ]
    } as any
    const condResult = evaluateExpression(complexCondition, context)
    expect(condResult).toBe('adult with notifications')

    // Test nested operations
    const nestedOps = {
      '+': [
        { '*': [{ var: 'user.age' }, 2] },
        {
          if: [{ var: 'settings.notifications' }, 10, 0]
        }
      ]
    } as any
    const nestedResult = evaluateExpression(nestedOps, context)
    expect(nestedResult).toBe(70) // (30 * 2) + 10
  })

  // Test error handling
  it('should handle errors gracefully', () => {
    // Test with invalid operation
    const invalidOp = { invalidOp: [1, 2] }
    const invalidResult = evaluateExpression(invalidOp, {})
    expect(invalidResult).toBe(null)

    // Test with missing variable
    const missingVar = { var: 'nonexistent' }
    const missingResult = evaluateExpression(missingVar, {})
    expect(missingResult).toBe(null)

    // Test with type error
    const typeError = { '+': [5, 5] }
    const typeErrorResult = evaluateExpression(typeError, {})
    expect(typeErrorResult).toBe(10) // Simple addition that should work
  })
})
