import { EngineState, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import {
  CameraComponent,
  isOrthographicCamera,
  isPerspectiveCamera
} from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { IntersectionData } from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { Object3D, Raycaster, Vector3 } from 'three'
import { EditorHelperState } from '../../services/EditorHelperState'

export function intersectObjectWithRay(object: Object3D, raycaster: Raycaster, includeInvisible?: boolean) {
  const allIntersections = raycaster.intersectObject(object, true)

  for (let i = 0; i < allIntersections.length; i++) {
    if (allIntersections[i].object.visible || includeInvisible) {
      return allIntersections[i]
    }
  }

  return false
}

// not used anywhere in the PR, template function for crating future gizmo heuristics
export function templateGizmoInputHeuristic(gizmoInputRaycast: Raycaster, gizmoObjectQuery: any) {
  const gizmoInputHeuristic = (intersectionData: Set<IntersectionData>, position: Vector3, direction: Vector3) => {
    const isEditing = getState(EngineState).isEditing
    if (!isEditing) return

    const gizmoEnabled = getState(EditorHelperState).gizmoEnabled
    if (!gizmoEnabled) return

    gizmoInputRaycast.set(position, direction)

    const objects = gizmoObjectQuery().map((eid) => getComponent(eid, ObjectComponent))

    const hits = gizmoInputRaycast.intersectObjects(objects, true)
    for (const hit of hits) {
      intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
    }
  }

  return gizmoInputHeuristic
}

export function getCameraFactor(
  position: Vector3,
  size: number,
  multiplier = 0.3,
  camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
) {
  if (!camera) return size * multiplier

  if (isOrthographicCamera(camera)) {
    const factor = (camera.top - camera.bottom) / camera.zoom
    return factor * size * multiplier
  }

  if (isPerspectiveCamera(camera)) {
    const distance = position.distanceTo(camera.position)
    const fovRadians = (Math.PI * camera.fov) / 360
    const factor = distance * Math.min((1.9 * Math.tan(fovRadians)) / camera.zoom, 7)
    return factor * size * multiplier
  }

  // Fallback for other camera types
  return size * multiplier
}
