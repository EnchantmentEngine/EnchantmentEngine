import { Kind, ObjectOptions, Static, StringFormatOption, StringOptions, TSchema, Type } from '@feathersjs/typebox'

export interface TTypedString<T extends string, Format extends string = string> extends TSchema, StringOptions<Format> {
  [Kind]: 'String'
  static: T
  type: T
}

export const TypedString = <T extends string>(options?: StringOptions<StringFormatOption | T>) => {
  return Type.String(options) as TTypedString<T, T>
}

export interface TTypedRecord<
  S extends string,
  K extends TTypedString<S> = TTypedString<S>,
  T extends TSchema = TSchema
> extends TSchema {
  [Kind]: 'Record'
  static: Record<Static<K>, Static<T, this['params']>>
  type: 'object'
  patternProperties: {
    [pattern: string]: T
  }
  additionalProperties: false
}

export const TypedRecord = <K extends TTypedString<S>, T extends TSchema, S extends string>(
  key: K,
  schema: T,
  options?: ObjectOptions
) => {
  return Type.Record(key as any, schema, options) as any as TTypedRecord<S, K, T>
}
