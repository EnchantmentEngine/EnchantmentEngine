import { MeshBasicMaterial, Quaternion, Vector3 } from 'three'

import { isClient } from '@ir-engine/common/src/utils/getEnvironment'
import {
  Engine,
  EngineState,
  EntityTreeComponent,
  getChildrenWithComponents,
  InputSystemGroup,
  UndefinedEntity
} from '@ir-engine/ecs'
import { getComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineQuery, QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { getState } from '@ir-engine/hyperflux'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import { WebLayer3D } from '@ir-engine/xrui'

import React, { useEffect } from 'react'
import { createMediaControlsView } from './ui/MediaControlsUI'

const controlsUiPosVec3 = new Vector3()
let clicking = false
const MediaFadeTransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()
const mediaQuery = defineQuery([MediaComponent])

export const createMediaControlsUI = (entity: Entity, aspectRatio: number = 1) => {
  const mediaTransform = getComponent(entity, TransformComponent)

  const uiFront = createMediaControlsView(entity)
  setComponent(uiFront.entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
  setComponent(uiFront.entity, NameComponent, 'mediacontrols-ui-frontside-' + entity)
  setComponent(uiFront.entity, TransformComponent, { rotation: mediaTransform.rotation })
  uiFront.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as MeshBasicMaterial
    mat.transparent = true
  })

  const rotationQuaternion = new Quaternion()
  rotationQuaternion.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI) // 180 degrees in radians
  const backRotation = mediaTransform.rotation.clone().multiply(rotationQuaternion)

  const uiBack = createMediaControlsView(entity)
  setComponent(uiBack.entity, EntityTreeComponent, { parentEntity: uiFront.entity })
  setComponent(uiBack.entity, NameComponent, 'mediacontrols-ui-backside-' + entity)
  setComponent(uiBack.entity, TransformComponent, { rotation: backRotation })
  uiBack.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as MeshBasicMaterial
    mat.transparent = true
  })

  return uiFront
}

const onUpdate = (entity: Entity) => {
  const mediaComponent = getComponent(entity, MediaComponent)
  if (!mediaComponent.controls) return
  const xrui = getOptionalComponent(mediaComponent.xruiEntity, XRUIComponent)

  if (!xrui) return
  const xruiChildren = getChildrenWithComponents(mediaComponent.xruiEntity, [XRUIComponent]).map((entity) =>
    getComponent(entity, XRUIComponent)
  )
  const xruiList = [xrui, ...xruiChildren]
  const transition = MediaFadeTransitions.get(entity)!
  const buttonLayers = xruiList.map((xrui) => xrui.rootLayer.querySelector('#button'))

  const inputComponent = getComponent(entity, InputComponent)
  const inputSourceEntity = inputComponent?.inputSources[0]

  //inputsource and entity 0 = hover
  //inputsource and entity 3 = clicking HERE
  //noinput and entity 3 = clicking somewhere else or still clicking
  //noinputsource and entity 0 = no hover, no click
  const capturingEntity = getState(InputState).capturingEntity

  if (inputSourceEntity) {
    const inputSource = getOptionalComponent(inputSourceEntity, InputSourceComponent)

    if (capturingEntity === entity) {
      const buttons = inputSource?.buttons
      clicking = !!buttons //clicking on our boundingbox this frame
      setComponent(entity, MediaComponent, { paused: !mediaComponent.paused })
    }
  }

  const hover = inputSourceEntity && capturingEntity === UndefinedEntity
  const showUI = hover || clicking

  //fires one frame late to prevent mouse up frame issue
  if (clicking && !inputSourceEntity && capturingEntity === UndefinedEntity) {
    clicking = false
  }
  if (showUI) {
    transition.setState('IN')
  } else {
    transition.setState('OUT')
  }
  const uiTransform = getComponent(mediaComponent.xruiEntity, TransformComponent)
  const transform = getComponent(entity, TransformComponent)

  controlsUiPosVec3.copy(mediaComponent.uiOffset) //used to add - might be nice to allow for some pre-placed anchor positions
  controlsUiPosVec3.add(transform.position)
  uiTransform.position.copy(controlsUiPosVec3)

  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (opacity) => {
    ;``
    buttonLayers.forEach((buttonLayer) => {
      buttonLayer?.scale.setScalar(0.9 + 0.1 * opacity * opacity)
    })
    xruiList.forEach((xrui) => {
      xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
        const mat = layer.contentMesh.material as MeshBasicMaterial
        mat.opacity = opacity
      })
    })
  })
}

const execute = () => {
  if (getState(EngineState).isEditing || !isClient) return

  for (const entity of mediaQuery()) {
    onUpdate(entity)
  }
}

const MediaXRUIReactor = ({ entity }: { entity: Entity }) => {
  useEffect(() => {
    const mediaComponent = getComponent(entity, MediaComponent)
    if (!mediaComponent.controls) return

    const transition = createTransitionState(0.25, 'IN')
    MediaFadeTransitions.set(entity, transition)
    mediaComponent.xruiEntity = createMediaControlsUI(entity).entity
    setComponent(mediaComponent.xruiEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

    return () => {
      if (MediaFadeTransitions.has(entity)) MediaFadeTransitions.delete(entity)
    }
  }, [])
  return null
}

export const MediaControlSystem = defineSystem({
  uuid: 'ee.engine.MediaControlSystem',
  insert: { after: InputSystemGroup },
  execute,
  reactor: () => <QueryReactor Components={[MediaComponent]} ChildEntityReactor={MediaXRUIReactor} />
})
