import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'

export const emailPath = 'email'

export const emailDataSchema = Type.Object(
  {
    from: Type.String(),
    to: Type.String(),
    subject: Type.String(),
    html: Type.String(),
    attachments: Type.Optional(Type.Array(Type.Record(Type.String(), Type.Any())))
  },
  { $id: 'EmailData', additionalProperties: false }
)
export interface EmailData extends Static<typeof emailDataSchema> {}

export const emailDataValidator = /* @__PURE__ */ getValidator(emailDataSchema, dataValidator)
