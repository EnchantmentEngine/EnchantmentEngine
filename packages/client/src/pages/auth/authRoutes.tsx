import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import ErrorPage from '@ir-engine/client-core/src/user/oauth/ErrorPage'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import $magiclink from './magiclink'

const AuthRoutes = () => {
  return (
    <Suspense fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingAuth')} />}>
      <Routes>
        <Route path="oauth/apple" element={<ErrorPage name="Apple" />} />
        <Route path="oauth/discord" element={<ErrorPage name="Discord" />} />
        <Route path="oauth/facebook" element={<ErrorPage name="Facebook" />} />
        <Route path="oauth/github" element={<ErrorPage name="GitHub" />} />
        <Route path="oauth/google" element={<ErrorPage name="Google" />} />
        <Route path="oauth/linkedin" element={<ErrorPage name="LinkedIn" />} />
        <Route path="oauth/twitter" element={<ErrorPage name="Twitter" />} />
        <Route path="magiclink" element={<$magiclink />} />
      </Routes>
    </Suspense>
  )
}

export default AuthRoutes
