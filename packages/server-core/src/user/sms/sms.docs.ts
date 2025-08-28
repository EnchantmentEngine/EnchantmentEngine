import { createSwaggerServiceOptions } from 'feathers-swagger'

import { smsDataSchema } from '@ir-engine/common/src/schemas/user/sms.schema'

export default createSwaggerServiceOptions({
  schemas: { smsDataSchema },
  docs: {
    description: 'Sms service description',
    securities: ['all']
  }
})
