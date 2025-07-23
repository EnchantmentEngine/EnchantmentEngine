import { Entity } from '@ir-engine/ecs/src/Entity'
import { ValueType } from '@ir-engine/visual-script'

export const EntityValue: ValueType = {
  name: 'entity',
  creator: () => 0,
  deserialize: (value: Entity): Entity => value,
  serialize: (value: Entity) => value,
  equals: (a: Entity, b: Entity) => a === b,
  clone: (value: Entity) => value,
  lerp: function (start: any, end: any, t: number) {
    throw new Error('Function not implemented.')
  }
}
