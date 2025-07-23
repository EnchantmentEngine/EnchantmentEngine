import { BadRequest } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import { invitePath } from '@ir-engine/common/src/schemas/social/invite.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    let inviteIdentityProviderUser
    // Getting logged-in user and attaching owner of user
    const { id, params, app } = context
    const loggedInUser = params.user as UserType
    const invite = await app.service(invitePath).get(id!)
    if (invite == null) {
      throw new BadRequest('Invalid invite ID')
    }
    if (invite.identityProviderType != null) {
      const inviteeIdentityProviderResult = (await app.service(identityProviderPath).find({
        query: {
          type: invite.identityProviderType,
          token: invite.token
        }
      })) as Paginated<IdentityProviderType>
      if (inviteeIdentityProviderResult.total > 0) {
        inviteIdentityProviderUser = inviteeIdentityProviderResult.data[0].userId
      }
    }
    if (
      invite.userId !== loggedInUser?.id &&
      invite.inviteeId !== loggedInUser?.id &&
      inviteIdentityProviderUser !== loggedInUser?.id
    ) {
      throw new BadRequest('Not the sender or recipient of this invite')
    }
    return context
  }
}
