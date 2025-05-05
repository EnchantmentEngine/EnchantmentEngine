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

import { hookstate, State, useHookstate } from '@hookstate/core'
import { useRef, useState } from 'react'
import { getMutableState, StateDefinitions } from '../../functions/StateFunctions'
import { EvaluationContext, Expression } from '../types'
import { evaluateExpression } from './evaluator'

/**
 * Hook to use a state (global or local)
 *
 * @param key - The key for the state
 * @param scope - The scope of the state ('global' or 'local')
 * @param initial - The initial value expression
 * @param context - The context for evaluating the initial expression
 * @returns The state object
 */
export function useStateValue<T>(
  key: string,
  scope: 'global' | 'local' = 'global',
  initial: Expression | undefined,
  context: EvaluationContext
): State<T> {
  // For local state, use useState and hookstate
  const [localInitialized, setLocalInitialized] = useState(false)
  const localStateRef = useRef<State<T> | null>(null)

  // Evaluate the initial value
  const initialValue = initial !== undefined ? evaluateExpression(initial, context) : undefined

  if (scope === 'local') {
    if (!localInitialized) {
      localStateRef.current = hookstate<T>(initialValue as T)
      setLocalInitialized(true)
    }
    return localStateRef.current as State<T>
  }

  // For global state, use the state definitions
  const globalState = getMutableState(StateDefinitions.get(key)!)
  return useHookstate<T>(globalState)
}

/**
 * Creates a context object for expression evaluation
 *
 * @param states - Map of state keys to state objects
 * @param localVars - Map of local variable names to values
 * @returns The evaluation context
 */
export function createEvaluationContext(
  states: Record<string, State<any>>,
  localVars: Record<string, any> = {}
): EvaluationContext {
  const context: EvaluationContext = {
    ...localVars
  }

  // Add state values to context
  Object.entries(states).forEach(([key, state]) => {
    context[key] = state.value
  })

  return context
}
