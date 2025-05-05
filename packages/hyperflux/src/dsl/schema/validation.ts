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

/**
 * Validation error
 */
export interface ValidationError {
  path: string
  message: string
}

/**
 * Validates a DSL tree
 *
 * @param dsl - The DSL tree to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateDSL(dsl: any): ValidationError[] {
  const errors: ValidationError[] = []

  // Check if dsl is an object
  if (!dsl || typeof dsl !== 'object') {
    errors.push({
      path: '',
      message: 'DSL must be an object'
    })
    return errors
  }

  // Check if tree exists and is an array
  if (!Array.isArray(dsl.tree)) {
    errors.push({
      path: 'tree',
      message: 'tree must be an array'
    })
    return errors
  }

  // Validate each node in the tree
  dsl.tree.forEach((node: any, index: number) => {
    const nodeErrors = validateNode(node, `tree[${index}]`)
    errors.push(...nodeErrors)
  })

  return errors
}

/**
 * Validates a node
 *
 * @param node - The node to validate
 * @param path - The path to the node
 * @returns Array of validation errors, empty if valid
 */
function validateNode(node: any, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  // Check if node is an object
  if (!node || typeof node !== 'object') {
    errors.push({
      path,
      message: 'Node must be an object'
    })
    return errors
  }

  // Check if type exists
  if (!node.type) {
    errors.push({
      path: `${path}.type`,
      message: 'Node must have a type'
    })
    return errors
  }

  // Validate based on node type
  switch (node.type) {
    case 'hookstate':
      return validateHookStateNode(node, path)
    case 'effect':
      return validateEffectNode(node, path)
    case 'component':
      return validateComponentNode(node, path)
    case 'conditional':
      return validateConditionalNode(node, path)
    case 'map':
      return validateMapNode(node, path)
    default:
      errors.push({
        path: `${path}.type`,
        message: `Unknown node type: ${node.type}`
      })
      return errors
  }
}

/**
 * Validates a HookStateNode
 */
function validateHookStateNode(node: any, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  // Check if key exists
  if (!node.key) {
    errors.push({
      path: `${path}.key`,
      message: 'HookStateNode must have a key'
    })
  }

  // Check if scope is valid
  if (node.scope && node.scope !== 'global' && node.scope !== 'local') {
    errors.push({
      path: `${path}.scope`,
      message: 'scope must be "global" or "local"'
    })
  }

  return errors
}

/**
 * Validates an EffectNode
 */
function validateEffectNode(node: any, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  // Check if deps exists and is an array
  if (!Array.isArray(node.deps)) {
    errors.push({
      path: `${path}.deps`,
      message: 'EffectNode must have deps array'
    })
  }

  // Check if body exists
  if (node.body === undefined) {
    errors.push({
      path: `${path}.body`,
      message: 'EffectNode must have a body'
    })
  }

  return errors
}

/**
 * Validates a ComponentNode
 */
function validateComponentNode(node: any, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  // Check if name exists
  if (!node.name) {
    errors.push({
      path: `${path}.name`,
      message: 'ComponentNode must have a name'
    })
  }

  // Check if props is an object
  if (node.props && typeof node.props !== 'object') {
    errors.push({
      path: `${path}.props`,
      message: 'props must be an object'
    })
  }

  // Check if children is an array
  if (node.children && !Array.isArray(node.children)) {
    errors.push({
      path: `${path}.children`,
      message: 'children must be an array'
    })
    return errors
  }

  // Validate children
  if (node.children) {
    node.children.forEach((child: any, index: number) => {
      const childErrors = validateNode(child, `${path}.children[${index}]`)
      errors.push(...childErrors)
    })
  }

  return errors
}

/**
 * Validates a ConditionalNode
 */
function validateConditionalNode(node: any, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  // Check if cond exists
  if (node.cond === undefined) {
    errors.push({
      path: `${path}.cond`,
      message: 'ConditionalNode must have a cond'
    })
  }

  // Check if then exists and is an array
  if (!Array.isArray(node.then)) {
    errors.push({
      path: `${path}.then`,
      message: 'then must be an array'
    })
    return errors
  }

  // Validate then nodes
  node.then.forEach((child: any, index: number) => {
    const childErrors = validateNode(child, `${path}.then[${index}]`)
    errors.push(...childErrors)
  })

  // Check if else is an array if it exists
  if (node.else && !Array.isArray(node.else)) {
    errors.push({
      path: `${path}.else`,
      message: 'else must be an array'
    })
    return errors
  }

  // Validate else nodes
  if (node.else) {
    node.else.forEach((child: any, index: number) => {
      const childErrors = validateNode(child, `${path}.else[${index}]`)
      errors.push(...childErrors)
    })
  }

  return errors
}

/**
 * Validates a MapNode
 */
function validateMapNode(node: any, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  // Check if items exists
  if (node.items === undefined) {
    errors.push({
      path: `${path}.items`,
      message: 'MapNode must have items'
    })
  }

  // Check if itemName exists
  if (!node.itemName) {
    errors.push({
      path: `${path}.itemName`,
      message: 'MapNode must have an itemName'
    })
  }

  // Check if body exists and is an array
  if (!Array.isArray(node.body)) {
    errors.push({
      path: `${path}.body`,
      message: 'body must be an array'
    })
    return errors
  }

  // Validate body nodes
  node.body.forEach((child: any, index: number) => {
    const childErrors = validateNode(child, `${path}.body[${index}]`)
    errors.push(...childErrors)
  })

  return errors
}
