import { Frustum, Matrix4 } from 'three'

import { getComponent, getOptionalComponent } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import {
  DistanceFromLocalClientComponent,
  compareDistanceToLocalClient
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { inFrustum } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { InteractableComponent } from '../components/InteractableComponent'

const mat4 = new Matrix4()
const frustum = new Frustum()

/**
 * Checks if entity is in range based on its own threshold
 * @param entity
 * @constructor
 */
const inRangeAndFrustumToInteract = (entity: Entity): boolean => {
  const interactable = getOptionalComponent(entity, InteractableComponent)
  if (!interactable) return false
  const maxDistanceSquare = interactable.activationDistance * interactable.activationDistance
  let inRangeAndFrustum = DistanceFromLocalClientComponent.squaredDistance[entity] < maxDistanceSquare
  if (inRangeAndFrustum) {
    inRangeAndFrustum = inFrustum(entity)
  }
  return inRangeAndFrustum
}

export const InteractableState = defineState({
  name: 'InteractableState',
  initial: () => {
    return {
      /**
       * all interactables within threshold range, in view of the camera, sorted by distance
       */
      available: [] as Entity[]
    }
  }
})

/**
 * Checks if entity can interact with any of entities listed in 'interactable' array, checking distance, guards and raycast
 * sorts the interactables by closest to the player
 * @param {Entity[]} interactables
 */
export const gatherAvailableInteractables = (interactables: Entity[]) => {
  const availableInteractable = getMutableState(InteractableState).available

  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  if (!viewerEntity) return

  const camera = getComponent(viewerEntity, CameraComponent)

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  availableInteractable.set(
    [...interactables].filter((entity) => inRangeAndFrustumToInteract(entity)).sort(compareDistanceToLocalClient)
  )
}

export const InteractableTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()
