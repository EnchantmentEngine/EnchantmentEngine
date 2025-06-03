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
  const magicLinkSent = useHookstate(false)
  const authSetting = useAuthSettings()

  const handleMagicLink = async (email: string, isSignUp: boolean) => {
    if (!isSignUp) {
      const isExistingEmail = await AuthService.validateUser(email)
      if (!isExistingEmail) {
        magicLinkSent.set(false)
        return
      }
    }

    try {
      await AuthService.createMagicLink(email, authSetting as AuthStrategiesType, 'email', getRedirectUrl())
    } catch (e) {
      magicLinkSent.set(false)
    }

    magicLinkSent.set(true)
  }
  return { magicLinkSent, handleMagicLink }
}
