// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const userSettingPath = 'user-setting'

export const userSettingMethods = ['find', 'create', 'patch', 'remove'] as const

export type UserSettingID = OpaqueType<'UserSettingID'> & string

// Main data model schema
export const userSettingSchema = Type.Object(
  {
    id: TypedString<UserSettingID>({
      format: 'uuid'
    }),
    themeModes: Type.Record(Type.String(), Type.String()),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserSetting', additionalProperties: false }
)
export interface UserSettingType extends Static<typeof userSettingSchema> {}

export interface UserSettingDatabaseType extends Omit<UserSettingType, 'themeModes'> {
  themeModes: string
}

// Schema for creating new entries
export const userSettingDataSchema = Type.Pick(userSettingSchema, ['userId'], {
  $id: 'UserSettingData'
})
export interface UserSettingData extends Static<typeof userSettingDataSchema> {}

// Schema for updating existing entries
export const userSettingPatchSchema = Type.Partial(userSettingSchema, {
  $id: 'UserSettingPatch'
})
export interface UserSettingPatch extends Static<typeof userSettingPatchSchema> {}

// Schema for allowed query properties
export const userSettingQueryProperties = Type.Pick(userSettingSchema, [
  'id',
  // 'themeModes', Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
  'userId'
])
export const userSettingQuerySchema = Type.Intersect(
  [
    querySyntax(userSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserSettingQuery extends Static<typeof userSettingQuerySchema> {}

export const userSettingValidator = /* @__PURE__ */ getValidator(userSettingSchema, dataValidator)
export const userSettingDataValidator = /* @__PURE__ */ getValidator(userSettingDataSchema, dataValidator)
export const userSettingPatchValidator = /* @__PURE__ */ getValidator(userSettingPatchSchema, dataValidator)
export const userSettingQueryValidator = /* @__PURE__ */ getValidator(userSettingQuerySchema, queryValidator)
