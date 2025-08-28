import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  botCommandDataSchema,
  botCommandPatchSchema,
  botCommandQuerySchema,
  botCommandSchema
} from '@ir-engine/common/src/schemas/bot/bot-command.schema'

export default createSwaggerServiceOptions({
  schemas: {
    botCommandDataSchema,
    botCommandPatchSchema,
    botCommandQuerySchema,
    botCommandSchema
  },
  docs: {
    description: 'Bot command service description',
    securities: ['all']
  }
})
