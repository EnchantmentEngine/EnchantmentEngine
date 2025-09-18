import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import '../styles.scss'

import '../../engine'

import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import Debug from '@ir-engine/client-core/src/components/Debug'
import { LoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { EngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { Authenticate } from '@ir-engine/client-core/src/user/services/Authenticate'
import { ChatPage } from '@ir-engine/ui/src/pages/Chat/chat'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

export default function Chat() {
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
                <Route path="*" element={<ChatPage />} />
              </Routes>
            </Suspense>
            <Debug />
          </EngineInjection>
        </LoadWebappInjection>
      </Authenticate>
    </>
  )
}
