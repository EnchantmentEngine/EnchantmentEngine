import { NodeDefinitionsMap } from './Nodes/Registry/NodeDefinitionsMap'
import { ValueTypeMap } from './Values/ValueTypeMap'

export interface IRegistry {
  readonly values: ValueTypeMap
  readonly nodes: NodeDefinitionsMap
  readonly dependencies: Record<string, unknown>
}

export interface IQueryableRegistry<T> {
  get: (id: string) => T | undefined
  getAll: () => T[]
  getAllNames: () => string[]
  contains: (id: string) => boolean
}
