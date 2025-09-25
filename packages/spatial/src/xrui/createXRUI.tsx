import React from 'react'
import { createRoot } from 'react-dom/client'
import { Group } from 'three'

import { createEntity, Entity, EntityContext, getComponent, setComponent } from '@ir-engine/ecs'
import { getState, isClient, State } from '@ir-engine/hyperflux'
import { WebContainer3D, WebLayerManager } from '@ir-engine/xrui'
import { InputComponent } from '../input/components/InputComponent'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { ObjectComponent } from '../renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent, setObjectLayers } from '../renderer/components/ObjectLayerComponent'
import { RendererComponent } from '../renderer/components/RendererComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { ObjectLayers } from '../renderer/constants/ObjectLayers'
import { KTX2LoaderState } from '../resources/loaders/ktx2/KTX2LoaderState'
import { DistanceFromCameraComponent } from '../transform/components/DistanceComponents'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRUIComponent } from './components/XRUIComponent'
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
