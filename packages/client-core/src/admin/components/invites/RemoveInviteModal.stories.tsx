import { InviteType } from '@ir-engine/common/src/schemas/social/invite.schema'
import RemoveInviteModal from './RemoveInviteModal'

export default {
  title: 'Client/RemoveInviteModal',
  component: RemoveInviteModal,
  parameters: {
    componentSubtitle: 'RemoveInviteModal',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    invites: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        token: 'sample-token',
        identityProviderType: 'google',
        passcode: '123456',
        targetObjectId: '123e4567-e89b-12d3-a456-426614174001',
        deleteOnUse: false,
        makeAdmin: true,
        spawnType: 'default',
        spawnDetails: null,
        timed: false,
        userId: '123e4567-e89b-12d3-a456-426614174002',
        inviteeId: '123e4567-e89b-12d3-a456-426614174003',
        inviteType: 'friend',
        user: null,
        invitee: null,
        channelName: 'general',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ] as unknown[] as InviteType[]
  }
}
