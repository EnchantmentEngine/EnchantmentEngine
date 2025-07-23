// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'

export const projectBranchesPath = 'project-branches'

export const projectBranchesMethods = ['get'] as const

export const projectBranchSchema = Type.Object(
  {
    name: Type.String(),
    branchType: Type.String()
  },
  { $id: 'ProjectBranch', additionalProperties: false }
)
export interface ProjectBranchType extends Static<typeof projectBranchSchema> {}

// Main data model schema
export const projectBranchesSchema = Type.Object(
  {
    branches: Type.Union([
      Type.Array(Type.Ref(projectBranchSchema)),
      Type.Object({
        error: Type.String(),
        text: Type.String()
      })
    ])
  },
  { $id: 'ProjectBranches', additionalProperties: false }
)
export interface ProjectBranchesType extends Static<typeof projectBranchesSchema> {}

export const projectBranchValidator = /* @__PURE__ */ getValidator(projectBranchSchema, dataValidator)
export const projectBranchesValidator = /* @__PURE__ */ getValidator(projectBranchesSchema, dataValidator)
