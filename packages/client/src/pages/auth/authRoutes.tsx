import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import AuthMagicLink from '@ir-engine/client-core/src/user/oauth/AuthMagicLink'
import AuthPage from '@ir-engine/client-core/src/user/oauth/AuthPage'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const AuthRoutes = () => {
  return (
    <Suspense fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingAuth')} />}>
      <Routes>
        <Route path="oauth/apple" element={<AuthPage name="Apple" />} />
        <Route path="oauth/discord" element={<AuthPage name="Discord" />} />
        <Route path="oauth/facebook" element={<AuthPage name="Facebook" />} />
        <Route path="oauth/github" element={<AuthPage name="GitHub" />} />
        <Route path="oauth/google" element={<AuthPage name="Google" />} />
        <Route path="oauth/linkedin" element={<AuthPage name="LinkedIn" />} />
        <Route path="oauth/twitter" element={<AuthPage name="Twitter" />} />
        <Route path="magiclink" element={<AuthMagicLink />} />
      </Routes>
    </Suspense>
  )
}

export default AuthRoutes
