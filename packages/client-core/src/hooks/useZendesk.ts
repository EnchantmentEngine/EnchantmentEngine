import { useMutation } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { zendeskPath } from '@ir-engine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { AuthState } from '../user/services/AuthService'

declare global {
  interface Window {
    zE?: (...args: any) => void
  }
}

export const useZendesk = () => {
  const zendeskMutation = useMutation(zendeskPath)
  const user = getMutableState(AuthState).user
  const authenticated = useHookstate(false)
  const initialized = useHookstate(() => {
    const zendeskScript = document.getElementById(`ze-snippet`) as HTMLScriptElement
    return !!zendeskScript
  })
  const isWidgetVisible = useHookstate(false)

  const authenticateUser = () => {
    if (authenticated.value || config.client.zendesk.authenticationEnabled !== 'true') return

    window.zE?.('messenger', 'loginUser', function (callback: any) {
      zendeskMutation.create().then(async (token) => {
        authenticated.set(true)
        await callback(token)
      })
    })
  }

  const initialize = () => {
    if (initialized.value || !config.client.zendesk.key) return
    const script = document.createElement('script')
    script.id = 'ze-snippet'
    script.async = true
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${config.client.zendesk.key}`
    document.body.appendChild(script)

    script.addEventListener('load', () => {
      if ('zE' in window) {
        initialized.set(true)
        hideWidget()
        authenticateUser()
      }
      window.zE?.('messenger:on', 'close', () => {
        hideWidget()
      })
      window.zE?.('messenger:on', 'open', function () {
        showWidget()
      })
    })
  }

  useEffect(() => {
    if (config.client.zendesk.enabled !== 'true') return

    if (!user.isGuest.value && !initialized.value) {
      initialize()
    } else if (!user.isGuest.value && initialized.value) {
      authenticateUser()
    } else if (user.isGuest.value && initialized.value) {
      closeChat()
      window.zE?.('messenger', 'logoutUser')
    }
  }, [user.value])

  const hideWidget = () => {
    if (!initialized.value) return
    window.zE?.('messenger', 'hide')
    isWidgetVisible.set(false)
  }
  const showWidget = () => {
    if (!initialized.value) return
    window.zE?.('messenger', 'show')
    isWidgetVisible.set(true)
  }
  const openChat = () => {
    if (!initialized.value) return
    window.zE?.('messenger', 'open')
  }

  const closeChat = () => {
    if (!initialized.value) return
    window.zE?.('messenger', 'close')
  }

  return {
    initialized: initialized.value,
    isWidgetVisible: isWidgetVisible.value,
    hideWidget,
    showWidget,
    openChat,
    closeChat
  }
}
