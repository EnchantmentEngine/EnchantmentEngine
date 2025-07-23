import { Entity, hasComponent } from '@ir-engine/ecs'
import { useMemo } from 'react'
import { Box3, Quaternion, Vector3 } from 'three'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeWorldBounds } from '../../transform/functions/BoundingBoxFunctions'
import { TransformPivot, TransformPivotType, TransformSpace, TransformSpaceType } from '../constants/TransformConstants'

const _bounds = new Box3()
const _position = new Vector3()
const _rotation = new Quaternion()
const _result = {
  bounds: _bounds,
  position: _position as Vector3 | undefined,
  rotation: _rotation as Quaternion | undefined
} as TransformPivotResult

interface TransformPivotResult {
  bounds: Box3
  position?: Vector3
  rotation?: Quaternion
}

/**
 * @param entities
 * @param transformPivot
 * @returns pivot result. Transient (values are valid only until the next time this function is called)
 */
export function computeTransformPivot(
  entities: readonly Entity[],
  transformPivot = TransformPivot.Center as TransformPivotType,
  transformSpace = TransformSpace.local as TransformSpaceType
): TransformPivotResult {
  const r = _result
  r.position = _position
  r.rotation = _rotation

  computeWorldBounds(entities, r.bounds)

  const firstEntity = entities[0]
  if (!hasComponent(firstEntity, TransformComponent)) {
    r.position = undefined
    r.rotation = undefined
    return r
  }

  if (transformSpace === 'local') {
    TransformComponent.getWorldPosition(firstEntity, r.position)
    TransformComponent.getWorldRotation(firstEntity, r.rotation)
  } else {
    TransformComponent.getWorldPosition(firstEntity, r.position)
    r.rotation.set(0, 0, 0, 1)
  }

  switch (transformPivot) {
    case TransformPivot.Origin:
      r.position.set(0, 0, 0)
      r.rotation.set(0, 0, 0, 1)
      break
    case TransformPivot.FirstSelected:
      break
    case TransformPivot.Center:
      if (!r.bounds.isEmpty()) {
        r.bounds.getCenter(r.position)
      }
      break
    case TransformPivot.Bottom: {
      if (!r.bounds.isEmpty()) {
        r.bounds.getCenter(r.position)
        r.position.y = r.bounds.min.y
      }
      break
    }
  }
  return r
}

export function useTransformPivot(
  entities: readonly Entity[],
  transformPivot: TransformPivotType,
  space = TransformSpace.local
) {
  return useMemo(() => {
    const result = computeTransformPivot(entities, transformPivot, space)
    return {
      bounds: result.bounds.clone(),
      position: result.position?.clone(),
      rotation: result.rotation?.clone()
    }
  }, [JSON.stringify(entities), transformPivot, space])
}
