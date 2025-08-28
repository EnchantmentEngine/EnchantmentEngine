import { ModerationType } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import { ModerationDetail } from './ModerationDetail'
const argTypes = {
  'selectedModeration.type': {
    control: 'select',
    options: ['user', 'location'],
    description: 'Type of moderation'
  },
  'selectedModeration.abuseReason': {
    control: 'select',
    options: ['spam', 'harassment', 'cheating'], // Replace with actual abuse reasons
    description: 'Reason for the report'
  },
  'selectedModeration.ipAddress': {
    control: 'text',
    description: 'IP address of the reported user'
  },
  'selectedModeration.reportDetails': {
    control: 'text',
    description: 'Details of the report'
  },
  'selectedModeration.status': {
    control: 'select',
    options: ['open', 'resolved'],
    description: 'Status of the moderation'
  },
  'selectedModeration.reportedAt': {
    control: 'date',
    description: 'Date and time when the report was made'
  }
  // Add more controls as needed for other properties
}

export default {
  title: 'Client/ModerationDetail',
  component: ModerationDetail,
  parameters: {
    componentSubtitle: 'ModerationDetail',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    report: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'user',
      abuseReason: 'spam',
      reportedUserId: '123e4567-e89b-12d3-a456-426614174001',
      reportedLocationId: '123e4567-e89b-12d3-a456-426614174002',
      ipAddress: '192.168.1.1',
      reportDetails: 'User was spamming in the chat.',
      status: 'open',
      reportedAt: new Date().toISOString(),
      createdBy: '123e4567-e89b-12d3-a456-426614174003',
      updatedBy: '123e4567-e89b-12d3-a456-426614174004',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as ModerationType
  }
}
