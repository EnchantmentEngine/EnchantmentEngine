import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import '../../engine'

import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import LocationPage from '@ir-engine/client-core/src/world/Location'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const LocationRoutes = () => {
  const projectsLoaded = useEngineInjection()

  if (!projectsLoaded)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingProjects')} />

  return (
    <Suspense fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.offline')} />}>
      <Routes>
        <Route path=":projectName/:sceneName" element={<LocationPage />} />
        <Route path=":locationName" element={<LocationPage />} />
      </Routes>
    </Suspense>
  )
}

export default LocationRoutes
