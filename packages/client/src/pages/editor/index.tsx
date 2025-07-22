import { t } from 'i18next'
import React, { Suspense, useEffect } from 'react'

import '../../engine'

import { RouterState } from '@ir-engine/client-core/src/common/services/RouterService'
import Debug from '@ir-engine/client-core/src/components/Debug'
import { useFind } from '@ir-engine/common'
import { ScopeType, scopePath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import { EditorPage, useStudioEditor } from '@ir-engine/editor/src/pages/EditorPage'
import { useHookstate } from '@ir-engine/hyperflux'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { Route, Routes, useLocation } from 'react-router-dom'

export const EditorRouter = () => {
  const ready = useStudioEditor()

  if (!ready) return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingStudio')} />

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
  const location = useLocation()
  const scopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.userID,
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
    <>
      <EditorRouter />
      <Debug />
    </>
  )
}

export default EditorProtectedRoutes
