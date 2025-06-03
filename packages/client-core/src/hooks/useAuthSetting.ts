import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import { AuthenticationConfig } from '@ir-engine/server-core/src/appconfig'

export const useAuthSettings = () => {
  const { data: authSetting } = useEngineSetting<AuthenticationConfig>('authentication')
  const strategies = authSetting?.authStrategies as unknown as { [key: string]: boolean }[]
  return strategies.reduce((acc, curr) => ({ ...acc, [Object.keys(curr)[0]]: Object.values(curr)[0] }), {})
}
