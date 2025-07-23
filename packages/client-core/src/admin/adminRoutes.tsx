import React, { lazy, useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'

import { ThemeState } from '@ir-engine/client-core/src/common/services/ThemeService'
import { getMutableState, getState, NO_PROXY, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { AuthService, AuthState } from '../user/services/AuthService'
import { AllowedAdminRoutesState } from './AllowedAdminRoutesState'

import '@ir-engine/engine/src/EngineModule'

import { useTranslation } from 'react-i18next'
import { HiMiniMoon, HiMiniSun } from 'react-icons/hi2'

import { useFind } from '@ir-engine/common'
import { identityProviderPath, scopePath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import { Button, Tooltip } from '@ir-engine/ui'
import PopupMenu from '@ir-engine/ui/src/primitives/tailwind/PopupMenu'
import { twMerge } from 'tailwind-merge'
import { RouterState } from '../common/services/RouterService'
import { DefaultAdminRoutes } from './DefaultAdminRoutes'
import ActionButton from './components/ActionButton'

const $allowed = lazy(() => import('@ir-engine/client-core/src/admin/allowedRoutes'))

const AdminTopBar = () => {
  const { t } = useTranslation()
  const theme = useHookstate(getMutableState(ThemeState)).theme
  const identityProvidersQuery = useFind(identityProviderPath)
  const selfUser = getState(AuthState).user
  const tooltip = `${selfUser.name} (${identityProvidersQuery.data
    .map((item) => `${item.type}: ${item.accountIdentifier}`)
    .join(', ')}) ${selfUser.id}`

  const toggleTheme = () => {
    const currentTheme = getState(ThemeState).theme
    ThemeState.setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="pointer-events-auto flex h-16 w-full items-center justify-between px-8 py-4">
      <a href="/">
        <img
          src="static/app_logo.svg"
          alt="Napster Engine Logo"
          className={`h-7 w-7${theme.value === 'light' ? ' invert' : ''}`}
        />
      </a>

      <div className="pointer-events-auto flex gap-4">
        <ActionButton onClick={toggleTheme} icon={theme.value === 'light' ? HiMiniMoon : HiMiniSun} />
        <Tooltip content={tooltip}>
          <Button size="sm" onClick={() => AuthService.logoutUser()}>
            {t('admin:components.common.logOut')}
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

const AdminSideBar = () => {
  const allowedRoutes = useHookstate(getMutableState(AllowedAdminRoutesState)).get(NO_PROXY)

  const location = useLocation()
  const { pathname: fullPathName } = location
  const { t } = useTranslation()

  const relativePath = fullPathName.split('/').slice(2).join('/')

  useEffect(() => {
    console.log('allowedRoutes', allowedRoutes)
    console.log('relativePath', relativePath)
  }, [])

  return (
    <aside className="col-span-4 mx-8 overflow-y-auto overflow-x-hidden rounded-2xl px-2 py-4 lg:col-span-3 2xl:col-span-2">
      <ul className="space-y-2">
        {Object.entries(allowedRoutes)
          .filter(([_, sidebarItem]) => sidebarItem.access)
          .map(([path, sidebarItem], index) => {
            return (
              <li key={index}>
                <Link to={path}>
                  <button
                    className={twMerge(
                      'flex w-full items-center justify-start gap-x-1 rounded-xl bg-surface-1 px-2 py-3 font-medium text-text-secondary hover:bg-ui-hover-quadrary hover:text-text-primary',
                      relativePath === path ? 'bg-ui-select-background font-semibold text-text-primary' : ''
                    )}
                  >
                    {sidebarItem.icon}
                    {t(sidebarItem.name)}
                  </button>
                </Link>
              </li>
            )
          })}
      </ul>
    </aside>
  )
}

const AdminRoutes = () => {
  const location = useLocation()
  const scopeQuery = useFind(scopePath, { query: { userId: Engine.instance.userID, paginate: false } })

  const allowedRoutes = useMutableState(AllowedAdminRoutesState)

  useEffect(() => {
    allowedRoutes.set(DefaultAdminRoutes)
  }, [])

  useEffect(() => {
    for (const [route, state] of Object.entries(allowedRoutes)) {
      const routeScope = state.scope.value
      const hasScope =
        routeScope === '' ||
        scopeQuery.data.find((scope) => {
          const [scopeKey, type] = scope.type.split(':')
          return Array.isArray(routeScope) ? routeScope.includes(scopeKey) : scopeKey === routeScope
        })
      state.access.set(!!hasScope)
    }
  }, [scopeQuery.data])

  useEffect(() => {
    if (scopeQuery.status !== 'success') return

    if (!scopeQuery.data.find((scope) => scope.type === 'admin:admin')) {
      RouterState.navigate('/', { redirectUrl: location.pathname })
    }
  }, [scopeQuery.data])

  if (!scopeQuery.data.find((scope) => scope.type === 'admin:admin')) {
    return <></>
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminTopBar />
      <main className="pointer-events-auto grid h-[calc(100vh_-_88px_-_4rem)] grid-cols-12 gap-1.5">
        <AdminSideBar />
        <div className="col-span-8 h-full w-full overflow-x-auto overflow-y-auto px-3 lg:col-span-9 2xl:col-span-10">
          <Routes>
            <Route path="/*" element={<$allowed />} />
          </Routes>
        </div>
        <PopupMenu />
      </main>
    </div>
  )
}

export default AdminRoutes
