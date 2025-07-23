import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ColliderHitEvent } from '../types/PhysicsTypes'

export const CollisionComponent = defineComponent({
  name: 'CollisionComponent',
  schema: S.Class(() => new Map<Entity, ColliderHitEvent>())
})
