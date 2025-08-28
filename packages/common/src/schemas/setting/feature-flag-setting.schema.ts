// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const featureFlagSettingPath = 'feature-flag-setting'

export const featureFlagSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const featureFlagSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    flagName: Type.String(),
    flagValue: Type.Boolean(),
    userId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'FeatureFlagSetting', additionalProperties: false }
)
export interface FeatureFlagSettingType extends Static<typeof featureFlagSettingSchema> {}

// Schema for creating new entries
export const featureFlagSettingDataSchema = Type.Pick(featureFlagSettingSchema, ['flagName', 'flagValue', 'userId'], {
  $id: 'FeatureFlagSettingData'
})
export interface FeatureFlagSettingData extends Static<typeof featureFlagSettingDataSchema> {}

// Schema for updating existing entries
export const featureFlagSettingPatchSchema = Type.Partial(featureFlagSettingSchema, {
  $id: 'FeatureFlagSettingPatch'
})
export interface FeatureFlagSettingPatch extends Static<typeof featureFlagSettingPatchSchema> {}

// Schema for allowed query properties
export const featureFlagSettingQueryProperties = Type.Pick(featureFlagSettingSchema, ['id', 'flagName', 'flagValue'])
export const featureFlagSettingQuerySchema = Type.Intersect(
  [
    querySyntax(featureFlagSettingQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface FeatureFlagSettingQuery extends Static<typeof featureFlagSettingQuerySchema> {}

export const featureFlagSettingValidator = /* @__PURE__ */ getValidator(featureFlagSettingSchema, dataValidator)
export const featureFlagSettingDataValidator = /* @__PURE__ */ getValidator(featureFlagSettingDataSchema, dataValidator)
export const featureFlagSettingPatchValidator = /* @__PURE__ */ getValidator(
  featureFlagSettingPatchSchema,
  dataValidator
)
export const featureFlagSettingQueryValidator = /* @__PURE__ */ getValidator(
  featureFlagSettingQuerySchema,
  queryValidator
)
