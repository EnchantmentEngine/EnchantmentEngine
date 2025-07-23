import { NotAuthenticated } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { UserID, UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'
import verifyScope from './verify-scope'

export default (currentType: string, scopeToVerify: string) => {
  return async (context: HookContext<Application>) => {
    const loggedInUser = context.params.user as UserType
    const queryUserID = context.params.query?.userId as UserID
    if (!loggedInUser || !loggedInUser.id) throw new NotAuthenticated('No logged in user')
    // allow self
    if (queryUserID && queryUserID === loggedInUser.id) return context
    return verifyScope(currentType, scopeToVerify)(context)
  }
}
