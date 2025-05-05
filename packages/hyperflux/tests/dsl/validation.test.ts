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
import { validateDSL } from '../../src/dsl/schema/validation'

describe('Schema Validation', () => {
  // Test valid DSL
  it('should validate a valid DSL', () => {
    const validDSL = {
      tree: [
        {
          type: 'hookstate',
          key: 'counter',
          scope: 'global',
          initial: 0
        },
        {
          type: 'component',
          name: 'div',
          props: {
            className: 'container'
          },
          children: [
            {
              type: 'component',
              name: 'h1',
              children: [
                {
                  type: 'component',
                  name: 'text',
                  props: {
                    value: { var: 'counter' }
                  }
                }
              ]
            },
            {
              type: 'component',
              name: 'button',
              props: {
                onClick: { '+': [{ var: 'counter' }, 1] }
              },
              children: [
                {
                  type: 'component',
                  name: 'text',
                  props: {
                    value: 'Increment'
                  }
                }
              ]
            }
          ]
        }
      ]
    }

    const errors = validateDSL(validDSL)
    expect(errors).toHaveLength(0)
  })

  // Test invalid DSL
  it('should return errors for an invalid DSL', () => {
    const invalidDSL = {
      tree: [
        {
          type: 'hookstate'
          // Missing key
        },
        {
          type: 'effect'
          // Missing deps and body
        },
        {
          type: 'unknown'
        }
      ]
    }

    const errors = validateDSL(invalidDSL)
    expect(errors.length).toBeGreaterThan(0)

    // Check specific errors
    expect(errors.some((e) => e.path === 'tree[0].key')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[1].deps')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[1].body')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[2].type')).toBe(true)
  })

  // Test invalid tree
  it('should validate tree structure', () => {
    // Missing tree
    const missingTree = {}
    const missingTreeErrors = validateDSL(missingTree)
    expect(missingTreeErrors.some((e) => e.path === 'tree')).toBe(true)

    // Tree is not an array
    const invalidTree = { tree: 'not an array' }
    const invalidTreeErrors = validateDSL(invalidTree)
    expect(invalidTreeErrors.some((e) => e.path === 'tree')).toBe(true)
  })

  // Test node validation
  it('should validate specific node types', () => {
    // Invalid HookStateNode
    const invalidHookState = {
      tree: [
        {
          type: 'hookstate',
          key: 'counter',
          scope: 'invalid' // Invalid scope
        }
      ]
    }
    const hookStateErrors = validateDSL(invalidHookState)
    expect(hookStateErrors.some((e) => e.path === 'tree[0].scope')).toBe(true)

    // Invalid ConditionalNode
    const invalidConditional = {
      tree: [
        {
          type: 'conditional',
          cond: true,
          then: 'not an array' // Should be an array
        }
      ]
    }
    const conditionalErrors = validateDSL(invalidConditional)
    expect(conditionalErrors.some((e) => e.path === 'tree[0].then')).toBe(true)

    // Invalid MapNode
    const invalidMap = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          // Missing itemName
          body: []
        }
      ]
    }
    const mapErrors = validateDSL(invalidMap)
    expect(mapErrors.some((e) => e.path === 'tree[0].itemName')).toBe(true)
  })
})
