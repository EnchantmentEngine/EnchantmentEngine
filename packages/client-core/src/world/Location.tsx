import React, { useEffect, useLayoutEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { useLoadLocation, useLoadScene } from '@ir-engine/client-core/src/components/World/LoadLocationScene'
import { AuthService, AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ViewerInteractions as GlassViewerInteractions } from '../components/Glass'
import { ViewerInteractions } from '../components/ViewerInteractions'

import '@ir-engine/client-core/src/util/GlobalStyle.css'

import './LocationModule'

import multiLogger from '@ir-engine/common/src/logger'
import { useTranslation } from 'react-i18next'
import { NotificationService } from '../common/services/NotificationService'
import { ThemeState } from '../common/services/ThemeService'
import { useNetwork } from '../components/World/EngineHooks'
import { useUserBannedCheck } from '../hooks/useUserBanned'
import { LocationService } from '../social/services/LocationService'
import { LoadingUISystemState } from '../systems/LoadingUISystem'
import { clientContextParams } from '../util/ClientContextState'

import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'

const logger = multiLogger.child({ component: 'system:location', modifier: clientContextParams })

type Props = {
  online?: boolean
}

const LocationPage = ({ online }: Props) => {
  const { t } = useTranslation()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const ready = useMutableState(LoadingUISystemState).ready

  let [glassDisabled] = useFeatureFlags([FeatureFlags.Client.Glass])
  glassDisabled = glassDisabled && searchParams.get('glassUI') === null

  useNetwork({ online })

  if (params.locationName) {
    useLoadLocation({ locationName: params.locationName })
  } else {
    useLoadScene({ projectName: params.projectName!, sceneName: params.sceneName! })
  }

  AuthService.useAPIListeners()
  LocationService.useLocationBanListeners()

  useEffect(() => {
    if (!ready.value) return
    logger.analytics({ event_name: 'enter_location' })
    return () => logger.analytics({ event_name: 'exit_location' })
  }, [ready.value])

  // To show invalid token error
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.has('error')) {
      NotificationService.dispatchNotify(t('common:error.expiredToken'), {
        variant: 'error'
      })
    }
  }, [location.search])

  useLayoutEffect(() => {
    const previousTheme = getMutableState(ThemeState).theme.value
    ThemeState.setTheme('light')
    window.addEventListener('beforeunload', () => ThemeState.setTheme(previousTheme))
  }, [])

  const isAuthenticated = useHookstate(getMutableState(AuthState).isAuthenticated).value

  return (
    <>
      {glassDisabled ? <ViewerInteractions /> : <GlassViewerInteractions />}
      {isAuthenticated && <CheckBanned />}
    </>
  )
}

const CheckBanned = () => {
  useUserBannedCheck()
  return null
}

export default LocationPage
