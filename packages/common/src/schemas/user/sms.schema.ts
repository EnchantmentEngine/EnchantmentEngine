import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'

export const smsPath = 'sms'
export const smsMethods = ['create'] as const

export const smsDataSchema = Type.Object(
  {
    mobile: Type.String(),
    text: Type.String()
  },
  { $id: 'SmsData', additionalProperties: false }
)
export interface SmsData extends Static<typeof smsDataSchema> {}

export const smsDataValidator = /* @__PURE__ */ getValidator(smsDataSchema, dataValidator)
