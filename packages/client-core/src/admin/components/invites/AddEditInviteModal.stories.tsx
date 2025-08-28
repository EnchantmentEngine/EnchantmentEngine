import { InviteType } from '@ir-engine/common/src/schemas/social/invite.schema'
import AddEditInviteModal from './AddEditInviteModal'

const argTypes = {
  'invite.token': {
    control: 'text',
    description: 'Token for the invite'
  },
  'invite.identityProviderType': {
    control: 'select',
    options: ['email', 'github', 'google'], // Replace with actual options
    description: 'Type of identity provider'
  },
  'invite.passcode': {
    control: 'text',
    description: 'Passcode for the invite'
  },
  'invite.deleteOnUse': {
    control: 'boolean',
    description: 'Delete invite after use'
  },
  'invite.makeAdmin': {
    control: 'boolean',
    description: 'Grant admin privileges'
  },
  'invite.spawnType': {
    control: 'text',
    description: 'Type of spawn'
  },
  'invite.spawnDetails.inviteCode': {
    control: 'text',
    description: 'Invite code for spawn details'
  },
  'invite.spawnDetails.spawnPoint': {
    control: 'text',
    description: 'Spawn point'
  },
  'invite.spawnDetails.spectate': {
    control: 'text',
    description: 'Spectate option'
  },
  'invite.timed': {
    control: 'boolean',
    description: 'Is the invite timed?'
  },
  'invite.channelName': {
    control: 'text',
    description: 'Name of the channel'
  },
  'invite.startTime': {
    control: 'date',
    description: 'Start time of the invite'
  },
  'invite.endTime': {
    control: 'date',
    description: 'End time of the invite'
  }
}
export default {
  title: 'Client/AddEditInviteModal',
  component: AddEditInviteModal,
  parameters: {
    componentSubtitle: 'AddEditInviteModal',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    invite: {
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
    } as unknown as InviteType
  }
}
