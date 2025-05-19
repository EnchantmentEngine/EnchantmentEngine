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

import { defineQuery, defineSystem, getComponent, PresentationSystemGroup, useQuery } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { ColliderLoadingState } from '../state/ColliderLoadingState'

const colliderQuery = defineQuery([ColliderComponent])

const checkColliders = async () => {
  const colliderState = getState(ColliderLoadingState)
  if (colliderQuery().length === 0) {
    ColliderLoadingState.setAllCollidersLoaded()
    return
  }
  // Only run the collider registration logic if we haven't marked all colliders as loaded
  if (!colliderState.allCollidersLoaded) {
    for (const entity of colliderQuery()) {
      const collider = getComponent(entity, ColliderComponent)
      // If this is a new collider, register it
      if (!colliderState.pendingColliders.has(entity)) {
        ColliderLoadingState.registerPendingCollider(entity)
      }
    }

    // Check if all colliders are loaded
    ColliderLoadingState.checkCollidersLoaded(colliderQuery())
  }
}

const SceneLoadingReactor = (props: { sceneEntity: Entity }) => {
  const { sceneEntity } = props
  const sceneLoaded = GLTFComponent.useSceneLoaded(sceneEntity)

  // Reset collider tracking when a new scene loads
  useEffect(() => {
    if (sceneLoaded) {
      setTimeout(() => {
        checkColliders()
      }, 500)
    } else {
      ColliderLoadingState.reset()
    }
  }, [sceneLoaded])

  return null
}

const reactor = () => {
  const sceneQuery = useQuery([SceneComponent, GLTFComponent])

  if (sceneQuery.length === 0) return null
  return <SceneLoadingReactor sceneEntity={sceneQuery[0]} />
}

export const ColliderLoadingSystem = defineSystem({
  uuid: 'ee.engine.ColliderLoadingSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
