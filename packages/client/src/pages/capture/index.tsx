import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import Capture from './capture'

const LocationRoutes = () => {
  const projectsLoaded = useEngineInjection()

  if (!projectsLoaded)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingProjects')} />

  return (
    <Suspense
      fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingLocation')} />}
    >
      <Routes>
        <Route path=":locationName" element={<Capture />} />
        <Route path="/" element={<Capture />} />
      </Routes>
    </Suspense>
  )
}

export default LocationRoutes
