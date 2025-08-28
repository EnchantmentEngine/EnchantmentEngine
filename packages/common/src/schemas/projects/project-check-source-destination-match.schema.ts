import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { queryValidator } from '../validators'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const projectCheckSourceDestinationMatchPath = 'project-check-source-destination-match'

export const projectCheckSourceDestinationMatchMethods = ['find'] as const

export const projectCheckSourceDestinationMatchSchema = Type.Object(
  {
    sourceProjectMatchesDestination: Type.Optional(Type.Boolean()),
    projectName: Type.Optional(Type.String()),
    error: Type.Optional(Type.String()),
    text: Type.Optional(Type.String())
  },
  { $id: 'ProjectCheckSourceDestinationMatch', additionalProperties: false }
)

export interface ProjectCheckSourceDestinationMatchType
  extends Static<typeof projectCheckSourceDestinationMatchSchema> {}

export const projectCheckSourceDestinationMatchValidator = /* @__PURE__ */ getValidator(
  projectCheckSourceDestinationMatchSchema,
  queryValidator
)
