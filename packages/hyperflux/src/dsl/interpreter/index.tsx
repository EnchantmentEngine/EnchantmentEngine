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
import React, { ReactElement, useMemo } from 'react'
import { TreeRoot } from '../types'
import { NodeRenderer } from './renderer'

/**
 * Props for the DSLInterpreter component
 */
interface DSLInterpreterProps {
  dsl: TreeRoot
  initialContext?: Record<string, any>
}

/**
 * Main component that interprets a DSL tree
 */
export function DSLInterpreter({ dsl, initialContext = {} }: DSLInterpreterProps): ReactElement {
  // Create a states map to track all hookstate instances
  const states = useMemo<Record<string, State<any>>>(() => ({}), [])

  return (
    <>
      {dsl.tree.map((node, index) => (
        <NodeRenderer key={index} node={node} states={states} localVars={initialContext} />
      ))}
    </>
  )
}

export * from './evaluator'
export * from './renderer'
export * from './state'
