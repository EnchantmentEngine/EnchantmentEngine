
import { BoxGeometry, Mesh, MeshNormalMaterial } from 'three'

import { createEntity, getComponent, removeEntity, setComponent, UUIDComponent } from '@ir-engine/ecs'
import { EntityID, SourceID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { getMutableState, getState } from '@ir-engine/hyperflux'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { useEffect } from 'react'
import { CameraComponent } from './camera/components/CameraComponent'
import { NameComponent } from './common/NameComponent'
import { InputComponent } from './input/components/InputComponent'
import { ReferenceSpaceState } from './ReferenceSpaceState'
import { MeshComponent } from './renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from './renderer/components/ObjectLayerComponent'
import { RendererComponent } from './renderer/components/RendererComponent'
import { SceneComponent } from './renderer/components/SceneComponents'
import { VisibleComponent } from './renderer/components/VisibleComponent'
import { ObjectLayers } from './renderer/constants/ObjectLayers'
import { TransformComponent } from './transform/components/TransformComponent'

export const initializeSpatialViewer = (canvas?: HTMLCanvasElement) => {
  if (getState(ReferenceSpaceState).viewerEntity) throw new Error('Viewer already exists')

  const viewerEntity = createEntity()
  setComponent(viewerEntity, NameComponent, 'viewer')
  setComponent(viewerEntity, UUIDComponent, {
    entitySourceID: 'engine' as SourceID,
    entityID: 'viewer' as EntityID
  })
  setComponent(viewerEntity, TransformComponent)
  setComponent(viewerEntity, CameraComponent)
  setComponent(viewerEntity, VisibleComponent, true)
  setComponent(viewerEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(viewerEntity, InputComponent)
  const camera = getComponent(viewerEntity, CameraComponent)
  camera.matrixAutoUpdate = false
  camera.matrixWorldAutoUpdate = false
  camera.layers.disableAll()
  camera.layers.enable(ObjectLayers.Scene)
  camera.layers.enable(ObjectLayers.Avatar)
  camera.layers.enable(ObjectLayers.UI)
  camera.layers.enable(ObjectLayers.TransformGizmo)
  camera.layers.enable(ObjectLayers.Gizmos)
  camera.layers.enable(ObjectLayers.UVOL)

  if (canvas) {
    setComponent(viewerEntity, RendererComponent, { canvas, scenes: [viewerEntity] })
  }

  getMutableState(ReferenceSpaceState).merge({
    viewerEntity
  })
}

export const destroySpatialViewer = () => {
  const { viewerEntity } = getState(ReferenceSpaceState)

  if (viewerEntity) {
    removeEntity(viewerEntity)
  }

  getMutableState(ReferenceSpaceState).merge({
    viewerEntity: UndefinedEntity
  })
}

export const useSpatialEngine = () => {
  useEffect(() => {
    initializeSpatialEngine()
    return () => {
      destroySpatialEngine()
    }
  }, [])
}

export const initializeSpatialEngine = () => {
  const originEntity = createEntity()
  setComponent(originEntity, NameComponent, 'origin')
  setComponent(originEntity, UUIDComponent, {
    entitySourceID: 'engine' as SourceID,
    entityID: 'origin' as EntityID
  })
  setComponent(originEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(originEntity, TransformComponent)
  setComponent(originEntity, VisibleComponent, true)

  const localFloorEntity = createEntity()
  setComponent(localFloorEntity, NameComponent, 'local floor')
  setComponent(localFloorEntity, UUIDComponent, {
    entitySourceID: 'engine' as SourceID,
    entityID: 'local-floor' as EntityID
  })
  setComponent(localFloorEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
  setComponent(localFloorEntity, TransformComponent)
  setComponent(localFloorEntity, VisibleComponent, true)
  setComponent(localFloorEntity, SceneComponent)
  const floorHelperMesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshNormalMaterial())
  ObjectLayerMaskComponent.setLayer(localFloorEntity, ObjectLayers.Gizmos)
  setComponent(localFloorEntity, MeshComponent, floorHelperMesh)

  getMutableState(ReferenceSpaceState).merge({
    originEntity,
    localFloorEntity
  })
}

export const destroySpatialEngine = () => {
  const { originEntity, localFloorEntity } = getState(ReferenceSpaceState)

  if (localFloorEntity) {
    removeEntity(localFloorEntity)
  }
  if (originEntity) {
    removeEntity(originEntity)
  }

  getMutableState(ReferenceSpaceState).merge({
    originEntity: UndefinedEntity,
    localFloorEntity: UndefinedEntity
  })
}
