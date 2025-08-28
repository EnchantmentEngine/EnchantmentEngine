import React, { useLayoutEffect } from 'react'

import { useLoadScene } from '@ir-engine/client-core/src/components/World/LoadLocationScene'
import { AuthService } from '@ir-engine/client-core/src/user/services/AuthService'
import { getMutableState } from '@ir-engine/hyperflux'
import { ViewerInteractions } from '../components/ViewerInteractions'

import '@ir-engine/client-core/src/util/GlobalStyle.css'

import './LocationModule'

import { useSearchParams } from 'react-router-dom'
import { ThemeState } from '../common/services/ThemeService'
import { useNetwork } from '../components/World/EngineHooks'
import { LocationService } from '../social/services/LocationService'

const OfflinePage = () => {
  const [params] = useSearchParams()

  useNetwork({ online: false })
  useLoadScene({ projectName: params.get('project')!, sceneName: params.get('scenePath')! })

  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useLayoutEffect(() => {
    const previousTheme = getMutableState(ThemeState).theme.value
    ThemeState.setTheme('light')
    window.addEventListener('beforeunload', () => ThemeState.setTheme(previousTheme))
  }, [])

  return (
    <>
      <ViewerInteractions />
    </>
  )
}

export default OfflinePage
