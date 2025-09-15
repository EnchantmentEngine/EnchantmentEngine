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

export interface SchemaDefinition {
  [Kind]: Kinds
  static: unknown
  properties?: unknown
  options?: Options<any>
}

export type Static<T extends SchemaDefinition> = T['static']

type ValueOrInitializer<T> = T | (() => T)

export interface Options<V = unknown> {
  $id?: string
  default?: ValueOrInitializer<V>
  serialized?: boolean
  serialize?: (value: V) => unknown
  deserialize?: (curr: V, value: V) => V
  required?: boolean
  $comment?: string
  metadata?: Record<string, any>
}

export interface TNullSchema extends SchemaDefinition {
  [Kind]: 'Null'
  static: null
  options: Options<this['static']>
}

export interface TUndefinedSchema extends SchemaDefinition {
  [Kind]: 'Undefined'
  static: undefined
  options: Options<this['static']>
}

export interface TVoidSchema extends SchemaDefinition {
  [Kind]: 'Void'
  static: void
  options: Options<this['static']>
}

export interface TNumberSchema extends SchemaDefinition {
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

export interface TBoolSchema extends SchemaDefinition {
  [Kind]: 'Bool'
  static: boolean
  options: Options<this['static']>
}

export interface TStringSchema extends SchemaDefinition {
  [Kind]: 'String'
  static: string
  options: Options<this['static']> & {
    pattern?: string
    minLength?: number
    maxLength?: number
  }
}

export type TLiteralValue = boolean | number | string
export interface TLiteralSchema<T extends TLiteralValue> extends SchemaDefinition {
  [Kind]: 'Literal'
  static: T
  properties: T
  options: Options<this['static']>
}

export type TPropertyKeySchema = TStringSchema | TNumberSchema
export type TPropertyKey = string | number
export type TProperties = Record<TPropertyKey, SchemaDefinition>

type ObjectOptionalKeys<T extends TProperties> = {
  [K in keyof T]: undefined extends Static<T[K]> ? K : never
}[keyof T]

type ObjectNonOptionalKeys<T extends TProperties> = Exclude<keyof T, ObjectOptionalKeys<T>>

type ObjectStatic<T extends TProperties> = {
  [K in ObjectNonOptionalKeys<T>]: Static<T[K]>
} & {
  [K in ObjectOptionalKeys<T>]?: Static<T[K]>
}

export interface TObjectSchema<T extends TProperties> extends SchemaDefinition {
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
type RecordStatic<K extends SchemaDefinition, V extends SchemaDefinition> = {
  [_ in Key<Static<K>>]: Static<V>
}

export interface TRecordSchema<K extends SchemaDefinition, V extends SchemaDefinition> extends SchemaDefinition {
  [Kind]: 'Record'
  static: RecordStatic<K, V>
  properties: { key: K; value: V }
  options: Options<this['static']>
}

export interface TPartialSchema<T extends SchemaDefinition> extends SchemaDefinition {
  [Kind]: 'Partial'
  static: Partial<Static<T>>
  properties: T
  options: Options<this['static']>
}

type ArrayStatic<T extends SchemaDefinition> = Static<T>[]
export interface TArraySchema<T extends SchemaDefinition> extends SchemaDefinition {
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

type TupleStatic<T extends SchemaDefinition[]> = [...{ [K in keyof T]: Static<T[K]> }]
export interface TTupleSchema<T extends SchemaDefinition[]> extends SchemaDefinition {
  [Kind]: 'Tuple'
  static: TupleStatic<T>
  properties: T
  options: Options<this['static']>
}

type UnionStatic<T extends SchemaDefinition[]> = {
  [K in keyof T]: T[K] extends SchemaDefinition ? Static<T[K]> : never
}[number]
export interface TUnionSchema<T extends SchemaDefinition[]> extends SchemaDefinition {
  [Kind]: 'Union'
  static: UnionStatic<T>
  properties: T
  options: Options<this['static']>
}

type ParamsStatic<T extends SchemaDefinition[], Arr extends unknown[] = []> = T extends [
  infer L extends SchemaDefinition,
  ...infer R extends SchemaDefinition[]
]
  ? ParamsStatic<R, [...Arr, ...[Static<L>]]>
  : Arr
export interface TFuncSchema<Params extends SchemaDefinition[], Return extends SchemaDefinition>
  extends SchemaDefinition {
  [Kind]: 'Func'
  static: (...params: ParamsStatic<Params>) => Static<Return>
  properties: { params: Params; return: Return }
  options: Options<this['static']>
}

export interface TClassSchema<T extends TProperties, Class> extends SchemaDefinition {
  [Kind]: 'Class'
  static: Class
  properties: T
  options: Options<this['static']>
}

export interface TTypedSchema<T> extends SchemaDefinition {
  [Kind]: 'Any'
  static: T
  options: Options<this['static']>
}

export interface TProxySchema<T extends SchemaDefinition> extends SchemaDefinition {
  [Kind]: 'Proxy'
  static: Static<T>
  properties: T
  options: Options<this['static']>
}
