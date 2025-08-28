import { SnackbarKey, SnackbarProvider, VariantType } from 'notistack'
import React, { CSSProperties, Fragment, useEffect, useRef } from 'react'

import multiLogger from '@ir-engine/common/src/logger'
import { defineState, getState, useMutableState } from '@ir-engine/hyperflux'

const logger = multiLogger.child({ component: 'client-core:Notification' })

export const NotificationState = defineState({
  name: 'ee.client.NotificationState',
  initial: {
    snackbar: null as SnackbarProvider | null | undefined
  }
})

export type NotificationOptions = {
  variant: VariantType // 'default' | 'error' | 'success' | 'warning' | 'info'
  actionType?: keyof typeof NotificationActions
  persist?: boolean
  style?: CSSProperties
  hideIconVariant?: boolean
  autoHideDuration?: number
}

export const defaultAction = (key: SnackbarKey, content?: React.ReactNode) => {
  return <Fragment>{content}</Fragment>
}
export const inviteActions = (key: SnackbarKey, content?: React.ReactNode) => {
  return <Fragment>{content}</Fragment>
}

export const NotificationActions = {
  default: defaultAction,
  invite: inviteActions
}

export const NotificationService = {
  dispatchNotify(message: React.ReactNode, options: NotificationOptions) {
    if (options?.variant === 'error') {
      logger.error(new Error(message!.toString()))
    }

    const state = getState(NotificationState)
    return state.snackbar?.enqueueSnackbar(message, {
      variant: options.variant,
      action: NotificationActions[options.actionType ?? 'default'],
      persist: options.persist,
      style: options.style,
      hideIconVariant: options.hideIconVariant,
      autoHideDuration: options.autoHideDuration ?? 5000
    })
  },
  closeNotification(key?: SnackbarKey) {
    const state = getState(NotificationState)
    state.snackbar?.closeSnackbar(key)
  }
}

export const NotificationSnackbar = (props: { style?: CSSProperties }) => {
  const notistackRef = useRef<SnackbarProvider>()
  const notificationstate = useMutableState(NotificationState)

  useEffect(() => {
    notificationstate.snackbar.set(notistackRef.current)
  }, [notistackRef.current])

  return (
    <SnackbarProvider
      ref={notistackRef as any}
      maxSnack={7}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      action={defaultAction}
      style={props.style}
    />
  )
}
