// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { getValidator, querySyntax, Static, Type } from '@feathersjs/typebox'

import { EntityUUID } from '@ir-engine/ecs'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const spawnPointPath = 'spawn-point'

export const spawnPointMethods = ['get', 'update', 'create', 'find', 'patch', 'remove'] as const

export const spawnPointSchema = Type.Object(
  {
    id: TypedString<EntityUUID>({
      format: 'uuid'
    }),
    sceneId: Type.String(),
    name: Type.String(),
    previewImageURL: Type.String(),
    position: Type.Object({
      x: Type.Number(),
      y: Type.Number(),
      z: Type.Number()
    }),
    rotation: Type.Object({
      x: Type.Number(),
      y: Type.Number(),
      z: Type.Number(),
      w: Type.Number()
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'SpawnPoint', additionalProperties: false }
)
export interface SpawnPointType extends Static<typeof spawnPointSchema> {}

// Schema for creating new entries
export const spawnPointDataSchema = Type.Pick(
  spawnPointSchema,
  ['sceneId', 'previewImageURL', 'position', 'rotation'],
  {
    $id: 'SpawnPointData'
  }
)
export interface SpawnPointData extends Static<typeof spawnPointDataSchema> {}

// Schema for updating existing entries
export const spawnPointPatchSchema = Type.Partial(spawnPointSchema, {
  $id: 'SpawnPointPatch'
})
export interface SpawnPointPatch extends Static<typeof spawnPointPatchSchema> {}

// Schema for allowed query properties
export const spawnPointQueryProperties = Type.Pick(spawnPointSchema, [
  'id',
  'sceneId',
  'previewImageURL',
  'position',
  'rotation'
])
export const spawnPointQuerySchema = Type.Intersect(
  [
    querySyntax(spawnPointQueryProperties),
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
export interface SpawnPointQuery extends Static<typeof spawnPointQuerySchema> {}

export const spawnPointValidator = /* @__PURE__ */ getValidator(spawnPointSchema, dataValidator)
export const spawnPointDataValidator = /* @__PURE__ */ getValidator(spawnPointDataSchema, dataValidator)
export const spawnPointPatchValidator = /* @__PURE__ */ getValidator(spawnPointPatchSchema, dataValidator)
export const spawnPointQueryValidator = /* @__PURE__ */ getValidator(spawnPointQuerySchema, queryValidator)
