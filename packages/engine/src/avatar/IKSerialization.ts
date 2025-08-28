import {
  checkBitflag,
  NetworkObjectSendPeriodicUpdatesTag,
  readComponentProp,
  readUint8,
  rewindViewCursor,
  spaceUint8,
  ViewCursor,
  writePropIfChanged
} from '@ir-engine/ecs'
import { hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'

import { AvatarIKTargetComponent } from './components/AvatarIKComponents'

export const readBlendWeight = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readComponentProp(v, AvatarIKTargetComponent.blendWeight, entity)
}

export const writeBlendWeight = (v: ViewCursor, entity: Entity) => {
  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  const ignoreHasChanged =
    hasComponent(entity, NetworkObjectSendPeriodicUpdatesTag) &&
    Math.round(getState(ECSState).simulationTime % getState(ECSState).periodicUpdateFrequency) === 0

  changeMask |= writePropIfChanged(v, AvatarIKTargetComponent.blendWeight, entity, ignoreHasChanged)
    ? 1 << b++
    : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const IKSerialization = {
  ID: 'ee.engine.avatar.ik' as const,
  readBlendWeight,
  writeBlendWeight
}
