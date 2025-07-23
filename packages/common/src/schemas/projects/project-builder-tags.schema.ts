// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'

export const projectBuilderTagsPath = 'project-builder-tags'

export const projectBuilderTagsMethods = ['find'] as const

// Main data model schema
export const projectBuilderTagsSchema = Type.Object(
  {
    tag: Type.String(),
    commitSHA: Type.String(),
    engineVersion: Type.String(),
    pushedAt: Type.String()
  },
  { $id: 'ProjectBuilderTags', additionalProperties: false }
)
export interface ProjectBuilderTagsType extends Static<typeof projectBuilderTagsSchema> {}

export const projectBuilderTagsValidator = /* @__PURE__ */ getValidator(projectBuilderTagsSchema, dataValidator)
