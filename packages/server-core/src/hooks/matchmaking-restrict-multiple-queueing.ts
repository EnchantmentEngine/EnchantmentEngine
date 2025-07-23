import { BadRequest } from '@feathersjs/errors'
import { Hook, HookContext } from '@feathersjs/feathers'

import { matchUserPath } from '@ir-engine/common/src/schemas/matchmaking/match-user.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

/**
 * prevent user to join new search game more then once at time
 */
export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, params } = context
    const loggedInUser = params.user as UserType
    const matchUserResult = await app.service(matchUserPath).find({
      query: {
        userId: loggedInUser.id,
        $limit: 1
      }
    })

    if (matchUserResult.data.length) {
      throw new BadRequest('User already queued')
    }

    return context
  }
}
