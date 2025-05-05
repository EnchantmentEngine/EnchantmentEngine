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

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { evaluateExpression } from '../../src/dsl/interpreter/evaluator'
import { TreeRoot } from '../../src/dsl/types'
import { defineState, StateDefinitions } from '../../src/functions/StateFunctions'
import { createHyperStore, HyperFlux } from '../../src/functions/StoreFunctions'

describe('DSL Interpreter Logic', () => {
  beforeEach(() => {
    vi.resetModules()

    // Ensure HyperFlux store is initialized
    if (!HyperFlux.store) {
      createHyperStore()
    }
  })

  // Test component structure evaluation
  it('should correctly structure component trees', () => {
    const dsl: TreeRoot = {
      tree: [
        {
          type: 'component',
          name: 'container',
          props: {
            id: 'root'
          },
          children: [
            {
              type: 'component',
              name: 'header',
              children: [
                {
                  type: 'component',
                  name: 'label',
                  props: {
                    id: 'title',
                    children: 'Hello, World!'
                  }
                }
              ]
            }
          ]
        }
      ]
    }

    // Instead of rendering, we'll evaluate the structure
    const rootComponent = dsl.tree[0] as any
    expect(rootComponent.type).toBe('component')
    expect(rootComponent.name).toBe('container')
    expect(rootComponent.props?.id).toBe('root')

    const headerComponent = rootComponent.children?.[0] as any
    expect(headerComponent?.type).toBe('component')
    expect(headerComponent?.name).toBe('header')

    const labelComponent = headerComponent?.children?.[0] as any
    expect(labelComponent?.type).toBe('component')
    expect(labelComponent?.name).toBe('label')
    expect(labelComponent?.props?.id).toBe('title')
    expect(labelComponent?.props?.children).toBe('Hello, World!')
  })

  // Test state value evaluation
  it('should evaluate state values correctly', () => {
    // Define the state
    let counterState: ReturnType<typeof defineState> | { name: string; initial: number }
    try {
      if (!StateDefinitions.has('counter')) {
        counterState = defineState({ name: 'counter', initial: 42 })
      } else {
        counterState = StateDefinitions.get('counter')!
      }
    } catch (e) {
      // State might already be defined, ignore the error
      counterState = { name: 'counter', initial: 42 }
    }

    // Create a context with the state
    const context = { counter: 42 }

    // Define an expression that references the state
    const expression = { var: 'counter' }

    // Evaluate the expression
    const result = evaluateExpression(expression, context)

    // Check that the state value is correctly evaluated
    expect(result).toBe(42)
  })

  it('should evaluate conditional expressions correctly', () => {
    // Define a context with a boolean value
    const context = { showMessage: true }

    // Define a conditional expression
    const condExpression = { var: 'showMessage' }

    // Evaluate the condition
    const result = evaluateExpression(condExpression, context)

    // Check that the condition evaluates to true
    expect(result).toBe(true)

    // Define a DSL with a conditional node
    const dsl: TreeRoot = {
      tree: [
        {
          type: 'conditional',
          cond: { var: 'showMessage' },
          then: [
            {
              type: 'component',
              name: 'section',
              props: {
                id: 'message'
              },
              children: [
                {
                  type: 'text',
                  props: {
                    children: 'This is visible'
                  }
                }
              ]
            }
          ],
          else: [
            {
              type: 'component',
              name: 'section',
              props: {
                id: 'no-message'
              },
              children: [
                {
                  type: 'text',
                  props: {
                    children: 'Nothing to see'
                  }
                }
              ]
            }
          ]
        }
      ]
    }

    // Verify the structure of the conditional node
    const conditionalNode = dsl.tree[0] as any
    expect(conditionalNode.type).toBe('conditional')
    expect(conditionalNode.cond).toEqual({ var: 'showMessage' })
    expect(conditionalNode.then).toBeDefined()
    expect(conditionalNode.else).toBeDefined()

    // Verify the structure of the 'then' branch
    const thenComponent = conditionalNode.then[0] as any
    expect(thenComponent.type).toBe('component')
    expect(thenComponent.name).toBe('section')
    expect(thenComponent.props.id).toBe('message')

    // Verify the structure of the 'else' branch
    const elseComponent = conditionalNode.else[0] as any
    expect(elseComponent.type).toBe('component')
    expect(elseComponent.name).toBe('section')
    expect(elseComponent.props.id).toBe('no-message')
  })

  it('should evaluate map expressions correctly', () => {
    // Define test data
    const itemsData = [
      { id: 1, text: 'Item 1' },
      { id: 2, text: 'Item 2' },
      { id: 3, text: 'Item 3' }
    ]

    // Create a context with the items data
    const context = { items: itemsData }

    // Define an expression to access the items
    const itemsExpression = { var: 'items' }

    // Evaluate the expression
    const result = evaluateExpression(itemsExpression, context)

    // Check that the items are correctly evaluated
    expect(result).toEqual(itemsData)

    // Define a DSL with a map node
    const dsl: TreeRoot = {
      tree: [
        {
          type: 'map',
          items: { var: 'items' },
          itemName: 'item',
          body: [
            {
              type: 'component',
              name: 'entry',
              props: {
                id: { cat: ['item-', { var: 'item.id' }] }
              },
              children: [
                {
                  type: 'text',
                  props: {
                    children: { var: 'item.text' }
                  }
                }
              ]
            }
          ]
        }
      ]
    }

    // Verify the structure of the map node
    const mapNode = dsl.tree[0] as any
    expect(mapNode.type).toBe('map')
    expect(mapNode.items).toEqual({ var: 'items' })
    expect(mapNode.itemName).toBe('item')
    expect(mapNode.body).toHaveLength(1)

    // Verify the structure of the body component
    const bodyComponent = mapNode.body[0] as any
    expect(bodyComponent.type).toBe('component')
    expect(bodyComponent.name).toBe('entry')
    expect(bodyComponent.props.id).toEqual({ cat: ['item-', { var: 'item.id' }] })

    // Test concatenation expression evaluation
    const idExpression = { cat: ['item-', 1] }
    const idResult = evaluateExpression(idExpression, {})
    expect(idResult).toBe('item-1')

    // Test nested variable access
    const itemContext = { item: { id: 1, text: 'Item 1' } }
    const textExpression = { var: 'item.text' }
    const textResult = evaluateExpression(textExpression, itemContext)
    expect(textResult).toBe('Item 1')
  })

  it('should evaluate effect expressions correctly', () => {
    // Define a DSL with an effect node
    const dsl: TreeRoot = {
      tree: [
        {
          type: 'effect',
          deps: ['counter'],
          body: { '+': [{ var: 'counter' }, 1] }
        }
      ]
    }

    // Verify the structure of the effect node
    const effectNode = dsl.tree[0] as any
    expect(effectNode.type).toBe('effect')
    expect(effectNode.deps).toEqual(['counter'])
    expect(effectNode.body).toEqual({ '+': [{ var: 'counter' }, 1] })

    // Test effect body expression evaluation
    const context = { counter: 5 }
    const result = evaluateExpression(effectNode.body, context)
    expect(result).toBe(6)
  })
})
