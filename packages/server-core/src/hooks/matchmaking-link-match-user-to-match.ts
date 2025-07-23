import { Hook, HookContext } from '@feathersjs/feathers'

import { matchInstancePath } from '@ir-engine/common/src/schemas/matchmaking/match-instance.schema'
import { matchUserPath } from '@ir-engine/common/src/schemas/matchmaking/match-user.schema'
import { instanceAuthorizedUserPath } from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'
import { InstanceID } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { MatchTicketAssignmentType } from '@ir-engine/matchmaking/src/match-ticket-assignment.schema'

import logger from '../ServerLogger'

interface AssignmentResponse extends MatchTicketAssignmentType {
  instanceId: InstanceID
  locationName: string
}

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const app = context.app
    const result: AssignmentResponse = context.result
    const userId = context.params[identityProviderPath]?.userId

    if (!result.connection) {
      // if connection is empty, match is not found yet
      return context
    }

    const matchUserResult = await app.service(matchUserPath).find({
      query: {
        ticketId: context.id,
        $limit: 1
      }
    })

    if (!matchUserResult.data.length) {
      logger.info('match user not found?!')
      return context
    }

    const matchUser = matchUserResult.data[0]
    await app.service(matchUserPath).patch(matchUser.id, {
      connection: result.connection
    })

    let [matchServerInstance] = await app.service(matchInstancePath).find({
      query: {
        connection: result.connection
      }
    })

    if (!matchServerInstance) {
      // try to create server instance, ignore error and try to search again, possibly someone just created same server
      try {
        matchServerInstance = await app.service(matchInstancePath).create({
          connection: result.connection,
          gameMode: matchUser.gameMode
        })
      } catch (e) {
        logger.error(`Failed to create new ${matchInstancePath}`)
        const isConnectionDuplicateError =
          e.errors?.[0]?.type === 'unique violation' && e.errors?.[0]?.path === 'connection'
        if (!isConnectionDuplicateError) {
          // ignore only duplicate error
          throw e
        }
        logger.warn('^-- Server instance probably exists but not provisioned: ' + matchServerInstance)
      }
    } else {
      logger.info('Server instance probably exists but not provisioned: ' + matchServerInstance)
    }

    if (!matchServerInstance?.instanceServer) {
      for (let i = 0; i < 20 && !matchServerInstance?.instanceServer; i++) {
        // retry search
        await new Promise((resolve) => setTimeout(resolve, 10))
        matchServerInstance = (
          await app.service(matchInstancePath).find({
            query: {
              connection: result.connection
            }
          })
        )[0]
      }
    }
    if (!matchServerInstance?.instanceServer) {
      // say that no connection yet, on next query it will have instanceServer and same connection
      logger.info('Failed to find provisioned server. Need to retry again.')
      result.connection = ''
      return context
    }

    // add user to server instance
    const existingInstanceAuthorizedUser = await app.service(instanceAuthorizedUserPath).find({
      query: {
        userId: userId,
        instanceId: matchServerInstance.instanceServer,
        $limit: 0
      }
    })
    if (existingInstanceAuthorizedUser.total === 0) {
      await app.service(instanceAuthorizedUserPath).create({
        userId: userId,
        instanceId: matchServerInstance.instanceServer
      })
    }

    result.instanceId = matchServerInstance.instanceServer
    result.locationName = 'game-' + matchServerInstance.gameMode

    return context
  }
}
