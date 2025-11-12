import { t } from 'i18next'
import React, { Suspense, useRef } from 'react'

import '../../engine'

import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import Debug from '@ir-engine/client-core/src/components/Debug'
import { LoadWebappInjection, useLoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useBrowserCheck } from '@ir-engine/client-core/src/hooks/useUnsupported'
import { useAuthenticated } from '@ir-engine/client-core/src/user/services/Authenticate'
import OfflinePage from '@ir-engine/client-core/src/world/Offline'
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const LocationRoutes = () => {
  const ref = useRef<HTMLElement>(document.body)

  useSpatialEngine()
  useEngineCanvas(ref)
  useAuthenticated()
  useThemeProvider()
  useLoadWebappInjection()
  useBrowserCheck()
  useEngineInjection()

  return (
    <>
      <NotificationSnackbar />
      <LoadWebappInjection>
        <Suspense fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.offline')} />}>
          <OfflinePage />
          <Debug />
        </Suspense>
      </LoadWebappInjection>
    </>
  )
}

export default LocationRoutes
