import { t } from 'i18next'
import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, Routes } from 'react-router-dom'

import ClientErrorBoundary from '@ir-engine/client-core/src/common/components/ClientErrorBoundary'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

// tslint:disable:ordered-imports
// @ts-ignore
;(globalThis as any).process = { env: { ...(import.meta as any).env, APP_ENV: (import.meta as any).env.MODE } }

const $offline = lazy(() => import('@ir-engine/client/src/pages/offline/offline'))
const $banned = lazy(() => import('@ir-engine/client/src/pages/_banned'))
const $location = lazy(() => import('@ir-engine/client/src/pages/location/location'))
const $auth = lazy(() => import('@ir-engine/client/src/pages/auth/authRoutes'))

const Store = lazy(() => import('./store'))

const AppPage = lazy(() => import('./pages/AppPage'))
const Router = lazy(() => import('./route/CustomRouter'))

const App = () => {
  return (
    <ClientErrorBoundary>
      <Store>
        <Routes>
          {/* @todo - these are for backwards compatibility with non tailwind pages - they will be removed eventually */}
          <Route
            key="location"
            path="/location/*"
            element={
              <Suspense
                fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.starting')} />}
              >
                <AppPage loginRequired={false}>
                  <$location />
                </AppPage>
              </Suspense>
            }
          />
          <Route
            key="offline"
            path="/offline/*"
            element={
              <Suspense
                fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.starting')} />}
              >
                <AppPage>
                  <$offline />
                </AppPage>
              </Suspense>
            }
          />
          {/* This will become redundant and we can embed the AppPage directly */}
          <Route
            key="auth"
            path="/auth/*"
            element={
              <Suspense
                fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.starting')} />}
              >
                <$auth />
              </Suspense>
            }
          />
          <Route
            key="default"
            path="/*"
            element={
              <Suspense>
                <AppPage>
                  <Router />
                </AppPage>
              </Suspense>
            }
          />
        </Routes>
      </Store>
    </ClientErrorBoundary>
  )
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)
