import {
  NetworkObjectSendPeriodicUpdatesTag,
  ViewCursor,
  checkBitflag,
  readUint8,
  readVector3,
  readVector4,
  rewindViewCursor,
  spaceUint8,
  writeVector3,
  writeVector4
} from '@ir-engine/ecs'
import { getOptionalComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'

import { Physics } from './classes/Physics'
import { RigidBodyComponent, RigidBodyDynamicTagComponent } from './components/RigidBodyComponent'

export const readBodyPosition = readVector3(RigidBodyComponent.position)
export const readBodyRotation = readVector4(RigidBodyComponent.rotation)
export const readBodyLinearVelocity = readVector3(RigidBodyComponent.linearVelocity)
export const readBodyAngularVelocity = readVector3(RigidBodyComponent.angularVelocity)

export const readRigidBody = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  const rigidBody = getOptionalComponent(entity, RigidBodyComponent)
  const dynamic = hasComponent(entity, RigidBodyDynamicTagComponent)
  let changed = false
  if (checkBitflag(changeMask, 1 << b++)) {
    readBodyPosition(v, entity)
    changed = true
  }
  if (checkBitflag(changeMask, 1 << b++)) {
    readBodyRotation(v, entity)
    changed = true
  }
  if (checkBitflag(changeMask, 1 << b++)) {
    readBodyLinearVelocity(v, entity)
    changed = true
  }
  if (checkBitflag(changeMask, 1 << b++)) {
    readBodyAngularVelocity(v, entity)
    changed = true
  }
  if (dynamic && rigidBody && changed) {
    const world = Physics.getWorld(entity)
    if (!world) return
    Physics.setRigidbodyPose(
      world,
      entity,
      rigidBody.position,
      rigidBody.rotation,
      rigidBody.linearVelocity,
      rigidBody.angularVelocity
    )
  }
  if (!dynamic && rigidBody) {
    const position = rigidBody.position
    const rotation = rigidBody.rotation
    RigidBodyComponent.targetKinematicPosition.x[entity] = position.x
    RigidBodyComponent.targetKinematicPosition.y[entity] = position.y
    RigidBodyComponent.targetKinematicPosition.z[entity] = position.z
    RigidBodyComponent.targetKinematicRotation.x[entity] = rotation.x
    RigidBodyComponent.targetKinematicRotation.y[entity] = rotation.y
    RigidBodyComponent.targetKinematicRotation.z[entity] = rotation.z
    RigidBodyComponent.targetKinematicRotation.w[entity] = rotation.w
  }
}

export const writeBodyPosition = writeVector3(RigidBodyComponent.position)
export const writeBodyRotation = writeVector4(RigidBodyComponent.rotation)
export const writeBodyLinearVelocity = writeVector3(RigidBodyComponent.linearVelocity)
export const writeBodyAngularVelocity = writeVector3(RigidBodyComponent.angularVelocity)

export const writeRigidBody = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, RigidBodyComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  const ignoreHasChanged =
    hasComponent(entity, NetworkObjectSendPeriodicUpdatesTag) &&
    Math.round(getState(ECSState).simulationTime % getState(ECSState).periodicUpdateFrequency) === 0

  changeMask |= writeBodyPosition(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
  changeMask |= writeBodyRotation(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
  changeMask |= writeBodyLinearVelocity(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
  changeMask |= writeBodyAngularVelocity(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const PhysicsSerialization = {
  ID: 'ee.core.physics' as const,
  readRigidBody,
  writeRigidBody
}
