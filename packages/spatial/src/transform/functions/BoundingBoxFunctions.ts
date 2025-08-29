import { Entity, getOptionalComponent, getSimulationCounterpart } from '@ir-engine/ecs'
import { Box3, Vector3 } from 'three'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { TransformComponent } from '../components/TransformComponent'

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
