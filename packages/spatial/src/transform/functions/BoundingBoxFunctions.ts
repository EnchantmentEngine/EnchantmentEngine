import { Entity, getOptionalComponent, getSimulationCounterpart } from '@ir-engine/ecs'
import { useMemo } from 'react'
import { Box3, Vector3 } from 'three'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { TransformComponent } from '../components/TransformComponent'

/**
 * Returns all vertices of the bounding box, useful for including all vertices in the camera's view rather than hoping min and max are aligned with the camera
 * @param boundingBox
 */
export function getBoundingBoxVertices(boundingBox: Box3): Vector3[] {
  const min = boundingBox.min
  const max = boundingBox.max

  return [
    new Vector3(min.x, min.y, min.z),
    new Vector3(min.x, min.y, max.z),
    new Vector3(min.x, max.y, min.z),
    new Vector3(min.x, max.y, max.z),
    new Vector3(max.x, min.y, min.z),
    new Vector3(max.x, min.y, max.z),
    new Vector3(max.x, max.y, min.z),
    new Vector3(max.x, max.y, max.z)
  ]
}

const _box = new Box3()
const _position = new Vector3()

export function computeWorldBounds(entities: readonly Entity[], boundingBox: Box3 = new Box3()) {
  boundingBox.makeEmpty()
  for (const entity of entities) {
    const sEid = getSimulationCounterpart(entity)
    const obj = getOptionalComponent(sEid, ObjectComponent)
    const transform = getOptionalComponent(sEid, TransformComponent)
    if (transform) {
      TransformComponent.computeTransformMatrixWithChildren(sEid)
    }
    const box = getOptionalComponent(sEid, BoundingBoxComponent)
    if (obj) {
      boundingBox.expandByObject(obj)
    } else if (!box && transform) {
      boundingBox.expandByPoint(TransformComponent.getWorldPosition(sEid, _position))
    } else if (box && transform) {
      _box.copy(box.box)
      _box.applyMatrix4(transform.matrixWorld)
      boundingBox.expandByPoint(_box.min)
      boundingBox.expandByPoint(_box.max)
    }
  }
  return boundingBox
}

export function useWorldBounds(entities: readonly Entity[], live: boolean = false) {
  const box = useMemo(() => {
    const boundingBox = new Box3()
    if (live) return boundingBox
    return computeWorldBounds(entities, boundingBox)
  }, [entities])
  if (live) computeWorldBounds(entities, box)
  return box
}
