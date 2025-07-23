import { useHookstate } from '@hookstate/core'
import { useFind } from '@ir-engine/common'
import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import { identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import { AuthenticationConfig } from '@ir-engine/server-core/src/appconfig'
import { useEffect } from 'react'
import { initialAuthState, initialOAuthConnectedState } from '../common/initialAuthState'

export const useAuthSettings = () => {
  const { data: authSetting } = useEngineSetting<AuthenticationConfig>('authentication')
  //authStrategies is typed as string[], yet when printed the result is an array of objects.
  const strategies = authSetting?.authStrategies as unknown as { [key: string]: boolean }[]

  if (!strategies) return initialAuthState

  return strategies.reduce(
    (acc, curr) => ({ ...acc, [Object.keys(curr)[0]]: Object.values(curr)[0] }),
    initialAuthState
  )
}

export const useOAuthState = () => {
  const prodviderQuery = useFind(identityProviderPath)
  const oauthConnectedState = useHookstate(Object.assign({}, initialOAuthConnectedState))

  useEffect(() => {
    const { data } = prodviderQuery
    if (!data) return

    for (const ip of data) {
      oauthConnectedState.merge({ [ip.type]: true })
    }
  }, [prodviderQuery.data])

  return oauthConnectedState
}
