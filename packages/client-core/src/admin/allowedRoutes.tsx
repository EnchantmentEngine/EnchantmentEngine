import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'

import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { Redirect } from '../common/components/Redirect'
import { AllowedAdminRoutesState } from './AllowedAdminRoutesState'

const AllowedRoutes = () => {
  const location = useLocation()
  const { pathname } = location

  const allowedRoutes = useMutableState(AllowedAdminRoutesState)

  const path = pathname.split('/')[2]

  const currentRoute = allowedRoutes[path]

  const allowedRoutesKeys = Object.keys(allowedRoutes)
  if (!path) {
    for (const key of allowedRoutesKeys) {
      const allowedRoute = allowedRoutes[key]
      if (allowedRoute?.value && allowedRoute?.value?.access) {
        return <Redirect to={`/admin/${key}`} />
      }
    }
  }

  if (currentRoute?.value && currentRoute.redirect.value) return <Redirect to={currentRoute.redirect?.value} />

  const Element = currentRoute?.get(NO_PROXY)?.component
  const allowed = currentRoute?.access?.value

  return (
    <Suspense
      fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingAllowed')} />}
    >
      <Routes>{allowed && Element && <Route key={path} path={`*`} element={<Element />} />}</Routes>
    </Suspense>
  )
}

export default AllowedRoutes
