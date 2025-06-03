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

import { EngineState } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useMutableState } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraScrollBehavior, PoiScrollTransition } from '@ir-engine/spatial/src/camera/types/CameraMode'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

/**
 * Component for entities that serve as points of interest for the camera system.
 * This component stores settings related to how the camera should behave when focusing on this POI.
 */
export const PoiUIComponent = defineComponent({
  name: 'PoiUIComponent',
  jsonID: 'IR_poi_ui',

  reactor: () => {
    const engineState = useMutableState(EngineState)

    useEffect(() => {
      if (engineState.isEditing.value) return

      const canvas = document.getElementById('engine-renderer-canvas') as HTMLMediaElement
      const uiContainer = document.createElement('div')
      uiContainer.id = 'poi-ui-container'
      uiContainer.style.width = '100%'
      uiContainer.style.height = '100%'
      uiContainer.style.position = 'absolute'
      uiContainer.style.pointerEvents = 'none'

      canvas.parentElement?.appendChild(uiContainer)
      const reactRoot = createRoot(uiContainer)
      reactRoot.render(<PoiUIReactor />)

      return () => {
        reactRoot.unmount()
        canvas.parentElement?.removeChild(uiContainer)
        uiContainer.remove()
      }
    }, [engineState.isEditing.value])

    return null
  }
})

function PoiUIReactor() {
  const cameraSettingsState = useMutableState(CameraSettingsState)

  // State for reactive boolean variables
  const [showPrevious, setShowPrevious] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [buttonsDisabled, setButtonsDisabled] = useState(false)

  const previousClicked = () => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const currentTargetIndex = cameraSettingsState.targetPoiIndex.value
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
      cameraSettingsState.targetPoiIndex.set(newTargetIndex)
      cameraSettingsState.currentPoiIndex.set(currentTargetIndex) // Keep current as starting point
      cameraSettingsState.poiLerpValue.set(0) // Reset lerp to start transition
    } else {
      // Scrolling mode: directly set current index (legacy behavior)
      cameraSettingsState.currentPoiIndex.set(newTargetIndex)
    }
  }

  const nextClicked = () => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const currentTargetIndex = cameraSettingsState.targetPoiIndex.value
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
      cameraSettingsState.targetPoiIndex.set(newTargetIndex)
      cameraSettingsState.currentPoiIndex.set(currentTargetIndex) // Keep current as starting point
      cameraSettingsState.poiLerpValue.set(0) // Reset lerp to start transition
    } else {
      // Scrolling mode: directly set current index (legacy behavior)
      cameraSettingsState.currentPoiIndex.set(newTargetIndex)
    }
  }

  useEffect(() => {
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const activeIndex = cameraSettingsState.currentPoiIndex.value

    // Update button visibility based on scroll behavior
    setShowPrevious(scrollBehavior === CameraScrollBehavior.Wrap || activeIndex > 0)
    setShowNext(
      scrollBehavior === CameraScrollBehavior.Wrap || activeIndex < cameraSettingsState.poiEntities.length - 1
    )
  }, [cameraSettingsState.currentPoiIndex.value, cameraSettingsState.poiEntities.length])

  // Check if buttons should be disabled during snapping transitions
  useEffect(() => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const isSnappingMode = transitionType === PoiScrollTransition.Snapping
    const isTransitionActive = isSnappingMode && cameraSettingsState.poiLerpValue.value < 1

    setButtonsDisabled(isTransitionActive)
  }, [cameraSettingsState.poiScrollTransitionType.value, cameraSettingsState.poiLerpValue.value])

  // Don't show buttons if they're disabled
  if (!cameraSettingsState.enableTransitionButtons.value) {
    return null
  }

  return (
    <>
      <div className="flex h-full w-full flex-row">
        <div className="flex h-full w-1/2 items-center justify-start">
          {showPrevious && (
            <button
              className={`pointer-events-auto ml-4 flex h-16 w-16 items-center justify-center rounded-md ${
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
              className={`pointer-events-auto mr-4 flex h-16 w-16 items-center justify-center rounded-md ${
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
