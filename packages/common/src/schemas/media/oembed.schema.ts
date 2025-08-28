import { Static, Type } from '@feathersjs/typebox'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const oembedPath = 'oembed'

export const oembedMethods = ['find'] as const

export const oembedSchema = Type.Object(
  {
    version: Type.String(),
    type: Type.String(),
    title: Type.String(),
    description: Type.String(),
    provider_name: Type.String(),
    provider_url: Type.String(),
    thumbnail_url: Type.String(),
    thumbnail_width: Type.Number(),
    thumbnail_height: Type.Number(),
    query_url: Type.String(),
    url: Type.Optional(Type.String()),
    height: Type.Optional(Type.Number()),
    width: Type.Optional(Type.Number())
  },
  {
    $id: 'Oembed'
  }
)
export interface OembedType extends Static<typeof oembedSchema> {}
