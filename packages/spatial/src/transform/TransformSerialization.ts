import {
  ECSState,
  Entity,
  NetworkObjectSendPeriodicUpdatesTag,
  ViewCursor,
  checkBitflag,
  hasComponent,
  readUint8,
  readVector3,
  readVector4,
  rewindViewCursor,
  spaceUint8,
  writeVector3,
  writeVector4
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { TransformComponent } from './components/TransformComponent'

export const readPosition = readVector3(TransformComponent.position)
export const readRotation = readVector4(TransformComponent.rotation) //readCompressedRotation(TransformComponent.rotation) //readVector4(TransformComponent.rotation)

export const readTransform = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readPosition(v, entity)
  if (checkBitflag(changeMask, 1 << b++)) readRotation(v, entity)
  TransformComponent.dirty[entity] = 1
}

export const writePosition = writeVector3(TransformComponent.position)
export const writeRotation = writeVector4(TransformComponent.rotation)

export const writeTransform = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, TransformComponent) || hasComponent(entity, RigidBodyComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  const ignoreHasChanged =
    hasComponent(entity, NetworkObjectSendPeriodicUpdatesTag) &&
    Math.round(getState(ECSState).simulationTime % getState(ECSState).periodicUpdateFrequency) === 0

  changeMask |= writePosition(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0
  changeMask |= writeRotation(v, entity, ignoreHasChanged) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const TransformSerialization = {
  ID: 'ee.core.transform' as const,
  readTransform,
  writeTransform
}
