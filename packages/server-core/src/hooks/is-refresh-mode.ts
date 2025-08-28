import appConfig from '@ir-engine/server-core/src/appconfig'

import { HookContext } from '../../declarations'

const { forceRefresh } = appConfig.db
const { testEnabled } = appConfig
const prepareDb = process.env.PREPARE_DATABASE === 'true'

export const isRefreshMode = forceRefresh || testEnabled || prepareDb

/**
 * Hook used to check if server is currently running in refresh mode. i.e. reinit, prepare db or test.
 * @param context
 */
export const checkRefreshMode = () => {
  return (context: HookContext) => {
    return isRefreshMode ? true : false
  }
}
