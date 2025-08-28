import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface WithNavigateTo {
  navigateTo: (path: string, pushToHistory?: boolean) => void
}

interface WithNavigateClose {
  navigateClose: () => void
}

type ButtonType = WithNavigateTo & {}

export type NavigateFuncProps = WithNavigateTo & WithNavigateClose

export interface RouteType {
  path: string
  title: string
  Component: React.ComponentType<any>
  Button?: React.ComponentType<ButtonType>
}
type DirectionType = 1 | -1

export interface NavigationStateType {
  routes: Record<string, RouteType>
}

type NavigationProviderType = NavigationStateType &
  WithNavigateTo &
  WithNavigateClose & {
    current: string
    history: string[]
    direction: DirectionType

    navigateBack: () => void

    togglePath_factory: (path: string) => () => void

    isSidebarOpen: boolean
    hasHistory: boolean
    hasUp: boolean
    first: string
    second: string
  }

export const NavigationState = defineState({
  name: 'NavigationState',
  initial: (): NavigationStateType => ({
    routes: {}
  })
})

export const NavigationService = {
  addRoutes: (routes: RouteType[]) => {
    const state = getMutableState(NavigationState)
    const routesMap = routes.reduce(
      (all, route) => {
        all[route.path] = route
        return all
      },
      {} as Record<string, RouteType>
    )

    state.routes.merge(routesMap)
  },

  addRoute: (route: RouteType) => {
    const state = getMutableState(NavigationState)

    state.routes[route.path].set(route)
  }
}

const useProvider = () => {
  const [history, setHistory] = useState<string[]>([])
  const [direction, setDirection] = useState<DirectionType>(1) // 1 for forward, -1 for backward

  const { routes } = getState(NavigationState)

  const { pathname, search } = useLocation()
  const navigate = useNavigate()

  const [prefix, locationName, current = ''] = useMemo(() => {
    // remove "location" and ":locationName" from path
    const [prefix, locationName, ...rest] = pathname.split('/').filter((val) => val)

    return [prefix, locationName, rest.join('/')]
  }, [pathname])

  const isSidebarOpen = !!current
  const hasHistory = !!history.length
  const [first, second] = current.split('/')
  const up = current.split('/').slice(0, -1).join('/')
  const hasUp = !!up

  const _navigateWithPrefix = (path) => {
    navigate({
      pathname: `/${prefix}/${locationName}/${path}`,
      search
    })
  }

  const addToHistory = (path) => {
    setDirection(1)
    setHistory([...history, path])
  }

  const navigateTo = (path: string, pushToHistory = true): void => {
    if (pushToHistory) {
      addToHistory(current)
    }

    _navigateWithPrefix(path)
  }

  const navigateBack = (): void => {
    setDirection(-1)

    if (!hasHistory) {
      _navigateWithPrefix(up)
      return
    }

    const newHistory = [...history]
    const last = newHistory.pop() || ''

    setHistory(newHistory)
    _navigateWithPrefix(last)
  }

  const navigateClose = () => {
    setDirection(-1)
    setHistory([])
    _navigateWithPrefix('')
  }

  const togglePath_factory = (path) => () => {
    _navigateWithPrefix(current === path ? `` : path)
    setHistory([])
  }

  return {
    navigateTo,
    navigateBack,
    navigateClose,

    togglePath_factory,

    current,
    direction,
    routes,
    history,

    first,
    second,
    hasHistory,
    hasUp,
    isSidebarOpen
  }
}

const Context = React.createContext({} as NavigationProviderType)
const Provider = Context.Provider

export const NavigationProvider = ({ children }) => {
  const state = useProvider()

  return <Provider value={state}>{children}</Provider>
}

export const useNavigationProvider = () => React.useContext(Context)
