import React from 'react'
import { createRoot } from 'react-dom/client'
import { Group } from 'three'

import { EntityContext, createEntity } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { State, getState, isClient } from '@ir-engine/hyperflux'
import { WebContainer3D } from '@ir-engine/xrui/core/three/WebContainer3D'
import { WebLayerManager } from '@ir-engine/xrui/core/three/WebLayerManager'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import {
  ObjectLayerMaskComponent,
  setObjectLayers
} from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { KTX2LoaderState } from '@ir-engine/spatial/src/resources/loaders/ktx2/KTX2LoaderState'
import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import { XRUIStateContext } from './XRUIStateContext'

export function createXRUI<S extends State<any> | null>(
  UIFunc: React.FC,
  state = null as S,
  settings: { interactable: boolean } = { interactable: true },
  entity = createEntity()
): XRUI<S> {
  if (!isClient) throw new Error('XRUI is not supported in nodejs')

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + UIFunc.name

  const rootElement = createRoot(containerElement!)
  rootElement.render(
    //@ts-ignore
    <EntityContext.Provider value={entity}>
      {/*
      // @ts-ignore */}
      <XRUIStateContext.Provider value={state}>
        <UIFunc />
      </XRUIStateContext.Provider>
    </EntityContext.Provider>
  )

  if (!WebLayerManager.instance) {
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    const renderer = getComponent(viewerEntity, RendererComponent).renderer!
    const ktx2Loader = getState(KTX2LoaderState)
    WebLayerManager.initialize(renderer, ktx2Loader!)
  }

  const container = new WebContainer3D(containerElement, { manager: WebLayerManager.instance })

  container.raycaster.layers.enableAll()

  const root = new Group()
  root.name = containerElement.id
  root.add(container)
  root.preserveChildren = true
  setObjectLayers(container, ObjectLayers.UI)
  ObjectLayerMaskComponent.setLayer(entity, ObjectLayers.UI)
  setComponent(entity, ObjectComponent, root)
  setComponent(entity, TransformComponent)
  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, XRUIComponent, container)
  setComponent(entity, VisibleComponent, true)
  if (settings.interactable) setComponent(entity, InputComponent, { highlight: false, grow: true })

  return { entity, state, container }
}

export interface XRUI<S> {
  entity: Entity
  state: S
  container: WebContainer3D
}
