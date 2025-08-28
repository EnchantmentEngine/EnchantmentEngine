// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { InviteCode, UserID, userSchema } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const projectPermissionPath = 'project-permission'

export const projectPermissionMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const projectPermissionSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    projectId: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>(),
    createdBy: TypedString<UserID>({
      format: 'uuid'
    }),
    type: Type.String(),
    user: Type.Ref(userSchema),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ProjectPermission', additionalProperties: false }
)
export interface ProjectPermissionType extends Static<typeof projectPermissionSchema> {}

export interface ProjectPermissionDatabaseType extends Omit<ProjectPermissionType, 'user'> {}

// Schema for creating new entries
export const projectPermissionDataProperties = Type.Pick(projectPermissionSchema, ['projectId', 'userId', 'type'])

export const projectPermissionDataSchema = Type.Intersect(
  [
    projectPermissionDataProperties,
    Type.Object({
      inviteCode: Type.Optional(TypedString<InviteCode>())
    })
  ],
  {
    $id: 'ProjectPermissionData',
    additionalProperties: false
  }
)
export interface ProjectPermissionData extends Static<typeof projectPermissionDataSchema> {}

// Schema for updating existing entries
export const projectPermissionPatchSchema = Type.Pick(projectPermissionSchema, ['type'], {
  $id: 'ProjectPermissionPatch'
})
export interface ProjectPermissionPatch extends Static<typeof projectPermissionPatchSchema> {}

// Schema for allowed query properties
export const projectPermissionQueryProperties = Type.Pick(projectPermissionSchema, [
  'id',
  'projectId',
  'userId',
  'createdBy',
  'type'
])
export const projectPermissionQuerySchema = Type.Intersect(
  [
    querySyntax(projectPermissionQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        project: Type.Optional(Type.String()),
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface ProjectPermissionQuery extends Static<typeof projectPermissionQuerySchema> {}

export const projectPermissionValidator = /* @__PURE__ */ getValidator(projectPermissionSchema, dataValidator)
export const projectPermissionDataValidator = /* @__PURE__ */ getValidator(projectPermissionDataSchema, dataValidator)
export const projectPermissionPatchValidator = /* @__PURE__ */ getValidator(projectPermissionPatchSchema, dataValidator)
export const projectPermissionQueryValidator = /* @__PURE__ */ getValidator(
  projectPermissionQuerySchema,
  queryValidator
)
