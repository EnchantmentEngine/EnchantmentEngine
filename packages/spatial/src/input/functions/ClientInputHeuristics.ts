/**
 * @fileoverview Contains function declarations describing the heuristics used by ClientInputSystem.
 */

import {
  defineQuery,
  EngineState,
  Entity,
  EntityUUID,
  getAncestorWithComponents,
  getAuthoringCounterpart,
  getComponent,
  getOptionalComponent,
  hasComponent,
  Not,
  traverseEntityNodeParent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { Quaternion, Ray, Raycaster, Vector3 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection } from '../../common/constants/MathConstants'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRScenePlacementComponent } from '../../xr/XRScenePlacementComponent'
import { XRState } from '../../xr/XRState'
import { InputComponent } from '../components/InputComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'

const _worldPosInputSourceComponent = new Vector3()
const _worldPosInputComponent = new Vector3()

export type IntersectionData = {
  entity: Entity
  distance: number
}

/**
 * 1 = early - used for heuristics that should take precedence (like helpers and gizmos)
 * 0 = mid - used for most heuristics
 * -1 = late - used for catchall heuristics
 */
export type HeuristicOrder = -1 | 0 | 1

export type HeuristicFunctions = (
  viewerEntity: Entity,
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) => void

const sortOrder = (a, b) => b.order - a.order

export const InputHeuristicState = defineState({
  name: 'ir.spatial.input.InputHeuristicState',
  initial: { heuristics: [] as Array<{ order: HeuristicOrder; heuristic: HeuristicFunctions }> },

  addHeuristic: (order: HeuristicOrder, heuristic: HeuristicFunctions) => {
    const state = getMutableState(InputHeuristicState)
    state.heuristics.set((arr) =>
      [
        ...arr,
        {
          order,
          heuristic
        }
      ].sort(sortOrder)
    )
  }
})

/**Proximity query */
const spatialInputObjectsQuery = defineQuery([
  InputComponent,
  VisibleComponent,
  TransformComponent,
  Not(CameraComponent),
  Not(XRScenePlacementComponent)
])

export function findProximity(
  isSpatialInput: boolean,
  sourceEid: Entity,
  sortedIntersections: IntersectionData[],
  intersectionData: Set<IntersectionData>
) {
  const userID = getState(EngineState).userID as string
  if (!userID) return

  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar

  // @todo need a better way to do this

  /**@todo avatar logic not to be in spatial package */
  const selfAvatarEntity = UUIDComponent.getEntityByUUID((userID + 'avatar') as EntityUUID)

  // use sourceEid if controller (one InputSource per controller), otherwise use avatar rather than InputSource-emulated-pointer
  const inputSourceEntity = isCameraAttachedToAvatar && isSpatialInput ? sourceEid : selfAvatarEntity

  // Skip Proximity Heuristic when the entity is undefined
  if (inputSourceEntity === UndefinedEntity) return

  TransformComponent.getWorldPosition(inputSourceEntity, _worldPosInputSourceComponent)

  //TODO spatialInputObjects or inputObjects?  - inputObjects requires visible and group components
  for (const inputEntity of spatialInputObjectsQuery()) {
    if (inputEntity === selfAvatarEntity) continue
    const inputComponent = getComponent(inputEntity, InputComponent)

    TransformComponent.getWorldPosition(inputEntity, _worldPosInputComponent)
    const distSquared = _worldPosInputSourceComponent.distanceToSquared(_worldPosInputComponent)

    //closer than our current closest AND within inputSource's activation distance
    if (inputComponent.activationDistance * inputComponent.activationDistance > distSquared) {
      //using this object type out of convenience (intersectionsData is also guaranteed empty in this flow)
      intersectionData.add({ entity: inputEntity, distance: distSquared }) //keeping it as distSquared for now to avoid extra square root calls
    }
  }

  const closestEntities = Array.from(intersectionData)
  if (closestEntities.length === 0) return
  if (closestEntities.length > 1) {
    //sort if more than 1 entry
    closestEntities.sort(sortDistance)
  }
  sortedIntersections.push({
    entity: closestEntities[0].entity,
    distance: Math.sqrt(closestEntities[0].distance)
  })
}

const sortDistance = (a: IntersectionData, b: IntersectionData) => {
  return Math.sign(a.distance - b.distance)
}

const hitTarget = new Vector3()
const ray = new Ray()

const boundingBoxQuery = defineQuery([VisibleComponent, BoundingBoxComponent])

export function boundingBoxHeuristic(
  viewerEntity: Entity,
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) {
  const isEditing = getState(EngineState).isEditing
  if (isEditing) return

  ray.origin.copy(position)
  ray.direction.copy(direction)

  const boxEntities = boundingBoxQuery()
    .filter(filterEntitiesByInput)
    .filter((e) => filterEntitiesByViewer(e, viewerEntity))
  for (const entity of boxEntities) {
    const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)
    if (!boundingBox) continue
    const hit = ray.intersectBox(boundingBox.box, hitTarget)
    if (hit) {
      intersectionData.add({ entity, distance: ray.origin.distanceTo(hitTarget) })
    }
  }
}

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.Scene)
const meshesQuery = defineQuery([VisibleComponent, MeshComponent])

export function meshHeuristic(
  viewerEntity: Entity,
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) {
  const entities = meshesQuery()
    .filter(filterEntitiesByInput)
    .filter((eid) => filterEntitiesByViewer(eid, viewerEntity))
  const objects = entities
    .filter((eid) => hasComponent(eid, ObjectComponent))
    .map((eid) => getComponent(eid, ObjectComponent))

  _raycaster.set(position, direction)

  const hits = _raycaster.intersectObjects(objects, true)
  for (const hit of hits) {
    intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
  }
}

const position = new Vector3()
const direction = new Vector3()
const sourceRotation = new Quaternion()

export function findRaycastedInput(sourceEid: Entity, intersectionData: Set<IntersectionData>) {
  TransformComponent.getWorldRotation(sourceEid, sourceRotation)
  direction.copy(ObjectDirection.Forward).applyQuaternion(sourceRotation)

  TransformComponent.getWorldPosition(sourceEid, position).addScaledVector(direction, -0.01)

  const { heuristics } = getState(InputHeuristicState)

  const viewerEntity = getComponent(sourceEid, InputSourceComponent).sourceEntity
  if (!viewerEntity) return

  for (const h of heuristics) h.heuristic(viewerEntity, intersectionData, position, direction)
}

export function filterEntitiesByViewer(entity: Entity, viewerEntity: Entity) {
  let isRendered = false
  const scenes = getComponent(viewerEntity, RendererComponent).scenes
  // iterate parent hierarchy until we find one in the scene
  traverseEntityNodeParent(entity, (eid) => {
    if (scenes.includes(eid)) {
      isRendered = true
      return true
    }
  })
  return isRendered
}

const inputComponentArray = [InputComponent]

/**
 * Filters entities by input
 * - return all meshes when authoring
 * - iterate parent hierarchy until we find one with an input component
 * @param entity
 * @returns
 */
export function filterEntitiesByInput(entity: Entity) {
  if (getAuthoringCounterpart(entity)) return true
  return !!getAncestorWithComponents(entity, inputComponentArray)
}
