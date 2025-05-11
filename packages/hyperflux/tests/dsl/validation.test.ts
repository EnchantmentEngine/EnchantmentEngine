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
        // Define a state
        {
          type: 'hookstate',
          key: 'counter',
          scope: 'global',
          initial: 0
        },
        // Define an effect
        {
          type: 'effect',
          deps: ['counter'],
          body: { '+': [{ var: 'counter' }, 1] }
        },
        // Define a conditional
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [
            {
              type: 'hookstate',
              key: 'isAboveThreshold',
              scope: 'local',
              initial: true
            }
          ],
          else: [
            {
              type: 'hookstate',
              key: 'isAboveThreshold',
              scope: 'local',
              initial: false
            }
          ]
        },
        // Define a map
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item',
          body: [
            {
              type: 'hookstate',
              key: { cat: ['item_', { var: 'item' }] },
              scope: 'local',
              initial: { var: 'item' }
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

  // Test validateNode function
  it('should validate that node is an object', () => {
    // Test with non-object node
    const nonObjectNode = {
      tree: ['not an object']
    }
    const errors = validateDSL(nonObjectNode)
    expect(errors.some((e) => e.path === 'tree[0]' && e.message === 'Node must be an object')).toBe(true)

    // Test with null node
    const nullNode = {
      tree: [null]
    }
    const nullErrors = validateDSL(nullNode)
    expect(nullErrors.some((e) => e.path === 'tree[0]' && e.message === 'Node must be an object')).toBe(true)
  })

  it('should validate that node has a type property', () => {
    const noTypeNode = {
      tree: [
        {
          // Missing type
          key: 'test'
        }
      ]
    }
    const errors = validateDSL(noTypeNode)
    expect(errors.some((e) => e.path === 'tree[0].type' && e.message === 'Node must have a type')).toBe(true)
  })

  // Test validateHookStateNode function
  it('should validate HookStateNode key property', () => {
    // Test missing key
    const missingKey = {
      tree: [
        {
          type: 'hookstate',
          // Missing key
          scope: 'global',
          initial: 0
        }
      ]
    }
    const errors = validateDSL(missingKey)
    expect(errors.some((e) => e.path === 'tree[0].key' && e.message === 'HookStateNode must have a key')).toBe(true)

    // Test with key
    const withKey = {
      tree: [
        {
          type: 'hookstate',
          key: 'counter',
          scope: 'global',
          initial: 0
        }
      ]
    }
    const validErrors = validateDSL(withKey)
    expect(validErrors.length).toBe(0)
  })

  it('should validate HookStateNode scope property', () => {
    // Test invalid scope
    const invalidScope = {
      tree: [
        {
          type: 'hookstate',
          key: 'counter',
          scope: 'invalid', // Not 'global' or 'local'
          initial: 0
        }
      ]
    }
    const errors = validateDSL(invalidScope)
    expect(errors.some((e) => e.path === 'tree[0].scope' && e.message === 'scope must be "global" or "local"')).toBe(
      true
    )

    // Test valid scopes
    const globalScope = {
      tree: [
        {
          type: 'hookstate',
          key: 'counter',
          scope: 'global',
          initial: 0
        }
      ]
    }
    const globalErrors = validateDSL(globalScope)
    expect(globalErrors.length).toBe(0)

    const localScope = {
      tree: [
        {
          type: 'hookstate',
          key: 'counter',
          scope: 'local',
          initial: 0
        }
      ]
    }
    const localErrors = validateDSL(localScope)
    expect(localErrors.length).toBe(0)

    // Test default scope (omitted)
    const defaultScope = {
      tree: [
        {
          type: 'hookstate',
          key: 'counter',
          initial: 0
        }
      ]
    }
    const defaultErrors = validateDSL(defaultScope)
    expect(defaultErrors.length).toBe(0)
  })

  // Test validateEffectNode function
  it('should validate EffectNode deps property is an array', () => {
    // Test missing deps
    const missingDeps = {
      tree: [
        {
          type: 'effect',
          // Missing deps
          body: { '+': [{ var: 'counter' }, 1] }
        }
      ]
    }
    const errors = validateDSL(missingDeps)
    expect(errors.some((e) => e.path === 'tree[0].deps' && e.message === 'EffectNode must have deps array')).toBe(true)

    // Test non-array deps
    const nonArrayDeps = {
      tree: [
        {
          type: 'effect',
          deps: 'counter', // Should be an array
          body: { '+': [{ var: 'counter' }, 1] }
        }
      ]
    }
    const nonArrayErrors = validateDSL(nonArrayDeps)
    expect(
      nonArrayErrors.some((e) => e.path === 'tree[0].deps' && e.message === 'EffectNode must have deps array')
    ).toBe(true)

    // Test valid deps
    const validDeps = {
      tree: [
        {
          type: 'effect',
          deps: ['counter'],
          body: { '+': [{ var: 'counter' }, 1] }
        }
      ]
    }
    const validErrors = validateDSL(validDeps)
    expect(validErrors.length).toBe(0)
  })

  it('should validate EffectNode body property exists', () => {
    // Test missing body
    const missingBody = {
      tree: [
        {
          type: 'effect',
          deps: ['counter']
          // Missing body
        }
      ]
    }
    const errors = validateDSL(missingBody)
    expect(errors.some((e) => e.path === 'tree[0].body' && e.message === 'EffectNode must have a body')).toBe(true)

    // Test with body
    const withBody = {
      tree: [
        {
          type: 'effect',
          deps: ['counter'],
          body: { '+': [{ var: 'counter' }, 1] }
        }
      ]
    }
    const validErrors = validateDSL(withBody)
    expect(validErrors.length).toBe(0)
  })

  it('should validate EffectNode cleanup property', () => {
    // Test with cleanup
    const withCleanup = {
      tree: [
        {
          type: 'effect',
          deps: ['counter'],
          body: { '+': [{ var: 'counter' }, 1] },
          cleanup: { method: [{ var: 'console' }, 'log', ['Cleanup']] }
        }
      ]
    }
    const errors = validateDSL(withCleanup)
    expect(errors.length).toBe(0)

    // Test without cleanup (optional)
    const withoutCleanup = {
      tree: [
        {
          type: 'effect',
          deps: ['counter'],
          body: { '+': [{ var: 'counter' }, 1] }
        }
      ]
    }
    const withoutErrors = validateDSL(withoutCleanup)
    expect(withoutErrors.length).toBe(0)
  })

  // Test validateConditionalNode function
  it('should validate ConditionalNode cond property exists', () => {
    // Test missing cond
    const missingCond = {
      tree: [
        {
          type: 'conditional',
          // Missing cond
          then: [
            {
              type: 'hookstate',
              key: 'isAboveThreshold',
              scope: 'local',
              initial: true
            }
          ]
        }
      ]
    }
    const errors = validateDSL(missingCond)
    expect(errors.some((e) => e.path === 'tree[0].cond' && e.message === 'ConditionalNode must have a cond')).toBe(true)

    // Test with cond
    const withCond = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [
            {
              type: 'hookstate',
              key: 'isAboveThreshold',
              scope: 'local',
              initial: true
            }
          ]
        }
      ]
    }
    const validErrors = validateDSL(withCond)
    expect(validErrors.length).toBe(0)
  })

  it('should validate ConditionalNode then property is an array', () => {
    // Test missing then
    const missingThen = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] }
          // Missing then
        }
      ]
    }
    const errors = validateDSL(missingThen)
    expect(errors.some((e) => e.path === 'tree[0].then' && e.message === 'then must be an array')).toBe(true)

    // Test non-array then
    const nonArrayThen = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: 'not an array'
        }
      ]
    }
    const nonArrayErrors = validateDSL(nonArrayThen)
    expect(nonArrayErrors.some((e) => e.path === 'tree[0].then' && e.message === 'then must be an array')).toBe(true)
  })

  it('should validate each node in ConditionalNode then array', () => {
    // Test invalid node in then array
    const invalidThenNode = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [
            'not a valid node' // Should be an object with type
          ]
        }
      ]
    }
    const errors = validateDSL(invalidThenNode)
    expect(errors.some((e) => e.path === 'tree[0].then[0]' && e.message === 'Node must be an object')).toBe(true)

    // Test node with missing type in then array
    const missingTypeThenNode = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [
            {
              // Missing type
              key: 'test'
            }
          ]
        }
      ]
    }
    const missingTypeErrors = validateDSL(missingTypeThenNode)
    expect(
      missingTypeErrors.some((e) => e.path === 'tree[0].then[0].type' && e.message === 'Node must have a type')
    ).toBe(true)
  })

  it('should validate ConditionalNode else property is an array if it exists', () => {
    // Test non-array else
    const nonArrayElse = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [],
          else: 'not an array'
        }
      ]
    }
    const errors = validateDSL(nonArrayElse)
    expect(errors.some((e) => e.path === 'tree[0].else' && e.message === 'else must be an array')).toBe(true)

    // Test with valid else
    const validElse = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [],
          else: []
        }
      ]
    }
    const validErrors = validateDSL(validElse)
    expect(validErrors.length).toBe(0)

    // Test without else (optional)
    const withoutElse = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: []
        }
      ]
    }
    const withoutElseErrors = validateDSL(withoutElse)
    expect(withoutElseErrors.length).toBe(0)
  })

  it('should validate each node in ConditionalNode else array if it exists', () => {
    // Test invalid node in else array
    const invalidElseNode = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [],
          else: [
            'not a valid node' // Should be an object with type
          ]
        }
      ]
    }
    const errors = validateDSL(invalidElseNode)
    expect(errors.some((e) => e.path === 'tree[0].else[0]' && e.message === 'Node must be an object')).toBe(true)

    // Test node with missing type in else array
    const missingTypeElseNode = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [],
          else: [
            {
              // Missing type
              key: 'test'
            }
          ]
        }
      ]
    }
    const missingTypeErrors = validateDSL(missingTypeElseNode)
    expect(
      missingTypeErrors.some((e) => e.path === 'tree[0].else[0].type' && e.message === 'Node must have a type')
    ).toBe(true)
  })

  // Test validateMapNode function
  it('should validate MapNode items property exists', () => {
    // Test missing items
    const missingItems = {
      tree: [
        {
          type: 'map',
          // Missing items
          itemName: 'item',
          body: []
        }
      ]
    }
    const errors = validateDSL(missingItems)
    expect(errors.some((e) => e.path === 'tree[0].items' && e.message === 'MapNode must have items')).toBe(true)

    // Test with items
    const withItems = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item',
          body: []
        }
      ]
    }
    const validErrors = validateDSL(withItems)
    expect(validErrors.length).toBe(0)

    // Test with expression items
    const withExpressionItems = {
      tree: [
        {
          type: 'map',
          items: { var: 'items' },
          itemName: 'item',
          body: []
        }
      ]
    }
    const expressionErrors = validateDSL(withExpressionItems)
    expect(expressionErrors.length).toBe(0)
  })

  it('should validate MapNode itemName property exists', () => {
    // Test missing itemName
    const missingItemName = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          // Missing itemName
          body: []
        }
      ]
    }
    const errors = validateDSL(missingItemName)
    expect(errors.some((e) => e.path === 'tree[0].itemName' && e.message === 'MapNode must have an itemName')).toBe(
      true
    )

    // Test with itemName
    const withItemName = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item',
          body: []
        }
      ]
    }
    const validErrors = validateDSL(withItemName)
    expect(validErrors.length).toBe(0)
  })

  it('should validate MapNode body property is an array', () => {
    // Test missing body
    const missingBody = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item'
          // Missing body
        }
      ]
    }
    const errors = validateDSL(missingBody)
    expect(errors.some((e) => e.path === 'tree[0].body' && e.message === 'body must be an array')).toBe(true)

    // Test non-array body
    const nonArrayBody = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item',
          body: 'not an array'
        }
      ]
    }
    const nonArrayErrors = validateDSL(nonArrayBody)
    expect(nonArrayErrors.some((e) => e.path === 'tree[0].body' && e.message === 'body must be an array')).toBe(true)

    // Test with body
    const withBody = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item',
          body: []
        }
      ]
    }
    const validErrors = validateDSL(withBody)
    expect(validErrors.length).toBe(0)
  })

  it('should validate each node in MapNode body array', () => {
    // Test invalid node in body array
    const invalidBodyNode = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item',
          body: [
            'not a valid node' // Should be an object with type
          ]
        }
      ]
    }
    const errors = validateDSL(invalidBodyNode)
    expect(errors.some((e) => e.path === 'tree[0].body[0]' && e.message === 'Node must be an object')).toBe(true)

    // Test node with missing type in body array
    const missingTypeBodyNode = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item',
          body: [
            {
              // Missing type
              key: 'test'
            }
          ]
        }
      ]
    }
    const missingTypeErrors = validateDSL(missingTypeBodyNode)
    expect(
      missingTypeErrors.some((e) => e.path === 'tree[0].body[0].type' && e.message === 'Node must have a type')
    ).toBe(true)

    // Test with valid node in body array
    const validBodyNode = {
      tree: [
        {
          type: 'map',
          items: [1, 2, 3],
          itemName: 'item',
          body: [
            {
              type: 'hookstate',
              key: 'dynamicItem',
              scope: 'local',
              initial: { var: 'item' }
            }
          ]
        }
      ]
    }
    const validErrors = validateDSL(validBodyNode)
    expect(validErrors.length).toBe(0)
  })

  // Test complex validation scenarios
  it('should validate deeply nested node structures', () => {
    // Create a deeply nested structure
    const deeplyNested = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [
            {
              type: 'conditional',
              cond: { '<': [{ var: 'counter' }, 10] },
              then: [
                {
                  type: 'map',
                  items: [1, 2, 3],
                  itemName: 'item',
                  body: [
                    {
                      type: 'conditional',
                      cond: { '===': [{ var: 'item' }, 2] },
                      then: [
                        {
                          type: 'hookstate',
                          key: 'foundTwo',
                          scope: 'local',
                          initial: true
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }

    const errors = validateDSL(deeplyNested)
    expect(errors.length).toBe(0)

    // Create a deeply nested structure with an error
    const deeplyNestedWithError = {
      tree: [
        {
          type: 'conditional',
          cond: { '>': [{ var: 'counter' }, 5] },
          then: [
            {
              type: 'conditional',
              cond: { '<': [{ var: 'counter' }, 10] },
              then: [
                {
                  type: 'map',
                  items: [1, 2, 3],
                  itemName: 'item',
                  body: [
                    {
                      type: 'conditional',
                      cond: { '===': [{ var: 'item' }, 2] },
                      then: [
                        {
                          type: 'hookstate',
                          // Missing key
                          scope: 'local',
                          initial: true
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }

    const errorErrors = validateDSL(deeplyNestedWithError)
    expect(errorErrors.length).toBeGreaterThan(0)
    expect(errorErrors.some((e) => e.path.includes('key') && e.message === 'HookStateNode must have a key')).toBe(true)
  })

  it('should validate DSL with multiple errors and return all of them', () => {
    const multipleErrors = {
      tree: [
        {
          type: 'hookstate',
          // Missing key
          scope: 'invalid' // Invalid scope
        },
        {
          type: 'effect'
          // Missing deps
          // Missing body
        },
        {
          type: 'conditional',
          // Missing cond
          then: 'not an array' // Invalid then
        },
        {
          type: 'map',
          // Missing items
          // Missing itemName
          body: 'not an array' // Invalid body
        }
      ]
    }

    const errors = validateDSL(multipleErrors)

    // Check that we have multiple errors
    expect(errors.length).toBeGreaterThan(4)

    // Check for specific errors
    expect(errors.some((e) => e.path === 'tree[0].key')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[0].scope')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[1].deps')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[1].body')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[2].cond')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[2].then')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[3].items')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[3].itemName')).toBe(true)
    expect(errors.some((e) => e.path === 'tree[3].body')).toBe(true)
  })

  it('should validate DSL with complex expressions', () => {
    const complexExpressions = {
      tree: [
        {
          type: 'hookstate',
          key: 'result',
          initial: {
            if: [
              { '===': [{ var: 'mode' }, 'advanced'] },
              {
                chain: [{ '+': [{ '*': [{ var: 'x' }, { var: 'y' }] }, { var: 'z' }] }, { '/': [{ var: 'result' }, 2] }]
              },
              { '+': [{ var: 'x' }, { var: 'y' }] }
            ]
          }
        },
        {
          type: 'effect',
          deps: ['result'],
          body: {
            merge: [
              { var: 'state' },
              {
                computed: {
                  if: [
                    { '>': [{ var: 'result' }, 100] },
                    'high',
                    { if: [{ '<': [{ var: 'result' }, 0] }, 'negative', 'normal'] }
                  ]
                }
              }
            ]
          }
        }
      ]
    }

    const errors = validateDSL(complexExpressions)
    expect(errors.length).toBe(0)
  })

  it('should validate DSL with large trees', () => {
    // Create a large tree with 100 nodes
    const largeTree = {
      tree: Array(100)
        .fill(null)
        .map((_, i) => ({
          type: 'hookstate',
          key: `counter${i}`,
          scope: 'local',
          initial: i
        }))
    }

    const errors = validateDSL(largeTree)
    expect(errors.length).toBe(0)

    // Create a large tree with one error
    const largeTreeWithError = {
      tree: [
        ...Array(50)
          .fill(null)
          .map((_, i) => ({
            type: 'hookstate',
            key: `counter${i}`,
            scope: 'local',
            initial: i
          })),
        {
          type: 'unknown' // Invalid type
        },
        ...Array(49)
          .fill(null)
          .map((_, i) => ({
            type: 'hookstate',
            key: `counter${i + 51}`,
            scope: 'local',
            initial: i + 51
          }))
      ]
    }

    const errorErrors = validateDSL(largeTreeWithError)
    expect(errorErrors.length).toBe(1)
    expect(errorErrors[0].path).toBe('tree[50].type')
    expect(errorErrors[0].message).toBe('Unknown node type: unknown')
  })
})
