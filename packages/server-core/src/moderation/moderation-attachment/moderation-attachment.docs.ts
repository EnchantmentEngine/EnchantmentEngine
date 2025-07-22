import { moderationAttachmentsDataSchema } from '@ir-engine/common/src/schemas/moderation/moderation-attachment.schema'
import { createSwaggerServiceOptions } from 'feathers-swagger'

export default createSwaggerServiceOptions({
  schemas: {
    moderationAttachmentDataSchema: moderationAttachmentsDataSchema
  },
  docs: {
    description: 'Moderation attachment service description',
    securities: ['all']
  }
})
