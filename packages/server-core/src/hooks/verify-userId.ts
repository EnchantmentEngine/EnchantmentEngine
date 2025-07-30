import { NotAuthenticated } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'

export default () => {
  return async (context: HookContext<Application>) => {
    const loggedInUser = context.params.user as UserType
    if (!loggedInUser || !loggedInUser.id) throw new NotAuthenticated('No logged in user')

    return context
  }
}
