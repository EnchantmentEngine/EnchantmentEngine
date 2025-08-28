// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const migrationsInfoPath = 'knex_migrations'

export const migrationsInfoMethods = ['find'] as const

// Main data model schema
export const migrationsInfoSchema = Type.Object(
  {
    id: Type.Integer(),
    name: Type.String(),
    batch: Type.Integer(),
    migration_time: Type.String({ format: 'date-time' })
  },
  { $id: 'MigrationsInfo', additionalProperties: false }
)
export interface MigrationsInfoType extends Static<typeof migrationsInfoSchema> {}

// Schema for allowed query properties
export const migrationsInfoQueryProperties = Type.Pick(migrationsInfoSchema, ['id', 'name', 'batch', 'migration_time'])
export const migrationsInfoQuerySchema = Type.Intersect(
  [
    querySyntax(migrationsInfoQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MigrationsInfoQuery extends Static<typeof migrationsInfoQuerySchema> {}

export const migrationsInfoValidator = /* @__PURE__ */ getValidator(migrationsInfoSchema, dataValidator)
export const migrationsInfoQueryValidator = /* @__PURE__ */ getValidator(migrationsInfoQuerySchema, queryValidator)
