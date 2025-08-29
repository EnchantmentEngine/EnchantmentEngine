import React from 'react'

import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { MediaComponent, MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { TransformComponent } from '@ir-engine/spatial'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import { createXRUI, XRUI } from '@ir-engine/spatial/src/xrui/createXRUI'
import { PauseCircleLg, PlayLg, VolumeMaxLg, VolumeXLg } from '@ir-engine/ui/src/icons'

export function createMediaControlsView(entity: Entity): XRUI<null> {
  const MediaControls = () => <MediaControlsView entity={entity} />
  const videoTransform = getOptionalComponent(entity, TransformComponent)
  const scaleX = videoTransform?.scale.x ?? 1
  const scaleY = videoTransform?.scale.y ?? 1

  const controlsUIScale = Math.min(scaleX, scaleY)

  const xrUI = createXRUI(MediaControls, null, { interactable: false })
  const xrUITransform = getOptionalComponent(xrUI.entity, XRUIComponent)
  xrUITransform?.scale.set(controlsUIScale, controlsUIScale, 1)

  return xrUI
}

type MediaControlsProps = {
  entity: Entity
}

const MediaControlsView = (props: MediaControlsProps) => {
  const transform = getComponent(props.entity, TransformComponent)
  const widthFactor = transform?.scale.x ?? 1
  const heightFactor = transform?.scale.y ?? 1
  const mediaComponent = useComponent(props.entity, MediaComponent)
  const mediaStyles = { fill: 'white', width: `100%`, height: `100%` }

  const buttonClickPausedToggle = () => {
    //early out if the mediaElement is null
    if (!hasComponent(props.entity, MediaElementComponent)) return

    const isPaused = mediaComponent.paused
    setComponent(props.entity, MediaComponent, {
      paused: !isPaused
    })
  }

  const buttonClickMuteToggle = () => {
    //early out if the mediaElement is null
    if (!hasComponent(props.entity, MediaElementComponent)) return
    const isMuted = mediaComponent.muted
    setComponent(props.entity, MediaComponent, {
      muted: !isMuted
    })
  }

  const width = 1000
  const height = 1000

  /** @todo does not currently support tailwind css */
  return (
    <div
      xr-layer="true"
      id="controls_container"
      style={{
        width: `${width * widthFactor}px`,
        height: `${height * heightFactor}px`
      }}
    >
      <style>
        {`
        button {
          background-color: #000000dd;
        }
        button:hover {
            background-color: grey;
        }`}
      </style>

      <div
        xr-layer="true"
        id="pauseContainer"
        style={{
          position: `absolute`,
          top: `0px`,
          left: `0px`,
          width: `100%`,
          height: `100%`,
          display: 'flex',
          alignItems: 'center',
          justifyItems: 'center',
          justifyContent: 'center',
          flex: 'auto'
        }}
      >
        <button
          xr-layer="true"
          id="pauseToggleButton"
          style={{
            fontFamily: "'Roboto', sans-serif",
            border: '10px solid grey',
            boxShadow: '#fff2 0 0 30px',
            color: 'lightgrey',
            fontSize: '25px',
            width: '10%',
            height: '10%',
            transform: 'translateZ(0.01px)'
          }}
          onClick={buttonClickPausedToggle}
        >
          {mediaComponent.paused && <PlayLg style={mediaStyles} />}
          {!mediaComponent.paused && <PauseCircleLg style={mediaStyles} />}
        </button>
      </div>

      <div
        xr-layer="true"
        id="muteContainer"
        style={{
          position: `absolute`,
          top: `0px`,
          left: `0px`,
          width: `100%`,
          height: `100%`,
          display: 'flex',
          alignItems: 'end',
          justifyItems: 'end',
          justifyContent: 'end',
          flex: 'auto'
        }}
      >
        <button
          xr-layer="true"
          id="muteToggleButton"
          style={{
            fontFamily: "'Roboto', sans-serif",
            border: '10px solid grey',
            boxShadow: '#fff2 0 0 30px',
            color: 'lightgrey',
            fontSize: '25px',
            width: '10%',
            height: '10%',
            margin: `10%`,
            transform: 'translateZ(0.01px)'
          }}
          onClick={buttonClickMuteToggle}
        >
          {mediaComponent.muted && <VolumeXLg style={mediaStyles} />}
          {!mediaComponent.muted && <VolumeMaxLg style={mediaStyles} />}
        </button>
      </div>
    </div>
  )
}
