import { Hook, HookContext } from '@feathersjs/feathers'

import { matchUserPath } from '@ir-engine/common/src/schemas/matchmaking/match-user.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result, data, params } = context
    const loggedInUser = params.user as UserType
    await app.service(matchUserPath).create({
      ticketId: result.id,
      gameMode: data.gameMode,
      userId: loggedInUser.id
    })

    return context
  }
}
