import { useEffect } from 'react'

import { UUIDComponent, getComponent, hasComponent, useEntityContext } from '@ir-engine/ecs'
import { defineComponent, setComponent, useComponent, useHasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineAction, dispatchAction, getState, isClient } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'

import { EntitySchema } from '@ir-engine/ecs'
import { NetworkTopics, Schema } from '@ir-engine/hyperflux'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { InteractableComponent, XRUIVisibilityOverride } from '../interaction/components/InteractableComponent'

// @todo move this to spatial package schema definitions
export const XRHandedness = Schema.LiteralUnion(['none', 'left', 'right'])

/**
 * GrabbableComponent
 * - Allows an entity to be grabbed by an entity with a GrabberComponent
 */
export const GrabbableComponent = defineComponent({
  name: 'GrabbableComponent',
  jsonID: 'EE_grabbable',

  toJSON: () => ({}),

  grabbableCallbackName: 'grabCallback',

  reactor: function () {
    const entity = useEntityContext()
    const isGrabbed = useHasComponent(entity, GrabbedComponent)
    const interactableComponent = useComponent(entity, InteractableComponent)

    useEffect(() => {
      if (isClient) {
        setCallback(entity, GrabbableComponent.grabbableCallbackName, (entity: Entity, targetEntity: Entity) =>
          grabCallback(entity)
        )
      }
    }, [])

    useEffect(() => {
      setComponent(entity, InteractableComponent, {
        uiVisibilityOverride: isGrabbed ? XRUIVisibilityOverride.off : XRUIVisibilityOverride.none
      })
    }, [isGrabbed])

    return null
  },

  grab: (grabberEntity: Entity, grabbableEntity: Entity, handedness = getState(InputState).preferredHand) => {
    if (
      !grabberEntity ||
      !hasComponent(grabberEntity, GrabberComponent) ||
      !hasComponent(grabbableEntity, GrabbableComponent)
    )
      return

    const grabber = getComponent(grabberEntity, GrabberComponent)
    const grabbedEntity = grabber[handedness]!
    if (grabbedEntity) return
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: UUIDComponent.get(grabbableEntity),
        grabberEntityUUID: UUIDComponent.get(grabberEntity),
        grabbed: true,
        attachmentPoint: handedness
      })
    )
  },

  drop: (grabberEntity: Entity, grabbableEntity: Entity) => {
    if (
      !grabberEntity ||
      !hasComponent(grabberEntity, GrabberComponent) ||
      !hasComponent(grabbableEntity, GrabbableComponent)
    )
      return

    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: UUIDComponent.get(grabbableEntity),
        grabberEntityUUID: UUIDComponent.get(grabberEntity),
        grabbed: false
      })
    )
  }
})

const grabCallback = (grabbableEntity: Entity) => {
  const nonCapturedInputSources = InputSourceComponent.nonCapturedInputSources()
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  for (const entity of nonCapturedInputSources) {
    const inputSource = getComponent(entity, InputSourceComponent)
    if (hasComponent(grabbableEntity, GrabbedComponent)) {
      GrabbableComponent.drop(selfAvatarEntity, grabbableEntity)
    } else {
      GrabbableComponent.grab(
        selfAvatarEntity,
        grabbableEntity,
        inputSource.source.handedness === 'left' ? 'left' : 'right'
      )
    }
  }
}

/**
 * GrabbedComponent
 * - Indicates that an entity is currently being grabbed by a GrabberComponent
 */
export const GrabbedComponent = defineComponent({
  name: 'GrabbedComponent',

  schema: Schema.Object({
    attachmentPoint: XRHandedness,
    grabberEntity: EntitySchema.Entity()
  })
})

/**
 * GrabberComponent
 * - Allows an entity to grab a GrabbableComponent
 */
export const GrabberComponent = defineComponent({
  name: 'GrabberComponent',

  schema: Schema.Object({
    left: EntitySchema.Entity(),
    right: EntitySchema.Entity()
  })
})

export class GrabbableNetworkAction {
  static setGrabbedObject = defineAction(
    Schema.Object(
      {
        entityUUID: EntitySchema.EntityUUID(),
        grabbed: Schema.Bool(),
        attachmentPoint: Schema.Optional(Schema.LiteralUnion(['left', 'right'] as const)),
        grabberEntityUUID: EntitySchema.EntityUUID()
      },
      {
        $id: 'ee.engine.grabbable.SET_GRABBED_OBJECT',
        metadata: {
          $topic: NetworkTopics.world
        }
      }
    )
  )
}
