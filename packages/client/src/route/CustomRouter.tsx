import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import ClientErrorBoundary from '@ir-engine/client-core/src/common/components/ClientErrorBoundary'
import { useCustomRoutes } from '@ir-engine/client-core/src/common/services/RouterService'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import $404 from '../pages/404'
import $503 from '../pages/503'

function CustomRouter() {
  const customRoutes = useCustomRoutes()

  if (!customRoutes.length) {
    return <LoadingView fullScreen className={`block h-12 w-12`} title={t('common:loader.loadingRoutes')} />
  }

  return (
    <ClientErrorBoundary>
      <Suspense
        fallback={<LoadingView fullScreen className={`block h-12 w-12`} title={t('common:loader.loadingRoutes')} />}
      >
        <Routes>
          {customRoutes.map((route, i) => {
            const { route: r, component, props: p, componentProps } = route
            const Element = component as any
            return (
              <Route
                key={`custom-route-${i}`}
                path={r === '/' ? '' : r.split('/')[1] === '' ? `${r}*` : `${r}/*`}
                element={<Element {...componentProps} />}
                {...p}
              />
            )
          })}
          {/* if no index page has been provided, indicate this as obviously as possible */}
          {!customRoutes.find((route) => route.route === '/') && <Route key={'/503'} path={'/'} element={<$503 />} />}
          <Route key={'404'} path="*" element={<$404 />} />
        </Routes>
      </Suspense>
    </ClientErrorBoundary>
  )
}

export default CustomRouter
