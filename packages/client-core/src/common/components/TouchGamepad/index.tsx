import React, { useEffect } from 'react'
import { Joystick } from 'react-joystick-component'

import { config } from '@ir-engine/common/src/config'
import { InteractableState } from '@ir-engine/engine/src/interaction/functions/interactableFunctions'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { isTouchAvailable } from '@ir-engine/spatial/src/common/functions/DetectFeatures'
import { AnyButton } from '@ir-engine/spatial/src/input/state/ButtonState'
import { XRState, isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick'
import { AppState } from '../../services/AppService'

const triggerButton = (button: AnyButton, pressed: boolean): void => {
  const eventType = pressed ? 'touchgamepadbuttondown' : 'touchgamepadbuttonup'
  const event = new CustomEvent(eventType)
  document.dispatchEvent(event)
}

const handleMove = (e: IJoystickUpdateEvent) => {
  if (!e.x || !e.y) return

  const event = new CustomEvent('touchstickmove', {
    detail: {
      stick: 'LeftStick',
      value: { x: e.x, y: -e.y, angleRad: 0 }
    }
  })

  document.dispatchEvent(event)
}

const handleStop = () => {
  const event = new CustomEvent('touchstickmove', {
    detail: { stick: 'LeftStick', value: { x: 0, y: 0, angleRad: 0 } }
  })
  document.dispatchEvent(event)
}

const buttonsConfig: Array<{ button: AnyButton; label: React.ReactElement }> = []

export const TouchGamepad = () => {
  const interactableState = useMutableState(InteractableState)
  const availableInteractable = interactableState.available.value?.[0]
  const appState = useMutableState(AppState)

  const isMovementControlsEnabled = XRState.useMovementControlsEnabled()

  const hasGamepad = useHookstate(false)

  useEffect(() => {
    const getGamepads = () => {
      hasGamepad.set(!!navigator.getGamepads().filter(Boolean).length)
    }
    getGamepads()
    window.addEventListener('gamepadconnected', getGamepads)
    window.addEventListener('gamepaddisconnected', getGamepads)
    return () => {
      window.removeEventListener('gamepadconnected', getGamepads)
      window.removeEventListener('gamepaddisconnected', getGamepads)
    }
  }, [])

  if (
    !isMovementControlsEnabled ||
    !isTouchAvailable ||
    isMobileXRHeadset ||
    !appState.showTouchPad.value ||
    hasGamepad.value
  )
    return null

  const buttons = buttonsConfig.map((value, index) => (
    <div
      key={index}
      className="bg-[rgb(255,255,255, 0.4)] bottom-5 h-[3em] w-[3em] border border-white text-center text-xl shadow-[0_0_10px_rgba(255,255,0,1)]"
      onPointerDown={(): void => triggerButton(value.button, true)}
      onPointerUp={(): void => triggerButton(value.button, false)}
    >
      {value.label}
    </div>
  ))

  return (
    <>
      <div className="pointer-events-auto fixed bottom-[10%] left-[10%] select-none [&>div]:m-auto">
        <Joystick
          baseImage={`${config.client.clientUrl}/static/joysticksticky.svg`}
          stickImage={`${config.client.clientUrl}/static/joystickring.svg`}
          size={80}
          stickSize={80}
          throttle={100}
          minDistance={40}
          move={handleMove}
          stop={handleStop}
          baseColor="rgba(255, 255, 255, 0.8)"
          stickColor="rgba(255, 255, 255, 1)"
        />
      </div>
      {availableInteractable && (
        <div className="fixed bottom-[10px] right-[150px] select-none rounded-[50%] leading-[4em]">{buttons}</div>
      )}
    </>
  )
}
