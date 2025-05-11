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

import { Expression } from './expressions'

/**
 * Base node interface
 */
export interface BaseNode {
  type: string
}

/**
 * HookState node for state management
 */
export interface HookStateNode extends BaseNode {
  type: 'hookstate'
  key: string
  scope?: 'global' | 'local'
  initial?: Expression
}

/**
 * Effect node for side effects
 */
export interface EffectNode extends BaseNode {
  type: 'effect'
  deps: string[]
  body: Expression
  cleanup?: Expression
}

/**
 * Conditional node for conditional logic
 */
export interface ConditionalNode extends BaseNode {
  type: 'conditional'
  cond: Expression
  then: Node[]
  else?: Node[]
}

/**
 * Map node for processing collections
 */
export interface MapNode extends BaseNode {
  type: 'map'
  items: Expression
  itemName: string
  body: Node[]
}

/**
 * Union type of all node types
 */
export type Node = HookStateNode | EffectNode | ConditionalNode | MapNode

/**
 * Root tree structure
 */
export interface TreeRoot {
  tree: Node[]
}
