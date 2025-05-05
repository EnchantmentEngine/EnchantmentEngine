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

describe('DSL Interpreter', () => {
  beforeEach(() => {
    vi.resetModules()
    // Clear the DOM between tests
    document.body.innerHTML = ''
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

  // Skip the other tests for now
  it.skip('should handle state and updates', async () => {
    // Test implementation
  })

  it.skip('should handle conditional rendering', async () => {
    // Test implementation
  })

  it.skip('should handle map rendering', () => {
    // Test implementation
  })

  it.skip('should handle effects', async () => {
    // Test implementation
  })
})
