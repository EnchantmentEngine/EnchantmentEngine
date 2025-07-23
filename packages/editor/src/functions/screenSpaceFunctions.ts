import { Intersection, Object3D, Raycaster, Vector2, Vector3 } from 'three'

import { Engine, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { SnapMode } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'

import { EditorHelperState } from '../services/EditorHelperState'
import { getIntersectingNodeOnScreen } from './getIntersectingNode'

/**
 * Function provides the screen space position.
 *
 * @param screenSpacePosition
 * @param target
 */
export const getScreenSpacePosition = (() => {
  const raycaster = new Raycaster()
  raycaster.layers.disable(ObjectLayers.Camera)
  raycaster.layers.enable(ObjectLayers.NodeHelper)
  raycaster.layers.enable(ObjectLayers.Scene)
  const raycastTargets: Intersection<Object3D>[] = []

  return (screenSpacePosition: Vector2, target = new Vector3()): Vector3 => {
    raycastTargets.length = 0
    const editorHelperState = getState(EditorHelperState)
    const closestTarget = getIntersectingNodeOnScreen(raycaster, screenSpacePosition, raycastTargets)

    if (closestTarget && closestTarget.distance < 1000) {
      target.copy(closestTarget.point)
    } else {
      raycaster.ray.at(20, target)
    }

    if (editorHelperState.gridSnap === SnapMode.Grid) {
      const translationSnap = editorHelperState.translationSnap

      target.set(
        Math.round(target.x / translationSnap) * translationSnap,
        Math.round(target.y / translationSnap) * translationSnap,
        Math.round(target.z / translationSnap) * translationSnap
      )
    }

    return target
  }
})()

/**
 * Function provides the postion of object at the center of the scene .
 *
 * @param target
 * @return {any}        [Spwan position]
 */
export const getSpawnPositionAtCenter = (() => {
  const center = new Vector2()
  return (target: Vector3) => {
    return getScreenSpacePosition(center, target)
  }
})()

/**
 * Function provides the cursor spawn position.
 *
 * @param mousePos
 * @param target
 * @returns
 */
export function getCursorSpawnPosition(mousePos: Vector2, target = new Vector3()): Vector3 {
  const rect = getComponent(
    Engine.instance.viewerEntity,
    RendererComponent
  ).renderer!.domElement.getBoundingClientRect()
  const position = new Vector2()
  position.x = ((mousePos.x - rect.left) / rect.width) * 2 - 1
  position.y = ((mousePos.y - rect.top) / rect.height) * -2 + 1
  return getScreenSpacePosition(position, target)
}

export function getCursorPositionNormalized(mousePos: Vector2): Vector2 {
  const rect = getComponent(
    Engine.instance.viewerEntity,
    RendererComponent
  ).renderer!.domElement.getBoundingClientRect()
  const position = new Vector2()
  position.x = ((mousePos.x - rect.left) / rect.width) * 2 - 1
  position.y = ((mousePos.y - rect.top) / rect.height) * -2 + 1
  return position
}
