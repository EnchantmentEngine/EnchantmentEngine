import { t } from 'i18next'
import React, { Suspense } from 'react'

import '../../engine'
import '../styles.scss'

import AdminRoutes from '@ir-engine/client-core/src/admin/adminRoutes'
import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import Debug from '@ir-engine/client-core/src/components/Debug'
import { LoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { EngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { Authenticate } from '@ir-engine/client-core/src/user/services/Authenticate'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const LocationRoutes = () => {
  useThemeProvider()
  return (
    <>
      <NotificationSnackbar />
      <Authenticate>
        <LoadWebappInjection>
          <EngineInjection>
            <>
              <Suspense
                fallback={
                  <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingLocation')} />
                }
              >
                <AdminRoutes />
              </Suspense>
              <Debug />
            </>
          </EngineInjection>
        </LoadWebappInjection>
      </Authenticate>
    </>
  )
}

export default LocationRoutes
