import { Camera, Intersection, Mesh, Object3D, Raycaster, Vector2 } from 'three'

import { defineQuery } from '@ir-engine/ecs'
import { getComponent, hasComponent, Layers } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'

import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { SelectionState } from '../services/SelectionServices'

type RaycastIntersectionNode = Intersection<Object3D> & {
  obj3d: Object3D
  node?: Entity
}

function getParentEntity(obj: Object3D): Object3D {
  let curObj = obj

  while (curObj) {
    if (curObj.entity) break
    curObj = curObj.parent! as Object3D
  }

  return curObj
}

export function getIntersectingNode(results: Intersection<Object3D>[]): RaycastIntersectionNode | undefined {
  if (results.length <= 0) return
  const selectionState = getState(SelectionState)
  const selected = new Set<string | Entity>(selectionState.selectedEntities)
  for (const result of results as RaycastIntersectionNode[]) {
    const obj = result.object //getParentEntity(result.object)
    const parentNode = getParentEntity(obj)
    if (!parentNode || !hasComponent(obj.entity, VisibleComponent)) continue //skip obj3ds that are not visible and not children of EntityNodes
    if (!obj.entity && parentNode && !selected.has(parentNode.entity!)) {
      result.node = parentNode.entity
      result.obj3d = getComponent(parentNode.entity!, ObjectComponent) as Object3D
      return result
    }

    if (obj) {
      result.obj3d = obj
      result.node = obj.entity
      return result
    }
  }
}

export const getIntersectingNodeOnScreen = (
  raycaster: Raycaster,
  coord: Vector2,
  target: Intersection<Object3D>[] = [],
  camera: Camera = getComponent(Engine.instance.cameraEntity, CameraComponent),
  object?: Object3D,
  recursive = true
): RaycastIntersectionNode | undefined => {
  raycaster.setFromCamera(coord, camera)
  raycaster.layers.enable(ObjectLayers.NodeHelper)
  raycaster.intersectObjects(
    object ? ([object] as Mesh[]) : (allMeshes().map((e) => getComponent(e, MeshComponent)) as Mesh[]),
    recursive,
    target as Intersection<Object3D>[]
  )
  raycaster.layers.disable(ObjectLayers.NodeHelper)
  return getIntersectingNode(target as Intersection<Object3D>[])
}

const allMeshes = defineQuery([MeshComponent], Layers.Authoring)
