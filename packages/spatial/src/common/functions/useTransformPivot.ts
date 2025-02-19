import { Entity } from '@ir-engine/ecs'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { useWorldBounds } from '../../transform/functions/BoundingBoxFunctions'
import { TransformPivot, TransformPivotType } from '../constants/TransformConstants'

export function useTransformPivot(entities: readonly Entity[], transformPivot: TransformPivotType) {
  const bounds = useWorldBounds(entities)

  const position = useMemo(() => {
    const p = new Vector3()
    switch (transformPivot) {
      case TransformPivot.Origin:
        p.setScalar(0)
        break
      case TransformPivot.FirstSelected:
        TransformComponent.getWorldPosition(entities[0], p)
        break
      case TransformPivot.Center:
        bounds.getCenter(p)
        break
      case TransformPivot.Bottom:
        bounds.getCenter(p)
        p.setY(bounds.min.y)
        break
    }
    return p
  }, [bounds, transformPivot])

  return useMemo(
    () => ({
      bounds,
      position
    }),
    [bounds, position]
  )
}
