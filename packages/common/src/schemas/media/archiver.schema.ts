import { querySyntax, Static, Type } from '@feathersjs/typebox'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const archiverPath = 'archiver'

export const archiverMethods = ['get'] as const

export const archiverQueryProperties = Type.Object({
  project: Type.Optional(Type.String()),
  isJob: Type.Optional(Type.Boolean()),
  jobId: Type.Optional(Type.String())
})
export const archiverQuerySchema = Type.Intersect(
  [
    querySyntax(archiverQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ArchiverQuery extends Static<typeof archiverQuerySchema> {}
