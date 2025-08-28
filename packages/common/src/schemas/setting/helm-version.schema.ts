// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator } from '@feathersjs/typebox'
import { queryValidator } from '@ir-engine/common/src/schemas/validators'

export const helmVersionPath = 'helm-version'

export const helmVersionMethods = ['find'] as const

// Main data model schema

export const helmVersionQuerySchema = Type.Object(
  {
    action: Type.String({ enum: ['main', 'builder'], description: 'The type of Helm chart to fetch versions for' })
  },
  { additionalProperties: false }
)
export interface HelmVersionQuery extends Static<typeof helmVersionQuerySchema> {}

export const helmVersionQueryValidator = /* @__PURE__ */ getValidator(helmVersionQuerySchema, queryValidator)
