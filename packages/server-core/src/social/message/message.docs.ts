import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  messageDataSchema,
  messagePatchSchema,
  messageQuerySchema,
  messageSchema
} from '@ir-engine/common/src/schemas/social/message.schema'

export default createSwaggerServiceOptions({
  schemas: {
    messageDataSchema,
    messagePatchSchema,
    messageQuerySchema,
    messageSchema
  },
  docs: {
    description: 'Message service description',
    securities: ['all']
  }
})
