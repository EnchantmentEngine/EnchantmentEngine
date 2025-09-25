import { useEffect } from 'react'

import {
  definePrefab,
  getComponent,
  hasComponent,
  NetworkObjectComponent,
  useEntityContext,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import {
  defineComponent,
  entityExists,
  setComponent,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { dispatchAction, getState, HyperFlux, isClient, SceneUser } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'

import { EntitySchema } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
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

    // useHelperEntity(entity, () => new AxesHelper(0.5), true)

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
    if (grabbedEntity) GrabbableComponent.drop(grabberEntity, grabbedEntity)
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
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  GrabbableComponent.grab(
    selfAvatarEntity,
    grabbableEntity,
    'right' /** @todo implement proper XR grabbing by passing interaction source down through callbacks */
    // inputSource.source.handedness === 'left' ? 'left' : 'right'
  )
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

export const GrabbedPrefab = definePrefab({
  components: [GrabbedComponent],
  reactor: GrabbedReactor
})

function GrabbedReactor({ entity }: { entity: Entity }) {
  const entityUUID = UUIDComponent.use(entity)
  const { grabberEntity, attachmentPoint } = useComponent(entity, GrabbedComponent)

  const networkComponent = useComponent(entity, NetworkObjectComponent)
  const grabberNetworkComponent = useComponent(grabberEntity, NetworkObjectComponent)

  const ownedByScene = networkComponent.ownerId === SceneUser
  const grabbableAuthorityPeer = networkComponent.authorityPeerID
  const grabberAuthorityPeer = grabberNetworkComponent.authorityPeerID

  const hasAuthority = grabbableAuthorityPeer === grabberAuthorityPeer

  useEffect(() => {
    if (!entity || !grabberEntity || !hasAuthority) return

    setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: entity })

    if (hasComponent(entity, RigidBodyComponent)) {
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      Physics.wakeUp(Physics.getWorld(entity)!, entity)
    }

    return () => {
      if (entityExists(grabberEntity)) setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: null })
      if (!entityExists(entity)) return
      if (hasComponent(entity, RigidBodyComponent)) {
        setComponent(entity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.wakeUp(Physics.getWorld(entity)!, entity)
      }
    }
  }, [entity, grabberEntity, hasAuthority])

  const needsToRequestAuthority =
    entity !== UndefinedEntity &&
    grabberEntity !== UndefinedEntity &&
    (ownedByScene || grabbableAuthorityPeer !== grabberAuthorityPeer) &&
    grabberAuthorityPeer === HyperFlux.store.peerID

  useEffect(() => {
    if (!needsToRequestAuthority) return
    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        entityUUID,
        newAuthority: HyperFlux.store.peerID,
        $to: ownedByScene ? HyperFlux.store.peerID : grabbableAuthorityPeer
      })
    )
  }, [needsToRequestAuthority])

  return null
}
