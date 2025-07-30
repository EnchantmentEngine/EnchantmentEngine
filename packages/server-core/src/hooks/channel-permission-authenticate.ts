import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import { channelUserPath, ChannelUserType } from '@ir-engine/common/src/schemas/social/channel-user.schema'
import { channelPath } from '@ir-engine/common/src/schemas/social/channel.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { params, app } = context
    const loggedInUser = params.user as UserType
    const userId = loggedInUser.id
    if (!params.query!.channelId) {
      throw new BadRequest('Must provide a channel ID')
    }
    const channel = await app.service(channelPath).get(params.query!.channelId)
    if (channel == null) {
      throw new BadRequest(`Invalid channel ID: ${params.query.channelId}`)
    }
    const channelUser = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id,
        userId: userId,
        $limit: 1
      }
    })) as Paginated<ChannelUserType>
    if (channelUser.data.length === 0) {
      throw new Forbidden(`You are not a member of channel: ${params.query.channelId}`)
    }
    return context
  }
}
