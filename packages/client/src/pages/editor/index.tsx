import { t } from 'i18next'
import React, { Suspense, useEffect } from 'react'

import '../styles.scss'

import '../../engine'

import { NotificationSnackbar } from '@ir-engine/client-core/src/common/services/NotificationService'
import { RouterState } from '@ir-engine/client-core/src/common/services/RouterService'
import { useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import Debug from '@ir-engine/client-core/src/components/Debug'
import { LoadWebappInjection } from '@ir-engine/client-core/src/components/LoadWebappInjection'
import { Authenticate } from '@ir-engine/client-core/src/user/services/Authenticate'
import { useFind } from '@ir-engine/common'
import { ScopeType, scopePath } from '@ir-engine/common/src/schema.type.module'
import { EngineState } from '@ir-engine/ecs'
import { EditorPage } from '@ir-engine/editor/src/pages/EditorPage'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { Route, Routes, useLocation } from 'react-router-dom'

export const EditorRouter = () => {
  const location = useLocation()
  const scopeQuery = useFind(scopePath, {
    query: {
      userId: getState(EngineState).userID,
      type: 'editor:write' as ScopeType
    }
  })

  const isAuthorized = useHookstate<boolean | null>(null)

  useEffect(() => {
    if (scopeQuery.status !== 'success') return
    if (!scopeQuery.data.length) {
      isAuthorized.set(false)
      RouterState.navigate('/', { redirectUrl: location.pathname })
    } else isAuthorized.set(true)
  }, [scopeQuery.data, scopeQuery.status])

  if (!isAuthorized.value) return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.auth')} />

  return (
    <Suspense
      fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingStudio')} />}
    >
      <Routes>
        <Route path="*" element={<EditorPage />} />
      </Routes>
    </Suspense>
  )
}

const EditorProtectedRoutes = () => {
  useEffect(() => {
    getMutableState(EngineState).isEditor.set(true)
    getMutableState(EngineState).isEditing.set(true)
  }, [])

  useThemeProvider()

  return (
    <>
      <Authenticate>
        <NotificationSnackbar />
        <LoadWebappInjection>
          <EditorRouter />
        </LoadWebappInjection>
      </Authenticate>
      <Debug />
    </>
  )
}

export default EditorProtectedRoutes
