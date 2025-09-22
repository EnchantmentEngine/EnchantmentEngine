import {
  defineQuery,
  defineSystem,
  EngineState,
  getComponent,
  getOptionalComponent,
  NetworkObjectAuthorityTag,
  SimulationSystemGroup
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ClientInputSystem } from '@ir-engine/spatial/src/input/systems/ClientInputSystem'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { getHandTarget } from '../avatar/components/AvatarIKComponents'
import { GrabbableComponent, GrabbedComponent, GrabberComponent } from './GrabbableComponent'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import '@ir-engine/spatial/src/transform/SpawnPoseState'
import './GrabbableState'

const ownedGrabbableQuery = defineQuery([GrabbableComponent, GrabbedComponent, NetworkObjectAuthorityTag])

const execute = () => {
  if (getState(EngineState).isEditing) return

  for (const entity of ownedGrabbableQuery()) {
    const grabbedComponent = getComponent(entity, GrabbedComponent)

    const target = getHandTarget(grabbedComponent.grabberEntity, grabbedComponent.attachmentPoint)
    if (!target) continue

    const rigidbodyComponent = getOptionalComponent(entity, RigidBodyComponent)

    if (rigidbodyComponent) {
      rigidbodyComponent.targetKinematicPosition.copy(target.position)
      rigidbodyComponent.targetKinematicRotation.copy(target.rotation)
      // const world = Physics.getWorld(entity)!
      // Physics.setRigidbodyPose(world, entity, target.position, target.rotation, Vector3_Zero, Vector3_Zero)
    } else {
      const grabbableTransform = getComponent(entity, TransformComponent)
      grabbableTransform.position.copy(target.position)
      grabbableTransform.rotation.copy(target.rotation)
    }
  }
}

const executeInput = () => {
  const buttons = InputComponent.getButtons(getState(ReferenceSpaceState).viewerEntity)
  if (buttons.KeyU?.pressed) {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    if (!selfAvatarEntity) return
    const grabbedComponent = getOptionalComponent(selfAvatarEntity, GrabbedComponent)
    if (!grabbedComponent) return
    const grabberEntity = getComponent(selfAvatarEntity, GrabberComponent)[grabbedComponent.attachmentPoint]
    if (!grabberEntity) return
    GrabbableComponent.drop(grabberEntity, selfAvatarEntity)
  }
}

export const GrabbableSystem = defineSystem({
  uuid: 'ee.engine.GrabbableSystem',
  insert: { with: SimulationSystemGroup },
  execute
})

export const GrabbableInputSystem = defineSystem({
  uuid: 'ee.engine.GrabbableInputSystem',
  insert: { after: ClientInputSystem },
  execute: executeInput
})
