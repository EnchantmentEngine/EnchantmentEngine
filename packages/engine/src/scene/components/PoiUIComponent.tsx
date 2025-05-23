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

import { EngineState, useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useMutableState } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

/**
 * Component for entities that serve as points of interest for the camera system.
 * This component stores settings related to how the camera should behave when focusing on this POI.
 */
export const PoiUIComponent = defineComponent({
  name: 'PoiUIComponent',
  jsonID: 'EE_poi_ui',

  schema: S.Object({}),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, PoiUIComponent)
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

  const previousClicked = () => {
    cameraSettingsState.currentPoiIndex.set(cameraSettingsState.currentPoiIndex.value - 1)
    console.log('previous clicked')
  }
  const nextClicked = () => {
    cameraSettingsState.currentPoiIndex.set(cameraSettingsState.currentPoiIndex.value + 1)
    console.log('next clicked')
  }

  useEffect(() => {
    cameraSettingsState.currentPoiIndex.set(0)
  }, [])

  useEffect(() => {
    console.log('mbf', cameraSettingsState.currentPoiIndex.value)
  }, [cameraSettingsState.currentPoiIndex.value])

  return (
    <>
      <div className="flex h-full w-full flex-row">
        <div className="flex h-full w-1/2 items-center justify-start">
          {cameraSettingsState.currentPoiIndex.value > 0 && (
            <button
              className="pointer-events-auto ml-4 flex h-16 w-16 items-center justify-center rounded-md bg-ui-background text-text-primary-button"
              onClick={previousClicked}
            >
              <FaArrowLeft className="text-black" />
            </button>
          )}
        </div>
        <div className="flex h-full w-1/2 items-center justify-end">
          {cameraSettingsState.currentPoiIndex.value < cameraSettingsState.poiEntities.length - 1 && (
            <button
              className="pointer-events-auto mr-4 flex h-16 w-16 items-center justify-center rounded-md bg-ui-background text-text-primary-button"
              onClick={nextClicked}
            >
              <FaArrowRight className="text-black" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
