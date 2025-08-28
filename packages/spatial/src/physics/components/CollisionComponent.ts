import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { Schema } from '@ir-engine/hyperflux'
import { ColliderHitEvent } from '../types/PhysicsTypes'

export const CollisionComponent = defineComponent({
  name: 'CollisionComponent',
  schema: Schema.Class(() => new Map<Entity, ColliderHitEvent>())
})
