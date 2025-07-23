import React, { useLayoutEffect, useRef } from 'react'

import { TouchGamepad } from '@ir-engine/client-core/src/common/components/TouchGamepad'
import UserMenus from '@ir-engine/client-core/src/user/menus'
import { EngineState } from '@ir-engine/ecs'
import { getMutableState, NO_PROXY, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraMode } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { ModalState } from '../../common/services/ModalState'
import { LoadingSystemState } from '../../systems/state/LoadingState'
import LocationIconButton from '../../user/components/LocationIconButton'
import InstanceChat from '../../user/InstanceChat'
import { VideoWindows } from '../../user/VideoWindows'
import { ViewerMenuState } from '../../util/ViewerMenuState'
import { ARPlacement } from '../ARPlacement'
import { Fullscreen } from '../Fullscreen'
import { MediaIconsBox } from '../MediaIconsBox'
import { XRLoading } from '../XRLoading'
import ScreenRotateImage from './screen-rotate.svg'

export const ViewerInteractions = () => {
  const isPortrait = useHookstate(window.matchMedia('(orientation: portrait)').matches)
  const userID = useHookstate(getMutableState(EngineState).userID).value
  const loadingScreenVisible = useHookstate(getMutableState(LoadingSystemState).loadingScreenVisible).value
  const { t } = useTranslation()
  const externalInjectedMenus = useMutableState(ViewerMenuState).externalInjectedMenus.get(NO_PROXY)
  const locationContainer = useRef<HTMLDivElement>(null)

  const cameraSettingsState = useMutableState(CameraSettingsState)

  useLayoutEffect(() => {
    if (locationContainer.current) locationContainer.current.style.opacity = '0'
  }, [locationContainer])

  useLayoutEffect(() => {
    const orientationChangeHandler = () => {
      if (screen.orientation.type.match('portrait')) {
        isPortrait.set(true)
      } else {
        isPortrait.set(false)
      }
    }
    screen.orientation.addEventListener('change', orientationChangeHandler)
    return () => {
      screen.orientation.removeEventListener('change', orientationChangeHandler)
    }
  }, [])

  if (!userID) return null

  if (isMobile && isPortrait.value) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-[#070708]">
        <div className="flex flex-col items-center justify-center gap-y-4">
          <span>{t('user:messages.rotateLandscape')}</span>
          <img src={ScreenRotateImage} className="h-20 w-16" />
        </div>
      </div>
    )
  }

  return (
    <div id="location-container" ref={locationContainer} className="fixed h-dvh w-full p-6">
      <div className="pointer-events-auto absolute left-0 top-0 h-fit w-full pt-[inherit]">
        <MediaIconsBox />
      </div>

      {cameraSettingsState.cameraMode.value === CameraMode.FOLLOW && (
        <div className="pointer-events-auto absolute left-0 top-0 select-none pl-[inherit] pt-[inherit]">
          <VideoWindows />
        </div>
      )}

      <div
        className={twMerge(
          'absolute bottom-0 left-0 h-fit w-full pb-[inherit]',
          loadingScreenVisible ? 'pointer-events-none' : 'pointer-events-auto '
        )}
      >
        <UserMenus />
      </div>

      <div className="pointer-events-auto absolute bottom-0 left-0 pb-[inherit] pl-[inherit]">
        {!isMobile && <Fullscreen />}
      </div>

      <div className="pointer-events-auto absolute bottom-0 right-0 pb-[inherit] pr-[inherit]">
        <InstanceChat />
      </div>

      <div className="pointer-events-auto absolute right-0 top-0 pb-[inherit] pr-[inherit] pt-[inherit]">
        {Object.entries(externalInjectedMenus).map(([menuName, props]) => (
          <LocationIconButton
            key={menuName}
            title={props.title}
            icon={props.icon}
            onClick={() => ModalState.openModal(props.component as JSX.Element)}
          />
        ))}
      </div>

      <ARPlacement />
      <XRLoading />

      {isMobile && <TouchGamepad />}
    </div>
  )
}
