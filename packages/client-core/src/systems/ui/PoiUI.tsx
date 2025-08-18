import {
  defineSystem,
  Engine,
  Entity,
  EntityTreeComponent,
  PresentationSystemGroup,
  QueryReactor
} from '@ir-engine/ecs'
import {
  getOptionalComponent,
  Layers,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs/src/ComponentFunctions'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { PoiCameraComponent } from '@ir-engine/spatial/src/camera/components/PoiCameraComponent'
import { CameraScrollBehavior, PoiScrollTransition } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { ObjectFitFunctions } from '@ir-engine/spatial/src/transform/functions/ObjectFitFunctions'
import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

// @ts-ignore
import base from '@ir-engine/client/src/themes/base.css?inline'
// @ts-ignore
import components from '@ir-engine/client/src/themes/components.css?inline'
// @ts-ignore
import utilities from '@ir-engine/client/src/themes/utilities.css?inline'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'

export const PoiUiSystem = defineSystem({
  uuid: 'ee.engine.PoiUiSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => (
    <QueryReactor Components={[PoiCameraComponent]} ChildEntityReactor={PoiReactor} layer={Layers.Simulation} />
  )
})

const PoiReactor = () => {
  const entity = useEntityContext()

  useEffect(() => {
    const xrui = createPoiUI(entity)
    setComponent(xrui.entity, EntityTreeComponent, {
      parentEntity: Engine.instance.originEntity
    })

    const { viewerEntity } = getState(ReferenceSpaceState)
    setComponent(xrui.entity, ComputedTransformComponent, {
      referenceEntities: [viewerEntity],
      computeFunction: () => {
        const camera = getOptionalComponent(viewerEntity, CameraComponent)
        if (!camera) return
        const distance = camera.near * 1.1 // 10% in front of camera
        const scale = 0.137
        ObjectFitFunctions.attachObjectInFrontOfCamera(xrui.entity, scale, distance)
      }
    })

    return () => {
      if (!xrui.entity) return
      removeEntity(xrui.entity)
    }
  }, [])
  return null
}

export const createPoiUI = (entity: Entity, aspectRatio: number = 1) => {
  const PoiUi = () => <PoiUiView entity={entity} />
  const ui = createXRUI(PoiUi, null, { interactable: false })
  setComponent(ui.entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
  setComponent(ui.entity, NameComponent, 'poi-ui-' + entity)
  return ui
}

type PoiUiProps = {
  entity: Entity
}

const PoiUiView = (props: PoiUiProps) => {
  const poiCamera = useComponent(props.entity, PoiCameraComponent)
  const cameraSettingsState = useMutableState(CameraSettingsState)

  // State for reactive boolean variables
  const [showPrevious, setShowPrevious] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [buttonsDisabled, setButtonsDisabled] = useState(false)

  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasHeight, setCanvasHeight] = useState(0)

  const rendererComponent = useComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent)

  useEffect(() => {
    if (!rendererComponent.canvas) return
    setCanvasWidth(rendererComponent.canvas.clientWidth)
    setCanvasHeight(rendererComponent.canvas.clientHeight)
  }, [rendererComponent.canvas, rendererComponent.canvas?.clientWidth, rendererComponent.canvas?.clientHeight])

  const previousClicked = () => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const currentTargetIndex = poiCamera.targetPoiIndex
    const poiCount = cameraSettingsState.poiEntities.length

    let newTargetIndex = currentTargetIndex - 1

    // Handle wrapping or clamping
    if (scrollBehavior === CameraScrollBehavior.Wrap) {
      newTargetIndex = ((newTargetIndex % poiCount) + poiCount) % poiCount
    } else {
      newTargetIndex = Math.max(0, newTargetIndex)
    }

    if (transitionType === PoiScrollTransition.Snapping) {
      // Snap mode: set target and reset lerp
      setComponent(props.entity, PoiCameraComponent, {
        targetPoiIndex: newTargetIndex,
        currentPoiIndex: currentTargetIndex, // Keep current as starting point
        poiLerpValue: 0, // Reset lerp to start transition
        isTransitioning: true
      })
    } else {
      // Scrolling mode: directly set current index (legacy behavior)
      setComponent(props.entity, PoiCameraComponent, {
        currentPoiIndex: newTargetIndex
      })
    }
  }

  const nextClicked = () => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const currentTargetIndex = poiCamera.targetPoiIndex
    const poiCount = cameraSettingsState.poiEntities.length

    let newTargetIndex = currentTargetIndex + 1

    // Handle wrapping or clamping
    if (scrollBehavior === CameraScrollBehavior.Wrap) {
      newTargetIndex = ((newTargetIndex % poiCount) + poiCount) % poiCount
    } else {
      newTargetIndex = Math.min(poiCount - 1, newTargetIndex)
    }

    if (transitionType === PoiScrollTransition.Snapping) {
      // Snap mode: set target and reset lerp
      setComponent(props.entity, PoiCameraComponent, {
        targetPoiIndex: newTargetIndex,
        currentPoiIndex: currentTargetIndex, // Keep current as starting point
        poiLerpValue: 0, // Reset lerp to start transition
        isTransitioning: true
      })
    } else {
      // Scrolling mode: directly set current index (legacy behavior)
      setComponent(props.entity, PoiCameraComponent, {
        currentPoiIndex: newTargetIndex
      })
    }
  }

  useEffect(() => {
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const activeIndex = poiCamera.currentPoiIndex

    // Update button visibility based on scroll behavior
    setShowPrevious(scrollBehavior === CameraScrollBehavior.Wrap || activeIndex > 0)
    setShowNext(
      scrollBehavior === CameraScrollBehavior.Wrap || activeIndex < cameraSettingsState.poiEntities.length - 1
    )
  }, [poiCamera.currentPoiIndex, cameraSettingsState.poiEntities.length])

  // Check if buttons should be disabled during snapping transitions
  useEffect(() => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const isSnappingMode = transitionType === PoiScrollTransition.Snapping
    const isTransitionActive = isSnappingMode && poiCamera.poiLerpValue > 0 && poiCamera.poiLerpValue < 1

    setButtonsDisabled(isTransitionActive)
  }, [cameraSettingsState.poiScrollTransitionType.value, poiCamera.poiLerpValue])

  // Don't show buttons if they're disabled
  if (!cameraSettingsState.enableTransitionButtons.value) {
    return null
  }

  return (
    <>
      <style type="text/css">{components}</style>
      <style type="text/css">{utilities}</style>
      <style type="text/css">{base}</style>

      <div style={{ height: canvasHeight, width: canvasWidth }} className={`flex flex-row `}>
        <div className="flex h-full w-1/2 items-center justify-start">
          {showPrevious && (
            <button
              xr-layer="true"
              className={`pointer-events-auto ml-4 flex h-12 w-12 items-center justify-center rounded-md ${
                buttonsDisabled
                  ? 'cursor-not-allowed bg-gray-400 text-gray-600 opacity-50'
                  : 'bg-ui-background text-text-primary-button hover:bg-gray-200'
              }`}
              onClick={buttonsDisabled ? undefined : previousClicked}
              disabled={buttonsDisabled}
            >
              <FaArrowLeft className={buttonsDisabled ? 'text-gray-600' : 'text-black'} />
            </button>
          )}
        </div>
        <div className="flex h-full w-1/2 items-center justify-end">
          {showNext && (
            <button
              xr-layer="true"
              className={`pointer-events-auto mr-4 flex h-12 w-12 items-center justify-center rounded-md ${
                buttonsDisabled
                  ? 'cursor-not-allowed bg-gray-400 text-gray-600 opacity-50'
                  : 'bg-ui-background text-text-primary-button hover:bg-gray-200'
              }`}
              onClick={buttonsDisabled ? undefined : nextClicked}
              disabled={buttonsDisabled}
            >
              <FaArrowRight className={buttonsDisabled ? 'text-gray-600' : 'text-black'} />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
