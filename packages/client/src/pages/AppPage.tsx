// import * as chapiWalletPolyfill from 'credential-handler-polyfill'

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useSearchParamState } from '@ir-engine/client-core/src/common/services/RouterService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import { LoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { useAuthenticated } from '@ir-engine/client-core/src/user/services/AuthService'
import config from '@ir-engine/common/src/config'
import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import { ClientEngineSettingType } from '@ir-engine/server-core/src/appconfig'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import './styles.scss'

const ClientSettings = () => {
  const clientSetting = useEngineSetting<ClientEngineSettingType>('client')

  useEffect(() => {
    if (clientSetting?.data?.mediaSettings) {
      config.client.mediaSettings = clientSetting?.data?.mediaSettings
    }
  }, [clientSetting.status])

  return <></>
}

const AppPage = (props: { children: React.ReactNode; fallback?: JSX.Element; loginRequired?: boolean }) => {
  const { t } = useTranslation()
  const isLoggedIn = useAuthenticated()

  useThemeProvider()

  useSearchParamState()

  const loginRequired = typeof props.loginRequired === 'undefined' ? true : props.loginRequired

  if (loginRequired && !isLoggedIn) {
    return (
      props.fallback ?? <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.authenticating')} />
    )
  }

  return (
    <>
      <NotificationSnackbar />
      <LoadWebappInjection isLocationPage={!props.loginRequired} fallback={props.fallback}>
        {props.children}
      </LoadWebappInjection>
      {isLoggedIn && <ClientSettings />}
    </>
  )
}

export default AppPage
