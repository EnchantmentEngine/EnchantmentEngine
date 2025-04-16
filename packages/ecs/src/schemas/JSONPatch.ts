/**
 * An implementation of JSON Patch as defined in RFC 6902
 * https://datatracker.ietf.org/doc/html/rfc6902
 */

/**
 * JSON Patch Add Operation as defined in RFC 6902
 */
export type JSONPatchAddOperation = {
  op: 'add'
  path: string
  value: any
}

/**
 * JSON Patch Remove Operation as defined in RFC 6902
 */
export type JSONPatchRemoveOperation = {
  op: 'remove'
  path: string
}

/**
 * JSON Patch Replace Operation as defined in RFC 6902
 */
export type JSONPatchReplaceOperation = {
  op: 'replace'
  path: string
  value: any
}

/**
 * JSON Patch Move Operation as defined in RFC 6902
 */
export type JSONPatchMoveOperation = {
  op: 'move'
  path: string
  from: string
}

/**
 * JSON Patch Copy Operation as defined in RFC 6902
 */
export type JSONPatchCopyOperation = {
  op: 'copy'
  path: string
  from: string
}

/**
 * JSON Patch Test Operation as defined in RFC 6902
 */
export type JSONPatchTestOperation = {
  op: 'test'
  path: string
  value: any
}

/**
 * JSON Patch Operation as defined in RFC 6902
 */
export type JSONPatchOperation =
  | JSONPatchAddOperation
  | JSONPatchRemoveOperation
  | JSONPatchReplaceOperation
  | JSONPatchMoveOperation
  | JSONPatchCopyOperation
  | JSONPatchTestOperation

/**
 * JSON Patch document as defined in RFC 6902
 */
export type JSONPatch = JSONPatchOperation[]

/**
 * Applies a JSON Patch to an object
 * @param obj The object to patch
 * @param patch The JSON Patch to apply
 * @returns A new object with the patch applied
 * @throws Error if the patch is invalid or cannot be applied
 */
export function applyJSONPatch<T>(obj: T, patch: JSONPatch): T {
  // Create a deep clone of the object to avoid mutating the original
  const result = JSON.parse(JSON.stringify(obj))

  for (const operation of patch) {
    const pathParts = operation.path.split('/').slice(1) // Remove empty string from split

    switch (operation.op) {
      case 'add': {
        const addOp = operation as JSONPatchAddOperation
        applyAdd(result, pathParts, addOp.value)
        break
      }
      case 'remove': {
        applyRemove(result, pathParts)
        break
      }
      case 'replace': {
        const replaceOp = operation as JSONPatchReplaceOperation
        applyReplace(result, pathParts, replaceOp.value)
        break
      }
      case 'move': {
        // We need to handle the case where 'from' is missing for testing purposes
        // In a real implementation, TypeScript would catch this at compile time
        if (!('from' in operation)) {
          throw new Error('Move operation requires "from" field')
        }
        const moveOp = operation as JSONPatchMoveOperation
        const fromParts = moveOp.from.split('/').slice(1)
        const valueToMove = getValueAtPath(result, fromParts)
        applyRemove(result, fromParts)
        applyAdd(result, pathParts, valueToMove)
        break
      }
      case 'copy': {
        // We need to handle the case where 'from' is missing for testing purposes
        // In a real implementation, TypeScript would catch this at compile time
        if (!('from' in operation)) {
          throw new Error('Copy operation requires "from" field')
        }
        const copyOp = operation as JSONPatchCopyOperation
        const fromParts = copyOp.from.split('/').slice(1)
        const valueToCopy = getValueAtPath(result, fromParts)
        applyAdd(result, pathParts, JSON.parse(JSON.stringify(valueToCopy)))
        break
      }
      case 'test': {
        const testOp = operation as JSONPatchTestOperation
        const currentValue = getValueAtPath(result, pathParts)
        if (JSON.stringify(currentValue) !== JSON.stringify(testOp.value)) {
          throw new Error(`Test failed: ${operation.path} does not match expected value`)
        }
        break
      }
      default: {
        // This ensures TypeScript will error if we miss a case
        // We need to cast to any first to avoid the TypeScript error
        const op = (operation as any).op
        throw new Error(`Unknown operation: ${op}`)
      }
    }
  }

  return result
}

/**
 * Gets the value at the specified path
 * @param obj The object to get the value from
 * @param pathParts The path parts to navigate
 * @returns The value at the specified path
 * @throws Error if the path does not exist
 */
function getValueAtPath(obj: any, pathParts: string[]): any {
  let current = obj
  for (const part of pathParts) {
    if (current === undefined || current[part] === undefined) {
      throw new Error(`Path ${pathParts.join('/')} does not exist`)
    }
    current = current[part]
  }
  return current
}

/**
 * Applies an 'add' operation
 * @param obj The object to modify
 * @param pathParts The path parts to navigate
 * @param value The value to add
 */
function applyAdd(obj: any, pathParts: string[], value: any): void {
  const lastPart = pathParts[pathParts.length - 1]
  const parentPath = pathParts.slice(0, -1)
  let parent = obj

  for (const part of parentPath) {
    if (parent[part] === undefined) {
      parent[part] = {}
    }
    parent = parent[part]
  }

  if (lastPart === '-' && Array.isArray(parent)) {
    parent.push(value)
  } else if (Array.isArray(parent) && !isNaN(parseInt(lastPart))) {
    // For arrays, we need to splice the value in at the specified index
    const index = parseInt(lastPart)
    parent.splice(index, 0, value)
  } else {
    parent[lastPart] = value
  }
}

/**
 * Applies a 'remove' operation
 * @param obj The object to modify
 * @param pathParts The path parts to navigate
 */
function applyRemove(obj: any, pathParts: string[]): void {
  const lastPart = pathParts[pathParts.length - 1]
  const parentPath = pathParts.slice(0, -1)
  let parent = obj

  for (const part of parentPath) {
    if (parent[part] === undefined) throw new Error(`Path ${pathParts.join('/')} does not exist`)
    parent = parent[part]
  }

  if (parent[lastPart] === undefined) {
    throw new Error(`Path ${pathParts.join('/')} does not exist`)
  }

  if (Array.isArray(parent)) {
    const index = parseInt(lastPart)
    if (isNaN(index)) throw new Error(`Invalid array index: ${lastPart}`)
    parent.splice(index, 1)
  } else {
    delete parent[lastPart]
  }
}

/**
 * Applies a 'replace' operation
 * @param obj The object to modify
 * @param pathParts The path parts to navigate
 * @param value The value to replace with
 */
function applyReplace(obj: any, pathParts: string[], value: any): void {
  const lastPart = pathParts[pathParts.length - 1]
  const parentPath = pathParts.slice(0, -1)
  let parent = obj

  for (const part of parentPath) {
    if (parent[part] === undefined) throw new Error(`Path ${pathParts.join('/')} does not exist`)
    parent = parent[part]
  }

  if (parent[lastPart] === undefined) {
    throw new Error(`Path ${pathParts.join('/')} does not exist`)
  }

  parent[lastPart] = value
}
