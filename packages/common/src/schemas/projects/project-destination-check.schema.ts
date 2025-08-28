import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { queryValidator } from '../validators'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const projectDestinationCheckPath = 'project-destination-check'

export const projectDestinationCheckMethods = ['get'] as const

// TODO: Once typebox is upgraded to version 0.28.0, use this schema
// export const projectDestinationCheckSchema = Type.Union(
//   [
//     Type.Object({
//       destinationValid: Type.Boolean(),
//       projectName: Type.String(),
//       repoEmpty: Type.Boolean()
//     }),
//     Type.Object({
//       error: Type.String(),
//       text: Type.String()
//     })
//   ],
//   { $id: 'ProjectDestinationCheck', additionalProperties: false }
// )

// Main data model schema
export const projectDestinationCheckSchema = Type.Object(
  {
    destinationValid: Type.Optional(Type.Boolean()),
    projectName: Type.Optional(Type.String()),
    repoEmpty: Type.Optional(Type.Boolean()),
    error: Type.Optional(Type.String()),
    text: Type.Optional(Type.String())
  },
  { $id: 'ProjectDestinationCheck', additionalProperties: false }
)

export interface ProjectDestinationCheckType extends Static<typeof projectDestinationCheckSchema> {}

export const projectDestinationCheckValidator = /* @__PURE__ */ getValidator(
  projectDestinationCheckSchema,
  queryValidator
)
