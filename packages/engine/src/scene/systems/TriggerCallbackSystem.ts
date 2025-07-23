import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent, getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { CollisionComponent } from '@ir-engine/spatial/src/physics/components/CollisionComponent'
import { PhysicsSystem } from '@ir-engine/spatial/src/physics/systems/PhysicsSystem'
import { ColliderHitEvent, CollisionEvents } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { TriggerCallbackComponent } from '../components/TriggerCallbackComponent'

export const triggerEnterOrExit = (triggerEntity: Entity, otherEntity: Entity, hit: ColliderHitEvent) => {
  const contextEntity = hit.shapeSelf?.entity ?? triggerEntity
  const triggerComponent = getOptionalComponent(contextEntity, TriggerCallbackComponent)
  if (!triggerComponent) return
  for (const trigger of triggerComponent.triggers) {
    if (trigger.target && !UUIDComponent.getEntityFromSameSourceByID(triggerEntity, trigger.target)) continue
    const targetEntity = trigger.target
      ? UUIDComponent.getEntityFromSameSourceByID(triggerEntity, trigger.target)
      : triggerEntity
    if (targetEntity && (trigger.onEnter || trigger.onExit)) {
      const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
      if (!callbacks) continue
      callbacks.get(hit.type === CollisionEvents.TRIGGER_START ? trigger.onEnter! : trigger.onExit!)?.(
        triggerEntity,
        otherEntity
      )
    }
  }
}

const collisionQuery = defineQuery([CollisionComponent])

const execute = () => {
  for (const entity of collisionQuery()) {
    for (const [e, hit] of getComponent(entity, CollisionComponent)) {
      if (hit.type === CollisionEvents.TRIGGER_START || hit.type === CollisionEvents.TRIGGER_END) {
        triggerEnterOrExit(entity, e, hit)
      }
    }
  }
}

export const TriggerCallbackSystem = defineSystem({
  uuid: 'ee.engine.TriggerCallbackSystem',
  insert: { with: PhysicsSystem },
  execute
})
