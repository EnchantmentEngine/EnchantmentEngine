import { Vector3 } from 'three'

import { Entity } from '@ir-engine/ecs/src/Entity'

import { getHandTarget } from '../components/AvatarIKComponents'

export const interactableReachDistance = 3

export const getInteractiveIsInReachDistance = (
  entityUser: Entity,
  interactablePosition: Vector3,
  side: XRHandedness
): boolean => {
  const target = getHandTarget(entityUser, side)
  if (!target) return false
  return target.position.distanceTo(interactablePosition) < interactableReachDistance
}
