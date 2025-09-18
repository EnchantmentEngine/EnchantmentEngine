import { t } from 'i18next'
import React, { Suspense, useRef } from 'react'
import { Route, Routes } from 'react-router-dom'

import '../../engine'

import Debug from '@ir-engine/client-core/src/components/Debug'
import { useBrowserCheck } from '@ir-engine/client-core/src/hooks/useUnsupported'
import LocationPage from '@ir-engine/client-core/src/world/Location'
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import { MultiplayerState } from '@ir-engine/client-core/src/common/services/MultiplayerState'
import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import { LoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { EngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { LoadingUISystemState } from '@ir-engine/client-core/src/systems/LoadingUISystem'
import { useAuthenticated } from '@ir-engine/client-core/src/user/services/Authenticate'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import '../styles.scss'

const LocationRoutes = () => {
  const ref = useRef<HTMLElement>(document.body)
  const ready = useHookstate(getMutableState(LoadingUISystemState).ready).value

  useThemeProvider()

  useAuthenticated()

  useSpatialEngine()
  useEngineCanvas(ref)
  useBrowserCheck()

  const multiplayer = useMutableState(MultiplayerState).world

  return (
    <>
      <NotificationSnackbar />
      <LoadWebappInjection>
        <EngineInjection>
          <Suspense>
            <Routes>
              <Route path=":locationName/*" element={<LocationPage online={multiplayer.value} />} />
            </Routes>
            {!ready && (
              <div className="relative flex h-dvh w-dvw items-center justify-center bg-white" style={{ zIndex: 100 }}>
                <LoadingView fullScreen animated title={t('common:loader.loadingApp')} titleClassname="text-black" />
              </div>
            )}
          </Suspense>
        </EngineInjection>
      </LoadWebappInjection>
      <Debug />
    </>
  )
}

export default LocationRoutes
