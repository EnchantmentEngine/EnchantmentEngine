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

import { hookstate, State } from '@hookstate/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvaluationContext } from '../../src/dsl/interpreter/state'
import { defineState, getMutableState, StateDefinitions } from '../../src/functions/StateFunctions'
import { createHyperStore, HyperFlux } from '../../src/functions/StoreFunctions'

describe('State Management', () => {
  beforeEach(() => {
    // Clear global states between tests
    vi.resetModules()

    // Ensure HyperFlux store is initialized
    if (!HyperFlux.store) {
      createHyperStore()
    }
  })

  // Test global state management
  it('should properly manage global state', () => {
    // Define the state
    let globalState: ReturnType<typeof defineState> | { name: string; initial: number }
    try {
      if (!StateDefinitions.has('counter')) {
        globalState = defineState({ name: 'counter', initial: 0 })
      } else {
        globalState = StateDefinitions.get('counter')!
      }
    } catch (e) {
      // State might already be defined, ignore the error
      globalState = { name: 'counter', initial: 0 }
    }

    // Get the mutable state
    const mutableState = getMutableState(globalState)

    // Initial value should be 0
    expect(mutableState.value).toBe(0)

    // Update the state
    mutableState.set(5)

    // Value should be updated
    expect(mutableState.value).toBe(5)
  })

  // Test local state management using hookstate directly
  it('should properly manage local state', () => {
    // Create a local state
    const localState = hookstate(10)

    // Initial value should be 10
    expect(localState.value).toBe(10)

    // Create a global state with the same name
    let globalState: ReturnType<typeof defineState> | { name: string; initial: number }
    try {
      if (!StateDefinitions.has('localCounter')) {
        globalState = defineState({ name: 'localCounter', initial: 0 })
      } else {
        globalState = StateDefinitions.get('localCounter')!
      }
    } catch (e) {
      // State might already be defined, ignore the error
      globalState = { name: 'localCounter', initial: 0 }
    }

    // Get the mutable global state
    const mutableGlobalState = getMutableState(globalState)

    // Update the global state
    mutableGlobalState.set(99)

    // Local state should not be affected by global state change
    expect(localState.value).toBe(10)

    // Update the local state
    localState.set(20)

    // Local state should be updated
    expect(localState.value).toBe(20)

    // Global state should remain unchanged
    expect(mutableGlobalState.value).toBe(99)
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
  })
})
