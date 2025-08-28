import { createSwaggerServiceOptions } from 'feathers-swagger'

import { botDataSchema, botPatchSchema, botQuerySchema, botSchema } from '@ir-engine/common/src/schemas/bot/bot.schema'

export default createSwaggerServiceOptions({
  schemas: {
    botDataSchema,
    botPatchSchema,
    botQuerySchema,
    botSchema
  },
  docs: {
    description: 'Bot service description',
    securities: ['all']
  }
})
