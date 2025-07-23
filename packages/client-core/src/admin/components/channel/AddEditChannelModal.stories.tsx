import { ChannelType } from '@ir-engine/common/src/schemas/social/channel.schema'
import AddEditChannelModal from './AddEditChannelModal'

const argTypes = {
  'channel.name': {
    control: 'text',
    description: 'Name of the channel'
  },
  'channel.instanceId': {
    control: 'text',
    description: 'Instance ID of the channel'
  },
  'channel.createdAt': {
    control: 'date',
    description: 'Creation date of the channel'
  },
  'channel.updatedAt': {
    control: 'date',
    description: 'Last update date of the channel'
  }
  // Add more controls as needed for other properties
}

export default {
  title: 'Client/AddEditChannelModal',
  component: AddEditChannelModal,
  parameters: {
    componentSubtitle: 'AddEditChannelModal',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    channel: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'General',
      instanceId: '123e4567-e89b-12d3-a456-426614174001',
      channelUsers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as ChannelType
  }
}
