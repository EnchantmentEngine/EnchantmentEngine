/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Entity, EntityTreeComponent, getComponent, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D } from 'three'
import { PoiGizmoComponent } from '../../classes/gizmo/poi/PoiGizmoComponent'
import { PoiGizmoVisualComponent } from '../../classes/gizmo/poi/PoiGizmoVisualComponent'
import { GizmoMaterial, gizmoMaterialProperties } from '../../constants/GizmoPresets'

export function poiGizmoUpdate(gizmoEntity: Entity) {
  const poiGizmo = getComponent(gizmoEntity, PoiGizmoComponent)
  if (poiGizmo === undefined) return
  if (poiGizmo.visualEntity === UndefinedEntity) return

  const gizmo = getComponent(poiGizmo.visualEntity, PoiGizmoVisualComponent)
  if (gizmo === undefined) return

  if (gizmo.gizmo === UndefinedEntity) return

  // Update gizmo visual properties
  for (const childEntity of getComponent(gizmo.gizmo, EntityTreeComponent).children) {
    const handle = getComponent(childEntity, ObjectComponent) as Object3D
    if (!handle) continue

    handle.visible = true
    handle.quaternion.identity()
    handle.position.set(0, 0, 0)

    // Set POI gizmo material color (green/teal to distinguish from camera gizmos)
    if (handle instanceof LineSegments && handle.material instanceof LineBasicMaterial) {
      handle.material.color.set(gizmoMaterialProperties[GizmoMaterial.GREEN].color)
      handle.material.opacity = gizmoMaterialProperties[GizmoMaterial.GREEN].opacity
    } else if (handle instanceof Mesh && handle.material instanceof MeshBasicMaterial) {
      handle.material.color.set(gizmoMaterialProperties[GizmoMaterial.GREEN].color)
      handle.material.opacity = gizmoMaterialProperties[GizmoMaterial.GREEN].opacity
    }
  }
}

export function poiControlUpdate(gizmoEntity: Entity) {
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  if (!viewerEntity) return

  const poiGizmo = getComponent(gizmoEntity, PoiGizmoComponent)
  if (!poiGizmo) return

  // Sync the gizmo transform with the POI entity transform
  const poiTransform = getComponent(poiGizmo.poiEntity, TransformComponent)
  if (!poiTransform) return

  setComponent(poiGizmo.sceneEntity, TransformComponent, {
    position: poiTransform.position,
    rotation: poiTransform.rotation,
    scale: poiTransform.scale
  })
}
