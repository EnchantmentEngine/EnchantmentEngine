import { useEffect } from 'react'
import { Color, DoubleSide, Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

import { createEntity, entityExists, removeEntity } from '@ir-engine/ecs'
import { getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { defineActionQueue, defineState, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'

import React from 'react'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { NameComponent } from '../../common/NameComponent'
import { createTransitionState } from '../../common/functions/createTransitionState'
import { addObjectToGroup } from '../../renderer/components/ObjectComponent'
import { setObjectLayers } from '../../renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraActions } from '../CameraState'
import { CameraSystem } from './CameraSystem'

const fadeToBlackQueue = defineActionQueue(CameraActions.fadeToBlack)

const CameraFadeBlackEffectSystemState = defineState({
  name: 'CameraFadeBlackEffectSystemState',
  initial: {} as {
    transition: ReturnType<typeof createTransitionState>
    mesh: Mesh<SphereGeometry, MeshBasicMaterial>
    entity: Entity
  }
})

const createFadeEntity = () => {
  const geometry = new SphereGeometry(10)
  const material = new MeshBasicMaterial({
    transparent: true,
    side: DoubleSide,
    depthWrite: true,
    depthTest: false
  })

  const mesh = new Mesh(geometry, material)
  mesh.layers.set(ObjectLayers.Camera)
  mesh.scale.set(-1, 1, -1)
  mesh.name = 'Camera Fade Transition'
  const entity = createEntity()
  setComponent(entity, NameComponent, mesh.name)
  addObjectToGroup(entity, mesh)
  mesh.renderOrder = 1
  setObjectLayers(mesh, ObjectLayers.Camera)
  const transition = createTransitionState(0.25, 'OUT')

  getMutableState(CameraFadeBlackEffectSystemState).set({
    transition,
    mesh,
    entity
  })
}

const execute = () => {
  for (const action of fadeToBlackQueue()) {
    /** Lazily create entity as needed */
    if (!getState(CameraFadeBlackEffectSystemState).entity) createFadeEntity()
    const { transition, mesh, entity } = getState(CameraFadeBlackEffectSystemState)
    transition.setState(action.in ? 'IN' : 'OUT')
    if (action.in) {
      setComponent(entity, ComputedTransformComponent, {
        referenceEntities: [getState(ReferenceSpaceState).viewerEntity],
        computeFunction: () => {
          getComponent(entity, TransformComponent).position.copy(
            getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent).position
          )
        }
      })
    } else removeComponent(entity, ComputedTransformComponent)

    mesh.material.color = new Color('black')
    mesh.material.map = null
    mesh.material.needsUpdate = true
  }

  if (!getState(CameraFadeBlackEffectSystemState).entity) return

  const { entity, transition, mesh } = getState(CameraFadeBlackEffectSystemState)

  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (alpha) => {
    mesh.material.opacity = alpha
    setVisibleComponent(entity, alpha > 0)
  })
}

const Reactor = () => {
  useEffect(() => {
    return () => {
      const { entity } = getState(CameraFadeBlackEffectSystemState)
      if (entityExists(entity)) removeEntity(entity)
      getMutableState(CameraFadeBlackEffectSystemState).set({} as any)
    }
  }, [])

  return null
}

export const CameraFadeBlackEffectSystem = defineSystem({
  uuid: 'ee.engine.CameraFadeBlackEffectSystem',
  insert: { with: CameraSystem },
  execute,
  reactor: () => {
    if (!useMutableState(ReferenceSpaceState).viewerEntity.value) return null
    return <Reactor />
  }
})
