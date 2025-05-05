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

import { RulesLogic } from 'json-logic-js'
import { describe, expect, it } from 'vitest'

import { applyStateTransformation } from './defineActivity'
import {
  comparison,
  concat,
  createStateTransformation,
  getActionValue,
  getStateValue,
  ifThenElse,
  logicalOperation,
  mathOperation,
  mergeIntoState,
  setStateProperty
} from './jsonLogicUtils'

describe('JSON Logic State Mutations', () => {
  it('should apply simple state transformations', () => {
    const state = { count: 5 }
    const rule = { '+': [{ var: 'state.count' }, 1] } as RulesLogic
    const result = applyStateTransformation(state, rule)

    expect(result).toBe(6)
  })

  it('should use action data in transformations', () => {
    const state = { count: 5 }
    const action = { amount: 3 }
    const rule = { '+': [{ var: 'state.count' }, { var: 'data.amount' }] } as RulesLogic
    const result = applyStateTransformation(state, rule, action)

    expect(result).toBe(8)
  })

  it('should handle conditional logic', () => {
    const state = { count: 5, message: 'Hello' }
    const rule = {
      if: [{ '>': [{ var: 'state.count' }, 3] }, { var: 'state.message' }, 'Count is too low']
    } as RulesLogic
    const result = applyStateTransformation(state, rule)

    expect(result).toBe('Hello')

    const state2 = { count: 2, message: 'Hello' }
    const result2 = applyStateTransformation(state2, rule)

    expect(result2).toBe('Count is too low')
  })

  it('should use utility functions to create JSON Logic rules', () => {
    const getCountRule = getStateValue('count')
    expect(getCountRule).toEqual({ var: 'count', in: { var: 'state' } })

    const getAmountRule = getActionValue('amount')
    expect(getAmountRule).toEqual({ var: 'amount', in: { var: 'data' } })

    const setCountRule = setStateProperty('count', 10)
    expect(setCountRule).toEqual({ set: [{ var: 'state' }, 'count', 10] })

    const userData = { name: 'John', age: 30 } as unknown as RulesLogic
    const mergeRule = mergeIntoState('user', userData)
    expect(mergeRule).toEqual({ merge: [{ var: 'user', in: { var: 'state' } }, userData] })

    const conditionRule = ifThenElse(comparison('>', getStateValue('count'), 5), 'High count', 'Low count')
    expect(conditionRule).toEqual({
      if: [{ '>': [{ var: 'count', in: { var: 'state' } }, 5] }, 'High count', 'Low count']
    })

    const mathRule = mathOperation('+', getStateValue('count'), getActionValue('amount'))
    expect(mathRule).toEqual({
      '+': [
        { var: 'count', in: { var: 'state' } },
        { var: 'amount', in: { var: 'data' } }
      ]
    })

    const concatRule = concat('Hello, ', getStateValue('name'), '!')
    expect(concatRule).toEqual({ cat: ['Hello, ', { var: 'name', in: { var: 'state' } }, '!'] })

    const logicRule = logicalOperation(
      'and',
      comparison('>', getStateValue('count'), 5),
      comparison('<', getStateValue('count'), 10)
    )
    expect(logicRule).toEqual({
      and: [{ '>': [{ var: 'count', in: { var: 'state' } }, 5] }, { '<': [{ var: 'count', in: { var: 'state' } }, 10] }]
    })

    const complexRule = createStateTransformation(
      setStateProperty('count', mathOperation('+', getStateValue('count'), 1)),
      setStateProperty('lastUpdated', Date.now()),
      ifThenElse(
        comparison('>', getStateValue('count'), 10),
        setStateProperty('message', 'Count is high'),
        setStateProperty('message', 'Count is low')
      )
    )

    expect(complexRule).toBeTypeOf('object')
    expect(complexRule).toHaveProperty('chain')
    expect(Array.isArray(complexRule.chain)).toBe(true)
    expect(complexRule.chain.length).toBe(3)
  })
})
