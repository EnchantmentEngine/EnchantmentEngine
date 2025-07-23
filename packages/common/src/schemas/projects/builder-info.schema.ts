// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'

export const builderInfoPath = 'builder-info'

export const builderInfoMethods = ['get'] as const

// Main data model schema
export const builderInfoSchema = Type.Object(
  {
    engineVersion: Type.String(),
    engineCommit: Type.String()
  },
  { $id: 'BuilderInfo', additionalProperties: false }
)
export interface BuilderInfoType extends Static<typeof builderInfoSchema> {}

export const builderInfoValidator = /* @__PURE__ */ getValidator(builderInfoSchema, dataValidator)
