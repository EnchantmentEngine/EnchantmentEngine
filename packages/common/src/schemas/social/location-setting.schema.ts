// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { LocationID } from './location.schema'

export const locationSettingPath = 'location-setting'

export const locationSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const locationSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    locationId: TypedString<LocationID>(),
    /** @todo review */
    locationType: StringEnum(['private', 'public', 'showroom']),
    audioEnabled: Type.Boolean(),
    screenSharingEnabled: Type.Boolean(),
    /** @todo review */
    faceStreamingEnabled: Type.Boolean(),
    videoEnabled: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'LocationSetting', additionalProperties: false }
)
export interface LocationSettingType extends Static<typeof locationSettingSchema> {}

// Schema for creating new entries
export const locationSettingDataSchema = Type.Partial(locationSettingSchema, {
  $id: 'LocationSettingData'
})
export interface LocationSettingData extends Static<typeof locationSettingDataSchema> {}

// Schema for updating existing entries
export const locationSettingPatchSchema = Type.Partial(locationSettingSchema, {
  $id: 'LocationSettingPatch'
})
export interface LocationSettingPatch extends Static<typeof locationSettingPatchSchema> {}

// Schema for allowed query properties
export const locationSettingQueryProperties = Type.Pick(locationSettingSchema, [
  'id',
  'locationId',
  'locationType',
  'audioEnabled',
  'screenSharingEnabled',
  'faceStreamingEnabled',
  'videoEnabled'
])
export const locationSettingQuerySchema = Type.Intersect(
  [
    querySyntax(locationSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface LocationSettingQuery extends Static<typeof locationSettingQuerySchema> {}

export const locationSettingValidator = /* @__PURE__ */ getValidator(locationSettingSchema, dataValidator)
export const locationSettingDataValidator = /* @__PURE__ */ getValidator(locationSettingDataSchema, dataValidator)
export const locationSettingPatchValidator = /* @__PURE__ */ getValidator(locationSettingPatchSchema, dataValidator)
export const locationSettingQueryValidator = /* @__PURE__ */ getValidator(locationSettingQuerySchema, queryValidator)
