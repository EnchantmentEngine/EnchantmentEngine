import React from 'react'

import { defineState } from '@ir-engine/hyperflux'

export type AdminRouteStateType = {
  name: string
  scope: string | string[]
  redirect?: string
  component: React.LazyExoticComponent<() => JSX.Element>
  access: boolean
  icon: JSX.Element
}

export const AllowedAdminRoutesState = defineState({
  name: 'AllowedAdminRoutesState',
  initial: {} as Record<string, AdminRouteStateType>
})
