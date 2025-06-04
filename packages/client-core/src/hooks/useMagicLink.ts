import { useHookstate } from '@hookstate/core'
import { AuthStrategiesType } from '../common/initialAuthState'
import { AuthService } from '../user/services/AuthService'
import { useAuthSettings } from './useAuthSetting'

export const getRedirectUrl = (redirectUrl?: string) => {
  const currentUrl = new URL(window.location.href)
  const targetUrl = redirectUrl ? new URL(redirectUrl, currentUrl.origin) : currentUrl
  targetUrl.search = currentUrl.search
  return targetUrl.toString()
}

export const useMagicLink = () => {
  const pending = useHookstate(false)
  const sent = useHookstate(false)
  const authSetting = useAuthSettings()

  const handleMagicLink = async (email: string, isSignUp: boolean) => {
    pending.set(true)

    if (!isSignUp) {
      const isExistingEmail = await AuthService.validateUser(email)
      if (!isExistingEmail) {
        pending.set(false)
        return
      }
    }

    try {
      await AuthService.createMagicLink(email, authSetting as AuthStrategiesType, 'email', getRedirectUrl())
    } finally {
      pending.set(false)
    }
  }

  return { pending, handleMagicLink, sent }
}
