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

import { State } from '@hookstate/core'
import { act, render } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvaluationContext, getGlobalState, useStateValue } from '../../src/dsl/interpreter/state'

// Mock component for testing useStateValue
function TestComponent({
  stateKey,
  scope,
  initial,
  context,
  onRender
}: {
  stateKey: string
  scope?: 'global' | 'local'
  initial?: any
  context?: any
  onRender: (value: any) => void
}) {
  const state = useStateValue(stateKey, scope, initial, context || {})
  onRender(state.value)
  return <div data-testid="test-component">{JSON.stringify(state.value)}</div>
}

describe('State Management', () => {
  beforeEach(() => {
    // Clear global states between tests
    vi.resetModules()
  })

  // Test getGlobalState
  it('should create and retrieve global state', () => {
    const state1 = getGlobalState('test', 42)
    expect(state1.value).toBe(42)

    // Get the same state again
    const state2 = getGlobalState('test', 100) // Initial value should be ignored
    expect(state2.value).toBe(42)

    // They should be the same object
    state1.set(99)
    expect(state2.value).toBe(99)
  })

  // Test useStateValue with global scope
  it('should use global state with useStateValue', () => {
    const onRender = vi.fn()

    // Initial render
    const { rerender } = render(<TestComponent stateKey="counter" initial={0} onRender={onRender} />)

    expect(onRender).toHaveBeenCalledWith(0)

    // Update the state externally
    const globalState = getGlobalState('counter', 0)
    act(() => {
      globalState.set(5)
    })

    // Re-render
    rerender(<TestComponent stateKey="counter" initial={0} onRender={onRender} />)

    expect(onRender).toHaveBeenCalledWith(5)
  })

  // Test useStateValue with local scope
  it('should use local state with useStateValue', () => {
    const onRender = vi.fn()

    // Initial render with local scope
    const { rerender } = render(
      <TestComponent stateKey="localCounter" scope="local" initial={10} onRender={onRender} />
    )

    expect(onRender).toHaveBeenCalledWith(10)

    // Update the global state (should not affect local)
    const globalState = getGlobalState('localCounter', 0)
    act(() => {
      globalState.set(99)
    })

    // Re-render
    rerender(<TestComponent stateKey="localCounter" scope="local" initial={10} onRender={onRender} />)

    // Local state should not be affected by global state change
    expect(onRender).toHaveBeenCalledWith(10)
  })

  // Test createEvaluationContext
  it('should create evaluation context with states and local vars', () => {
    // Create some states using State objects directly
    const counterState = { value: 42 } as State<number>
    const nameState = { value: 'test' } as State<string>

    const states: Record<string, State<any>> = {
      counter: counterState,
      name: nameState
    }

    const localVars = {
      item: { id: 1, value: 'item1' },
      $special: 'special'
    }

    const context = createEvaluationContext(states, localVars)

    // Check state values
    expect(context.counter).toBe(42)
    expect(context.name).toBe('test')

    // Check local vars
    expect(context.item).toEqual({ id: 1, value: 'item1' })
    expect(context.$special).toBe('special')

    // Check special functions
    expect(typeof context.$.fetch).toBe('function')
  })
})
