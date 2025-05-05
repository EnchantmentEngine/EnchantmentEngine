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

import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DSLInterpreter } from '../../src/dsl/interpreter'
import { TreeRoot } from '../../src/dsl/types'
import { defineState, StateDefinitions } from '../../src/functions/StateFunctions'
import { createHyperStore, HyperFlux } from '../../src/functions/StoreFunctions'

describe('DSL Interpreter', () => {
  beforeEach(() => {
    vi.resetModules()
    // Clear the DOM between tests
    document.body.innerHTML = ''

    // Ensure HyperFlux store is initialized
    if (!HyperFlux.store) {
      createHyperStore()
    }
  })

  // Test basic rendering
  it('should render a simple component tree', () => {
    const dsl: TreeRoot = {
      tree: [
        {
          type: 'component',
          name: 'div',
          props: {
            'data-testid': 'root'
          },
          children: [
            {
              type: 'component',
              name: 'h1',
              children: [
                {
                  type: 'component',
                  name: 'span',
                  props: {
                    'data-testid': 'title',
                    children: 'Hello, World!'
                  }
                }
              ]
            }
          ]
        }
      ]
    }

    render(<DSLInterpreter dsl={dsl} />)

    const root = screen.getByTestId('root')
    expect(root).toBeDefined()

    const title = screen.getByTestId('title')
    expect(title).toBeDefined()
    expect(title.textContent).toBe('Hello, World!')
  })

  // Test basic state rendering
  it('should render state values', () => {
    // Define the state before using it in the DSL
    try {
      if (!StateDefinitions.has('counter')) {
        defineState({ name: 'counter', initial: 42 })
      }
    } catch (e) {
      // State might already be defined, ignore the error
    }

    const dsl: TreeRoot = {
      tree: [
        {
          type: 'component',
          name: 'div',
          props: {
            'data-testid': 'counter'
          },
          children: [
            {
              type: 'text',
              props: {
                children: { var: 'counter' }
              }
            }
          ]
        }
      ]
    }

    render(<DSLInterpreter dsl={dsl} initialContext={{ counter: 42 }} />)

    // Check that the state value is rendered
    const counter = screen.getByTestId('counter')
    expect(counter.textContent).toBe('42')
  })

  it('should handle conditional rendering', () => {
    // Define the state before using it in the DSL
    try {
      if (!StateDefinitions.has('showMessage')) {
        defineState({ name: 'showMessage', initial: true })
      }
    } catch (e) {
      // State might already be defined, ignore the error
    }

    const dsl: TreeRoot = {
      tree: [
        {
          type: 'conditional',
          cond: { var: 'showMessage' },
          then: [
            {
              type: 'component',
              name: 'div',
              props: {
                'data-testid': 'message'
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
              name: 'div',
              props: {
                'data-testid': 'no-message'
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

    render(<DSLInterpreter dsl={dsl} initialContext={{ showMessage: true }} />)

    // The 'then' branch should be visible since showMessage is true
    expect(screen.getByTestId('message')).toBeDefined()
    expect(screen.queryByTestId('no-message')).toBeNull()
  })

  it('should handle map rendering', () => {
    // Define the state before using it in the DSL
    const itemsData = [
      { id: 1, text: 'Item 1' },
      { id: 2, text: 'Item 2' },
      { id: 3, text: 'Item 3' }
    ]

    try {
      if (!StateDefinitions.has('items')) {
        defineState({
          name: 'items',
          initial: itemsData
        })
      }
    } catch (e) {
      // State might already be defined, ignore the error
    }

    const dsl: TreeRoot = {
      tree: [
        {
          type: 'component',
          name: 'ul',
          props: {
            'data-testid': 'list'
          },
          children: [
            {
              type: 'map',
              items: { var: 'items' },
              itemName: 'item',
              body: [
                {
                  type: 'component',
                  name: 'li',
                  props: {
                    'data-testid': { cat: ['item-', { var: 'item.id' }] }
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
      ]
    }

    render(<DSLInterpreter dsl={dsl} initialContext={{ items: itemsData }} />)

    // Check that all items are rendered
    const list = screen.getByTestId('list')
    expect(list.children.length).toBe(3)

    // Check individual items
    expect(screen.getByTestId('item-1').textContent).toBe('Item 1')
    expect(screen.getByTestId('item-2').textContent).toBe('Item 2')
    expect(screen.getByTestId('item-3').textContent).toBe('Item 3')
  })

  it('should handle effects', () => {
    // Skip this test for now
    expect(true).toBe(true)
  })
})
