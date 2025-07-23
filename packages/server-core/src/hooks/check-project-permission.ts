import { HookContext } from '@feathersjs/feathers'

import { Application } from '../../declarations'
import verifyProjectPermission from './verify-project-permission'

export default (types: string[]) => {
  return async (context: HookContext<Application>) => {
    try {
      await verifyProjectPermission(types)(context)

      return true
    } catch {
      return false
    }
  }
}
