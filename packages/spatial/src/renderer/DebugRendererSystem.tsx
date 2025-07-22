import React, { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

import { createEntity, Entity, QueryReactor, removeEntity, useEntityContext } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { NameComponent } from '../common/NameComponent'
import { RapierWorldState } from '../physics/classes/Physics'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { addObjectToGroup, ObjectComponent } from '../renderer/components/ObjectComponent'
import { setObjectLayers } from '../renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '../renderer/components/VisibleComponent'
import { ObjectLayers } from '../renderer/constants/ObjectLayers'
import { RendererState } from '../renderer/RendererState'
import { WebGLRendererSystem } from '../renderer/WebGLRendererSystem'
import { createInfiniteGridHelper } from './components/InfiniteGridHelper'
import { SceneComponent } from './components/SceneComponents'

const PhysicsDebugEntities = new Map<Entity, Entity>()

const execute = () => {
  for (const [id, physicsDebugEntity] of Array.from(PhysicsDebugEntities)) {
    const world = getState(RapierWorldState)[id]
    if (!world) continue
    const lineSegments = getComponent(physicsDebugEntity, ObjectComponent) as any as LineSegments
    const debugRenderBuffer = world.debugRender()
    lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
    lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))
  }
}

const PhysicsReactor = () => {
  const entity = useEntityContext()
  const engineRendererSettings = useMutableState(RendererState)

  useEffect(() => {
    /** @todo move physics debug to physics module */
    if (!engineRendererSettings.physicsDebug.value) return

    const lineMaterial = new LineBasicMaterial({ vertexColors: true })
    const lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
    lineSegments.frustumCulled = false

    const lineSegmentsEntity = createEntity()
    setComponent(lineSegmentsEntity, NameComponent, 'Physics Debug')
    setVisibleComponent(lineSegmentsEntity, true)
    addObjectToGroup(lineSegmentsEntity, lineSegments)

    setComponent(lineSegmentsEntity, EntityTreeComponent, { parentEntity: entity })

    setObjectLayers(lineSegments, ObjectLayers.PhysicsHelper)
    PhysicsDebugEntities.set(entity, lineSegmentsEntity)

    return () => {
      removeEntity(lineSegmentsEntity)
      PhysicsDebugEntities.delete(entity)
    }
  }, [engineRendererSettings.physicsDebug])

  return null
}

const reactor = () => {
  const engineRendererSettings = useMutableState(RendererState)
  const originEntity = useMutableState(ReferenceSpaceState).originEntity.value

  useEffect(() => {
    if (!engineRendererSettings.gridVisibility.value || !originEntity) return

    const infiniteGridHelperEntity = createInfiniteGridHelper()
    setComponent(infiniteGridHelperEntity, EntityTreeComponent, { parentEntity: originEntity })
    getMutableState(RendererState).infiniteGridHelperEntity.set(infiniteGridHelperEntity)
    return () => {
      removeEntity(infiniteGridHelperEntity)
      getMutableState(RendererState).infiniteGridHelperEntity.set(null)
    }
  }, [originEntity, engineRendererSettings.gridVisibility])

  return (
    <>
      <QueryReactor Components={[SceneComponent]} ChildEntityReactor={PhysicsReactor} />
    </>
  )
}

export const DebugRendererSystem = defineSystem({
  uuid: 'ee.engine.DebugRendererSystem',
  insert: { before: WebGLRendererSystem },
  execute,
  reactor
})
