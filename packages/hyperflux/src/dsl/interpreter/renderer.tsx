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
import React, { ReactElement, useEffect } from 'react'
import {
  ComponentNode,
  ConditionalNode,
  EffectNode,
  EvaluationContext,
  HookStateNode,
  MapNode,
  Node,
  TextNode
} from '../types'
import { evaluateExpression } from './evaluator'
import { createEvaluationContext, useStateValue } from './state'

/**
 * Props for the NodeRenderer component
 */
interface NodeRendererProps {
  node: Node
  states: Record<string, State<any>>
  localVars: Record<string, any>
}

/**
 * Renders a node based on its type
 */
export function NodeRenderer({ node, states, localVars }: NodeRendererProps): ReactElement | null {
  const context = createEvaluationContext(states, localVars)

  switch (node.type) {
    case 'hookstate':
      return renderHookStateNode(node, states, context)
    case 'effect':
      return renderEffectNode(node, states, context)
    case 'component':
      return renderComponentNode(node, states, context)
    case 'conditional':
      return renderConditionalNode(node, states, context)
    case 'map':
      return renderMapNode(node, states, context)
    case 'text':
      return renderTextNode(node as any, context)
    default:
      console.error(`Unknown node type: ${(node as any).type}`)
      return null
  }
}

/**
 * Renders a HookStateNode
 */
function renderHookStateNode(
  node: HookStateNode,
  states: Record<string, State<any>>,
  context: EvaluationContext
): null {
  const { key, scope = 'global', initial } = node

  // Create or get the state
  const state = useStateValue(key, scope, initial, context)

  // Add the state to the states map
  states[key] = state

  // HookStateNode doesn't render anything
  return null
}

/**
 * Renders an EffectNode
 */
function renderEffectNode(node: EffectNode, states: Record<string, State<any>>, context: EvaluationContext): null {
  const { deps, body, cleanup } = node

  // Create dependencies array
  const depsArray = deps.map((dep) => {
    // If the dependency is a state key, use the state value
    if (states[dep]) {
      return states[dep].value
    }

    // Otherwise, evaluate it as an expression
    return evaluateExpression(dep, context)
  })

  // Create the effect
  useEffect(() => {
    // Evaluate the body expression
    evaluateExpression(body, context)

    // Return cleanup function if provided
    if (cleanup) {
      return () => {
        evaluateExpression(cleanup, context)
      }
    }

    return undefined
  }, depsArray)

  // EffectNode doesn't render anything
  return null
}

/**
 * Renders a ComponentNode
 */
function renderComponentNode(
  node: ComponentNode,
  states: Record<string, State<any>>,
  context: EvaluationContext
): ReactElement {
  const { name, props = {}, children = [] } = node

  // Evaluate props
  const evaluatedProps: Record<string, any> = {}

  for (const [key, value] of Object.entries(props)) {
    evaluatedProps[key] = evaluateExpression(value, context)
  }

  // Render children
  const renderedChildren = children.map((child, index) => (
    <NodeRenderer key={index} node={child} states={states} localVars={context} />
  ))

  // Handle special case for 'text' component
  if (name === 'text') {
    // For 'text', just return the children directly as a string
    const content = evaluatedProps.children || evaluatedProps.value
    return <>{content}</>
  }

  // Create the component
  return React.createElement(name, evaluatedProps, ...renderedChildren)
}

/**
 * Renders a ConditionalNode
 */
function renderConditionalNode(
  node: ConditionalNode,
  states: Record<string, State<any>>,
  context: EvaluationContext
): ReactElement | null {
  const { cond, then, else: elseBranch } = node

  // Evaluate the condition
  const condition = evaluateExpression(cond, context)

  // Render the appropriate branch
  if (condition) {
    return (
      <>
        {then.map((child, index) => (
          <NodeRenderer key={index} node={child} states={states} localVars={context} />
        ))}
      </>
    )
  } else if (elseBranch) {
    return (
      <>
        {elseBranch.map((child, index) => (
          <NodeRenderer key={index} node={child} states={states} localVars={context} />
        ))}
      </>
    )
  }

  return null
}

/**
 * Renders a MapNode
 */
function renderMapNode(node: MapNode, states: Record<string, State<any>>, context: EvaluationContext): ReactElement {
  const { items, itemName, body } = node

  // Evaluate the items expression
  const itemsArray = evaluateExpression(items, context)

  if (!Array.isArray(itemsArray)) {
    console.error('Map items must evaluate to an array')
    return <></>
  }

  // Render each item
  return (
    <>
      {itemsArray.map((item, index) => {
        // Create a new context with the item
        const itemContext = {
          ...context,
          [itemName]: item
        }

        // Render the body for this item
        return (
          <React.Fragment key={index}>
            {body.map((child, childIndex) => (
              <NodeRenderer key={childIndex} node={child} states={states} localVars={itemContext} />
            ))}
          </React.Fragment>
        )
      })}
    </>
  )
}

/**
 * Renders a TextNode
 */
function renderTextNode(node: TextNode, context: EvaluationContext): ReactElement {
  const { props = {} } = node

  // Evaluate the content
  const content = evaluateExpression(props.children || props.value || '', context)

  // Return the content as a string
  return <>{content}</>
}
