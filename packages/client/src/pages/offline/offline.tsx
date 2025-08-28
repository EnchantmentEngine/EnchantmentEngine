import { t } from 'i18next'
import React, { Suspense, useRef } from 'react'
import { Route, Routes } from 'react-router-dom'

import '../../engine'

import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import { LoadWebappInjection, useLoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useBrowserCheck } from '@ir-engine/client-core/src/hooks/useUnsupported'
import { useAuthenticated } from '@ir-engine/client-core/src/user/services/Authenticate'
import LocationPage from '@ir-engine/client-core/src/world/Location'
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const LocationRoutes = () => {
  const ref = useRef<HTMLElement>(document.body)

  useAuthenticated()

  useThemeProvider()

  useLoadWebappInjection()

  useSpatialEngine()
  useEngineCanvas(ref)
  useBrowserCheck()

  useEngineInjection()

  return (
    <>
      <NotificationSnackbar />
      <LoadWebappInjection>
        <Suspense fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.offline')} />}>
          <Routes>
            <Route path=":projectName/:sceneName" element={<LocationPage />} />
            <Route path=":locationName" element={<LocationPage />} />
          </Routes>
        </Suspense>
      </LoadWebappInjection>
    </>
  )
}

export default LocationRoutes
