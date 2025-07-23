// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { StringEnum, Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '@ir-engine/common/src/schemas/validators'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'

export const projectSettingPath = 'project-setting'

export const projectSettingMethods = ['find', 'create', 'patch', 'remove'] as const

// Main data model schema
export const projectSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    key: Type.String(),
    value: Type.String(),
    type: StringEnum(['private', 'public']),
    projectId: Type.String({
      format: 'uuid'
    }),
    userId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ProjectSetting', additionalProperties: false }
)
export interface ProjectSettingType extends Static<typeof projectSettingSchema> {}

// Schema for creating new entries
export const projectSettingDataSchema = Type.Pick(
  projectSettingSchema,
  ['key', 'value', 'type', 'projectId', 'userId'],
  {
    $id: 'ProjectSettingData'
  }
)
export interface ProjectSettingData extends Static<typeof projectSettingDataSchema> {}

// Schema for updating existing entries
export const projectSettingPatchSchema = Type.Partial(
  Type.Pick(projectSettingSchema, ['key', 'value', 'type', 'userId']),
  {
    $id: 'ProjectSettingPatch'
  }
)
export interface ProjectSettingPatch extends Static<typeof projectSettingPatchSchema> {}

// Schema for allowed query properties
export const projectSettingQueryProperties = Type.Pick(projectSettingSchema, ['id', 'key', 'value', 'projectId'])
export const projectSettingQuerySchema = Type.Intersect(
  [
    querySyntax(projectSettingQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        paginate: Type.Optional(Type.Boolean()),
        projectName: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface ProjectSettingQuery extends Static<typeof projectSettingQuerySchema> {}

export const projectSettingValidator = /* @__PURE__ */ getValidator(projectSettingSchema, dataValidator)
export const projectSettingDataValidator = /* @__PURE__ */ getValidator(projectSettingDataSchema, dataValidator)
export const projectSettingPatchValidator = /* @__PURE__ */ getValidator(projectSettingPatchSchema, dataValidator)
export const projectSettingQueryValidator = /* @__PURE__ */ getValidator(projectSettingQuerySchema, queryValidator)
