import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import '../styles.scss'

import { EngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import { LoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { Authenticate } from '@ir-engine/client-core/src/user/services/Authenticate'
import Capture from './capture'

const LocationRoutes = () => {
  useThemeProvider()
  return (
    <>
      <NotificationSnackbar />
      <Authenticate>
        <LoadWebappInjection>
          <EngineInjection>
            <Suspense
              fallback={
                <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingLocation')} />
              }
            >
              <Routes>
                <Route path=":locationName" element={<Capture />} />
                <Route path="/" element={<Capture />} />
              </Routes>
            </Suspense>
          </EngineInjection>
        </LoadWebappInjection>
      </Authenticate>
    </>
  )
}

export default LocationRoutes
