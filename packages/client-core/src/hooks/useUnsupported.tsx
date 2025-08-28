import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { defineState, getState, isDev, syncStateWithLocalStorage } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import React, { useEffect } from 'react'
import { NotificationService } from '../common/services/NotificationService'
import { UnsupportedBrowser } from '../components/modals/UnsupportedBrowser'
import { UnsupportedDevice } from '../components/modals/UnsupportedDevice'

export const BrowserSupportState = defineState({
  name: 'ir.client-core.BrowserSupportState',
  initial: () => ({
    acknowledgedUnsupportedBrowser: isDev,
    acknowledgedUnsupportedDevice: isDev
  }),
  extension: syncStateWithLocalStorage(['acknowledgedUnsupportedBrowser', 'acknowledgedUnsupportedDevice'])
})

type Props = {
  device?: boolean
  browser?: boolean
}

export const useUnsupported = ({ device = false, browser = false }: Props) => {
  useEffect(() => {
    const { acknowledgedUnsupportedBrowser, acknowledgedUnsupportedDevice } = getState(BrowserSupportState)
    if (!acknowledgedUnsupportedDevice && isMobile && device) {
      ModalState.openModal(<UnsupportedDevice />)
      return
    }
    if (!acknowledgedUnsupportedBrowser && !isSupportedBrowser() && browser) {
      ModalState.openModal(<UnsupportedBrowser />)
      return
    }
  }, [isMobile, device, browser])
}

export const isSupportedBrowser = () => {
  const userAgent = window.navigator.userAgent
  const isGoogleChrome = /Chrome/.test(userAgent) && !/Chromium|Edg|OPR|Brave|CriOS/.test(userAgent)
  const isSafari = /^((?!chrome|androidg).)*safari/i.test(userAgent)

  return isGoogleChrome || isSafari
}

export const useBrowserCheck = () => {
  useEffect(() => {
    const { acknowledgedUnsupportedBrowser, acknowledgedUnsupportedDevice } = getState(BrowserSupportState)
    if (!isSupportedBrowser() && !acknowledgedUnsupportedBrowser) {
      NotificationService.dispatchNotify(
        'The browser you are on is not supported. For the best experience please use Google Chrome.',
        { variant: 'warning' }
      )
    }

    // if (isMobile && !acknowledgedUnsupportedDevice) {
    //   NotificationService.dispatchNotify(
    //     'Not optimized for mobile, experience might have issues. For best experience use desktop Chrome.',
    //     {
    //       variant: 'warning'
    //     }
    //   )
    // }
  }, [])
}
