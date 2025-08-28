// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'

export const projectInvalidatePath = 'project-invalidate'

export const projectInvalidateMethods = ['patch'] as const

// Schema for updating existing entries
export const projectInvalidatePatchSchema = Type.Object(
  {
    projectName: Type.Optional(Type.String()),
    storageProviderName: Type.Optional(Type.String())
  },
  {
    $id: 'ProjectInvalidatePatch'
  }
)

export interface ProjectInvalidatePatch extends Static<typeof projectInvalidatePatchSchema> {}

export const projectInvalidatePatchValidator = /* @__PURE__ */ getValidator(projectInvalidatePatchSchema, dataValidator)
