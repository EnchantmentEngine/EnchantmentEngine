// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const routePath = 'route'

export const routeMethods = ['find', 'get', 'create', 'patch', 'remove'] as const
export type RouteID = OpaqueType<'RouteID'> & string

// Main data model schema
export const routeSchema = Type.Object(
  {
    id: TypedString<RouteID>({
      format: 'uuid'
    }),
    route: Type.String(),
    project: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Route', additionalProperties: false }
)
export interface RouteType extends Static<typeof routeSchema> {}

// Schema for creating new entries
export const routeDataSchema = Type.Pick(routeSchema, ['route', 'project'], {
  $id: 'RouteData'
})
export interface RouteData extends Static<typeof routeDataSchema> {}

// Schema for updating existing entries
export const routePatchSchema = Type.Partial(routeSchema, {
  $id: 'RoutePatch'
})
export interface RoutePatch extends Static<typeof routePatchSchema> {}

// Schema for allowed query properties
export const routeQueryProperties = Type.Pick(routeSchema, ['id', 'route', 'project'])
export const routeQuerySchema = Type.Intersect(
  [
    querySyntax(routeQueryProperties),
    // Add additional query properties here
    Type.Object({ paginate: Type.Optional(Type.Boolean()) }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface RouteQuery extends Static<typeof routeQuerySchema> {}

export const routeValidator = /* @__PURE__ */ getValidator(routeSchema, dataValidator)
export const routeDataValidator = /* @__PURE__ */ getValidator(routeDataSchema, dataValidator)
export const routePatchValidator = /* @__PURE__ */ getValidator(routePatchSchema, dataValidator)
export const routeQueryValidator = /* @__PURE__ */ getValidator(routeQuerySchema, queryValidator)
