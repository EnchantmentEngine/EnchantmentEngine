// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const uploadScriptPath = 'upload-script'

export const uploadScriptMethods = ['create'] as const

// Main data model schema
export const uploadScriptSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    })
  },
  { $id: 'UploadScript', additionalProperties: false }
)
export interface UploadScriptType extends Static<typeof uploadScriptSchema> {}

// Schema for creating new entries
export const uploadScriptDataSchema = Type.Object(
  {
    args: Type.Object({
      path: Type.String(),
      name: Type.Optional(Type.String()),
      project: Type.String()
    })
  },
  { $id: 'UploadScriptData' }
)
export interface UploadScriptData extends Static<typeof uploadScriptDataSchema> {}

// Schema for allowed query properties
export const uploadScriptQueryProperties = Type.Pick(uploadScriptSchema, ['id'])
export const uploadScriptQuerySchema = Type.Intersect(
  [
    querySyntax(uploadScriptQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UploadScriptQuery extends Static<typeof uploadScriptQuerySchema> {}

// Validators
export const uploadScriptValidator = getValidator(uploadScriptSchema, dataValidator)
export const uploadScriptDataValidator = getValidator(uploadScriptDataSchema, dataValidator)
export const uploadScriptQueryValidator = getValidator(uploadScriptQuerySchema, queryValidator)
