import { useHookstate } from '@hookstate/core'
import { EngineState } from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import React, { Suspense, useEffect } from 'react'
import { AuthService, AuthState } from './AuthService'

export const useAuthenticated = () => {
  const authState = getMutableState(AuthState)
  const userID = useHookstate(authState.user.id).value
  const isAuthenticated = useHookstate(authState.isAuthenticated).value

  useEffect(() => {
    AuthService.doLoginAuto()
    return () => {
      /** (from AuthService.ts) @todo is this necessary if we always require a refresh upon logging out or switching routes? */
      // communicator.destroy()
    }
  }, [])

  useEffect(() => {
    getMutableState(EngineState).userID.set(userID)
  }, [userID])

  return isAuthenticated
}

type Props = {
  children: React.ReactNode
  fallback?: JSX.Element
}

/**
 * Suspend children until the authentication flow is successful
 * @returns
 */
export const Authenticate = ({ children, fallback }: Props) => {
  const authenticated = useAuthenticated()
  if (!authenticated) return fallback ?? <></>
  return <Suspense fallback={fallback}>{children}</Suspense>
}
