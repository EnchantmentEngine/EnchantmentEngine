import React from 'react'

import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
// import { VrIcon } from '../../../common/components/Icons/VrIcon'
import { respawnAvatar } from '@ir-engine/engine/src/avatar/functions/respawnAvatar'
import { dispatchAction, getMutableState, hookstate, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { createXRUI } from '@ir-engine/spatial/src/xrui/createXRUI'
import { RegisteredWidgets, WidgetAppActions, WidgetAppState } from '../../WidgetAppService'

import { MediaStreamState } from '@ir-engine/hyperflux'
import { Microphone01, MicrophoneOff, Refresh2Lg, User01Lg } from '@ir-engine/ui/src/icons'
import { SVGIconType } from '@ir-engine/ui/src/icons/types'
import { IconType } from 'react-icons'
import { useMediaInstance } from '../../../common/services/MediaInstanceConnectionService'
import XRIconButton from '../../components/XRIconButton'
import HandSVG from './back_hand_24px.svg?react'
import styleString from './index.scss?inline'

export function createWidgetButtonsView() {
  return createXRUI(WidgetButtons, createWidgetButtonsState())
}

function createWidgetButtonsState() {
  return hookstate({})
}

type WidgetButtonProps = {
  Icon: SVGIconType | IconType
  toggle: () => any
  label: string
  disabled?: boolean
}

const WidgetButton = ({ Icon, toggle, label, disabled }: WidgetButtonProps) => {
  const mouseOver = useHookstate(false)
  return (
    <XRIconButton
      disabled={disabled}
      size="large"
      content={
        <>
          {<Icon className="svgIcon" />}
          {mouseOver.value && <div>{label}</div>}
        </>
      }
      onClick={toggle}
      onMouseEnter={() => mouseOver.set(true)}
      onMouseLeave={() => mouseOver.set(false)}
      xr-layer="true"
    />
  )
}

const HandednessWidgetButton = () => {
  const preferredHand = useHookstate(getMutableState(InputState).preferredHand)
  const mouseOver = useHookstate(false)
  return (
    <XRIconButton
      disabled={false}
      size="large"
      content={
        mouseOver.value ? (
          <div>{preferredHand.value === 'left' ? 'Left' : 'Right'}</div>
        ) : (
          <>
            <div style={{ transform: `scaleX(${preferredHand.value === 'right' ? -1 : 1})` }}>
              <HandSVG />
            </div>
            <div
              style={{
                color: 'var(--iconButtonBackground)',
                position: 'absolute',
                fontSize: '10px'
              }}
            >
              {preferredHand.value === 'left' ? 'L' : 'R'}
            </div>
          </>
        )
      }
      onClick={() => preferredHand.set((val) => (val === 'left' ? 'right' : 'left'))}
      onMouseEnter={() => mouseOver.set(true)}
      onMouseLeave={() => mouseOver.set(false)}
      xr-layer="true"
    />
  )
}

export const WidgetButtons = () => {
  const widgetMutableState = useMutableState(WidgetAppState)
  const sessionMode = useHookstate(getMutableState(XRState).sessionMode)
  const mediaInstanceState = useMediaInstance()

  const mediaStreamState = useMutableState(MediaStreamState)
  const isCamAudioEnabled = !!mediaStreamState.microphoneMediaStream.value && mediaStreamState.microphoneEnabled.value

  // TODO: add a notification hint function to the widget wrapper and move unread messages there
  // useEffect(() => {
  //   activeChannel &&
  //     activeChannel.messages &&
  //     activeChannel.messages.length > 0 &&
  //     !widgetMutableState.chatMenuOpen.value &&
  //     setUnreadMessages(true)
  // }, [activeChannel?.messages])

  // const toggleVRSession = () => {
  //   if (engineState.xrSessionStarted.value) {
  //     endXRSession()
  //   } else {
  //     requestXRSession()
  //   }
  // }

  const handleRespawnAvatar = () => {
    respawnAvatar(AvatarComponent.getSelfAvatarEntity())
  }

  const handleHeightAdjustment = () => {
    XRState.setTrackingSpace()
  }

  const widgets = Object.entries(widgetMutableState.widgets.value).map(([id, widgetMutableState]) => ({
    id,
    ...widgetMutableState,
    ...RegisteredWidgets.get(id)!
  }))

  const toggleWidget = (toggledWidget) => () => {
    const state = widgetMutableState.widgets.value
    const visible = state[toggledWidget.id].visible
    // close currently open widgets until we support multiple widgets being open at once
    if (!visible) {
      Object.entries(state).forEach(([id, widget]) => {
        if (widget.visible && id !== toggledWidget.id) dispatchAction(WidgetAppActions.showWidget({ id, shown: false }))
      })
    }
    dispatchAction(WidgetAppActions.showWidget({ id: toggledWidget.id, shown: !visible }))
  }

  const activeWidgets = widgets.filter((widget) => widget.enabled && widget.icon)

  const additionalWidgetCount = 1 + (mediaInstanceState?.value ? 1 : 0)
  const gridTemplateColumns = new Array(additionalWidgetCount)
    .fill('1fr')
    .concat(activeWidgets.map(() => ' 1fr'))
    .join(' ')

  return (
    <>
      <style>{styleString}</style>
      <div className="container" style={{ gridTemplateColumns }} xr-pixel-ratio="8" xr-layer="true">
        <WidgetButton Icon={Refresh2Lg} toggle={handleRespawnAvatar} label={'Respawn'} />
        {sessionMode.value !== 'none' && (
          <WidgetButton Icon={User01Lg} toggle={handleHeightAdjustment} label={'Reset Height'} />
        )}
        <HandednessWidgetButton />
        {mediaInstanceState?.value && (
          <WidgetButton
            Icon={isCamAudioEnabled ? Microphone01 : MicrophoneOff}
            toggle={MediaStreamState.toggleMicrophonePaused}
            label={isCamAudioEnabled ? 'Audio on' : 'Audio Off'}
          />
        )}
        {/* <WidgetButton
          Icon={VrIcon}
          toggle={toggleVRSession}
          label={engineState.xrSessionStarted.value ? 'Exit VR' : 'Enter VR'}
        /> */}
        {activeWidgets.map((widget, i) => (
          <WidgetButton key={i} Icon={widget.icon!} toggle={toggleWidget(widget)} label={widget.label} />
        ))}
      </div>
    </>
  )
}
