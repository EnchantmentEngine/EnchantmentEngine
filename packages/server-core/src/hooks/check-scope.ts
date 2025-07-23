import { HookContext } from '@feathersjs/feathers'

import { Application } from '../../declarations'
import verifyScope from './verify-scope'

export default (currentType: string, scopeToVerify: string) => {
  return async (context: HookContext<Application>) => {
    try {
      await verifyScope(currentType, scopeToVerify)(context)

      return true
    } catch {
      return false
    }
  }
}
