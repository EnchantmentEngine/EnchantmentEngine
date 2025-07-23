// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { Static, StringEnum, Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { dataValidator, queryValidator } from '@ir-engine/common/src/schemas/validators'
import { TypedString } from '@ir-engine/common/src/types/TypeboxUtils'

export const projectHistoryPath = 'project-history'
export const projectHistoryMethods = ['create', 'find', 'remove'] as const

export const ActionTypes = [
  'SCENE_CREATED',
  'SCENE_RENAMED',
  'SCENE_MODIFIED',
  'SCENE_REMOVED',
  'RESOURCE_CREATED',
  'RESOURCE_RENAMED',
  'RESOURCE_MODIFIED',
  'RESOURCE_REMOVED',
  'PROJECT_CREATED',
  'PERMISSION_CREATED',
  'PERMISSION_MODIFIED',
  'PERMISSION_REMOVED',
  'LOCATION_PUBLISHED',
  'LOCATION_MODIFIED',
  'LOCATION_UNPUBLISHED',
  'TAGS_MODIFIED',
  'THUMBNAIL_CREATED',
  'THUMBNAIL_MODIFIED',
  'THUMBNAIL_REMOVED'
] as const

export type ActionType = (typeof ActionTypes)[number]

export const ActionIdentifierTypes = ['static-resource', 'project', 'location', 'project-permission'] as const

// Schema for creating new entries
export const projectHistorySchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    projectId: Type.String({
      format: 'uuid'
    }),
    userId: Type.Union([
      TypedString<UserID>({
        format: 'uuid'
      }),
      Type.Null()
    ]),

    userName: Type.String(),
    userAvatarURL: Type.String({ format: 'uri' }),

    // @ts-ignore
    action: StringEnum(ActionTypes),
    actionIdentifier: Type.String(),

    // @ts-ignore
    actionIdentifierType: StringEnum(ActionIdentifierTypes),
    actionDetail: Type.String(),

    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ProjectHistory', additionalProperties: false }
)
export interface ProjectHistoryType extends Static<typeof projectHistorySchema> {}

// Schema for creating new entries
export const projectHistoryDataSchema = Type.Pick(
  projectHistorySchema,
  ['projectId', 'userId', 'action', 'actionIdentifier', 'actionIdentifierType', 'actionDetail'],
  {
    $id: 'ProjectHistoryData'
  }
)
export interface ProjectHistoryData extends Static<typeof projectHistoryDataSchema> {}

// Schema for allowed query properties
export const projectHistoryQueryProperties = Type.Pick(projectHistorySchema, ['projectId', 'createdAt'])

export const projectHistoryQuerySchema = Type.Intersect([querySyntax(projectHistoryQueryProperties, {})], {
  additionalProperties: false
})
export interface ProjectHistoryQuery extends Static<typeof projectHistoryQuerySchema> {}

export const projectHistoryValidator = /* @__PURE__ */ getValidator(projectHistorySchema, dataValidator)
export const projectHistoryDataValidator = /* @__PURE__ */ getValidator(projectHistoryDataSchema, dataValidator)
export const projectHistoryQueryValidator = /* @__PURE__ */ getValidator(projectHistoryQuerySchema, queryValidator)
