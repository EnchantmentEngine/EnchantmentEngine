import { BadRequest } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import { MessageID, messagePath, MessageType } from '@ir-engine/common/src/schemas/social/message.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from './../../declarations'

/**
 * Checks if the requesting user is the owner of the message
 */
export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { id, params, app } = context
    const loggedInUser = params.user as UserType

    if (!id) {
      throw new BadRequest('Must provide a message ID')
    }

    const match = (await app.service(messagePath).find({
      query: {
        id: id.toString() as MessageID,
        senderId: loggedInUser.id,
        $limit: 1
      }
    })) as Paginated<MessageType>

    if (match.data.length === 0) {
      throw new BadRequest('Message not owned by requesting user')
    }

    return context
  }
}
