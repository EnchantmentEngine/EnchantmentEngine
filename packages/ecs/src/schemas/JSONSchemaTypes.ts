import { Entity } from '../Entity'

export const Kind = Symbol('Kind')
export const NonSerializable = Symbol('NonSerializable')
export const Required = Symbol('Required')

export type Kinds =
  | 'Null'
  | 'Undefined'
  | 'Void'
  | 'Number'
  | 'Bool'
  | 'String'
  | 'Literal'
  | 'Object'
  | 'Record'
  | 'Partial'
  | 'Array'
  | 'Tuple'
  | 'Union'
  | 'Func'
  | 'Class'
  | 'Proxy'
  | 'Any'

export interface Schema {
  [Kind]: Kinds
  static: unknown
  properties?: unknown
  options?: Options<any>
}

export type Static<T extends Schema> = T['static']

type ValueOrInitializer<T> = T | ((entity: Entity) => T)

export interface Options<V = unknown> {
  id?: string
  default?: ValueOrInitializer<V>
  serialized?: boolean
  serialize?: (value: V) => unknown
  deserialize?: (curr: V, value: V) => V
  validate?: (value: V, prev: V, entity: Entity) => boolean
  required?: boolean
  $comment?: string
  metadata?: Record<string, any>
}

export interface TNullSchema extends Schema {
  [Kind]: 'Null'
  static: null
  options: Options<this['static']>
}

export interface TUndefinedSchema extends Schema {
  [Kind]: 'Undefined'
  static: undefined
  options: Options<this['static']>
}

export interface TVoidSchema extends Schema {
  [Kind]: 'Void'
  static: void
  options: Options<this['static']>
}

export interface TNumberSchema extends Schema {
  [Kind]: 'Number'
  static: number
  options: Options<this['static']> & {
    maximum?: number
    minimum?: number
    exclusiveMaximum?: number
    exclusiveMinimum?: number
    multipleOf?: number
  }
}

export interface TBoolSchema extends Schema {
  [Kind]: 'Bool'
  static: boolean
  options: Options<this['static']>
}

export interface TStringSchema extends Schema {
  [Kind]: 'String'
  static: string
  options: Options<this['static']> & {
    pattern?: string
    minLength?: number
    maxLength?: number
  }
}

export type TLiteralValue = boolean | number | string
export interface TLiteralSchema<T extends TLiteralValue> extends Schema {
  [Kind]: 'Literal'
  static: T
  properties: T
  options: Options<this['static']>
}

export type TPropertyKeySchema = TStringSchema | TNumberSchema
export type TPropertyKey = string | number
export type TProperties = Record<TPropertyKey, Schema>

type ObjectOptionalKeys<T extends TProperties> = {
  [K in keyof T]: undefined extends Static<T[K]> ? K : never
}[keyof T]

type ObjectNonOptionalKeys<T extends TProperties> = Exclude<keyof T, ObjectOptionalKeys<T>>

type ObjectStatic<T extends TProperties> = {
  [K in ObjectNonOptionalKeys<T>]: Static<T[K]>
} & {
  [K in ObjectOptionalKeys<T>]?: Static<T[K]>
}

export interface TObjectSchema<T extends TProperties> extends Schema {
  [Kind]: 'Object'
  static: ObjectStatic<T>
  properties: T
  options: Options<this['static']> & {
    additionalProperties?: boolean
    patternProperties?: Record<string, any>
    minProperties?: number
    maxProperties?: number
  }
}

type Key<K> = K extends PropertyKey ? K : never
type RecordStatic<K extends Schema, V extends Schema> = {
  [_ in Key<Static<K>>]: Static<V>
}

export interface TRecordSchema<K extends Schema, V extends Schema> extends Schema {
  [Kind]: 'Record'
  static: RecordStatic<K, V>
  properties: { key: K; value: V }
  options: Options<this['static']>
}

export interface TPartialSchema<T extends Schema> extends Schema {
  [Kind]: 'Partial'
  static: Partial<Static<T>>
  properties: T
  options: Options<this['static']>
}

type ArrayStatic<T extends Schema> = Static<T>[]
export interface TArraySchema<T extends Schema> extends Schema {
  [Kind]: 'Array'
  static: ArrayStatic<T>
  options: Options<this['static']> & {
    minItems?: number
    maxItems?: number
    minContains?: number
    maxContains?: number
    uniqueItems?: boolean
  }
  properties: T
}

type TupleStatic<T extends Schema[]> = [...{ [K in keyof T]: Static<T[K]> }]
export interface TTupleSchema<T extends Schema[]> extends Schema {
  [Kind]: 'Tuple'
  static: TupleStatic<T>
  properties: T
  options: Options<this['static']>
}

type UnionStatic<T extends Schema[]> = {
  [K in keyof T]: T[K] extends Schema ? Static<T[K]> : never
}[number]
export interface TUnionSchema<T extends Schema[]> extends Schema {
  [Kind]: 'Union'
  static: UnionStatic<T>
  properties: T
  options: Options<this['static']>
}

type ParamsStatic<T extends Schema[], Arr extends unknown[] = []> = T extends [
  infer L extends Schema,
  ...infer R extends Schema[]
]
  ? ParamsStatic<R, [...Arr, ...[Static<L>]]>
  : Arr
export interface TFuncSchema<Params extends Schema[], Return extends Schema> extends Schema {
  [Kind]: 'Func'
  static: (...params: ParamsStatic<Params>) => Static<Return>
  properties: { params: Params; return: Return }
  options: Options<this['static']>
}

export interface TClassSchema<T extends TProperties, Class> extends Schema {
  [Kind]: 'Class'
  static: Class
  properties: T
  options: Options<this['static']>
}

export interface TTypedSchema<T> extends Schema {
  [Kind]: 'Any'
  static: T
  options: Options<this['static']>
}

export interface TProxySchema<T extends Schema> extends Schema {
  [Kind]: 'Proxy'
  static: Static<T>
  properties: T
  options: Options<this['static']>
}
