// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { UserID } from '../../schema.type.module'
import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { locationAdminDataSchema, locationAdminSchema } from './location-admin.schema'
import { locationAuthorizedUserSchema } from './location-authorized-user.schema'
import { locationSettingDataSchema, locationSettingPatchSchema, locationSettingSchema } from './location-setting.schema'

export const locationPath = 'location'

export const locationMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export type RoomCode = OpaqueType<'RoomCode'> & string
export type LocationID = OpaqueType<'LocationID'> & string

// Main data model schema
export const locationSchema = Type.Object(
  {
    id: TypedString<LocationID>({
      format: 'uuid'
    }),
    name: Type.String(),
    sceneId: Type.String(),
    projectId: Type.String({
      format: 'uuid'
    }),
    slugifiedName: Type.String(),
    /** @todo review */
    isLobby: Type.Boolean(),
    /** @todo review */
    isFeatured: Type.Boolean(),
    url: Type.String(),
    sceneURL: Type.String(),
    maxUsersPerInstance: Type.Number(),
    locationSetting: Type.Ref(locationSettingSchema),
    locationAdmin: Type.Optional(Type.Ref(locationAdminSchema)),
    locationAuthorizedUsers: Type.Array(Type.Ref(locationAuthorizedUserSchema)),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Location', additionalProperties: false }
)
export interface LocationType extends Static<typeof locationSchema> {}

export interface LocationDatabaseType
  extends Omit<LocationType, 'locationSetting' | 'locationAuthorizedUsers' | 'locationAdmin' | 'sceneURL' | 'url'> {}

// Schema for creating new entries
export const locationDataProperties = Type.Pick(locationSchema, [
  'name',
  'sceneId',
  'isLobby',
  'isFeatured',
  'maxUsersPerInstance'
])

export const locationDataSchema = Type.Intersect(
  [
    locationDataProperties,
    Type.Object(
      {
        id: Type.Optional(
          TypedString<LocationID>({
            format: 'uuid'
          })
        ),
        locationAdmin: Type.Optional(Type.Ref(locationAdminDataSchema)),
        locationSetting: Type.Ref(locationSettingDataSchema)
      },
      { additionalProperties: false }
    )
  ],
  { $id: 'LocationData' }
)
export interface LocationData extends Static<typeof locationDataSchema> {}

// Schema for updating existing entries
export const locationPatchProperties = Type.Pick(locationSchema, [
  'id',
  'name',
  'sceneId',
  'projectId',
  'slugifiedName',
  'isLobby',
  'isFeatured',
  'sceneURL',
  'maxUsersPerInstance',
  'updatedBy'
])

export const locationPatchSchema = Type.Partial(
  Type.Intersect([
    locationPatchProperties,
    Type.Object({
      locationSetting: Type.Ref(locationSettingPatchSchema)
    })
  ]),
  {
    $id: 'LocationPatch'
  }
)
export interface LocationPatch extends Static<typeof locationPatchSchema> {}

// Schema for allowed query properties
export const locationQueryProperties = Type.Pick(locationSchema, [
  'id',
  'name',
  'sceneId',
  'projectId',
  'slugifiedName',
  'isLobby',
  'isFeatured',
  'maxUsersPerInstance'
])
export const locationQuerySchema = Type.Intersect(
  [
    querySyntax(locationQueryProperties, {
      name: {
        $like: Type.String()
      },
      sceneId: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(Type.String()),
        search: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface LocationQuery extends Static<typeof locationQuerySchema> {}

export const locationValidator = /* @__PURE__ */ getValidator(locationSchema, dataValidator)
export const locationDataValidator = /* @__PURE__ */ getValidator(locationDataSchema, dataValidator)
export const locationPatchValidator = /* @__PURE__ */ getValidator(locationPatchSchema, dataValidator)
export const locationQueryValidator = /* @__PURE__ */ getValidator(locationQuerySchema, queryValidator)
