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

import { Entity, removeEntityNodeRecursively } from '@ir-engine/ecs'
import { createEntity, getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { PoiComponent } from '@ir-engine/engine/src/scene/components/PoiComponent'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { useEffect } from 'react'
import { PoiGizmoComponent } from '../classes/gizmo/poi/PoiGizmoComponent'
import { poiControlUpdate, poiGizmoUpdate } from '../functions/gizmos/poiGizmoHelper'

export const poiGizmoQuery = defineQuery([PoiGizmoComponent])
export const poiEntityQuery = defineQuery([PoiComponent])

const execute = () => {
  for (const poiGizmoEntity of poiGizmoQuery()) {
    const poiGizmoComponent = getComponent(poiGizmoEntity, PoiGizmoComponent)
    if (!poiGizmoComponent.enabled || !poiGizmoComponent.visualEntity) return
    poiGizmoUpdate(poiGizmoEntity)
    poiControlUpdate(poiGizmoEntity)
  }
}

const reactor = () => {
  useEffect(() => {
    const gizmoEntities = new Map<Entity, Entity>() // POI entity -> Gizmo entity mapping

    const createGizmoForPoi = (poiEntity: Entity) => {
      if (gizmoEntities.has(poiEntity)) return // Already has gizmo

      const gizmoEntity = createEntity()
      setComponent(gizmoEntity, PoiGizmoComponent, {
        sceneEntity: getState(ReferenceSpaceState).originEntity,
        poiEntity: poiEntity,
        visualEntity: 0 as any, // Will be set by the gizmo component
        enabled: true
      })
      gizmoEntities.set(poiEntity, gizmoEntity)
    }

    const removeGizmoForPoi = (poiEntity: Entity) => {
      const gizmoEntity = gizmoEntities.get(poiEntity)
      if (gizmoEntity) {
        removeEntityNodeRecursively(gizmoEntity)
        gizmoEntities.delete(poiEntity)
      }
    }

    // Create gizmos for existing POI entities
    for (const poiEntity of poiEntityQuery()) {
      createGizmoForPoi(poiEntity)
    }

    return () => {
      // Clean up all gizmos
      for (const [poiEntity, gizmoEntity] of gizmoEntities) {
        removeEntityNodeRecursively(gizmoEntity)
      }
      gizmoEntities.clear()
    }
  }, [])

  return null
}

export const PoiGizmoSystem = defineSystem({
  uuid: 'ee.editor.PoiGizmoSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor
})
