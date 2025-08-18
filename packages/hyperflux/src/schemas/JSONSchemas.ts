import { PeerID, UserID } from '@ir-engine/hyperflux'
import {
  Kind,
  Kinds,
  Options,
  SchemaDefinition,
  TArraySchema,
  TBoolSchema,
  TClassSchema,
  TFuncSchema,
  TLiteralSchema,
  TLiteralValue,
  TNullSchema,
  TNumberSchema,
  TObjectSchema,
  TPartialSchema,
  TProperties,
  TProxySchema,
  TRecordSchema,
  TStringSchema,
  TTupleSchema,
  TTypedSchema,
  TUndefinedSchema,
  TUnionSchema,
  TVoidSchema
} from './JSONSchemaTypes'

const buildOptions = (options?: Options): Options => {
  const defaultOptions = {
    serialized: true
  }

  return { ...defaultOptions, ...options }
}

const buildSchema = <Opt extends Options>(kind: Kinds, options?: Opt) => {
  return {
    [Kind]: kind,
    options: buildOptions(options)
  }
}

export const Schema = {
  /** Schema that infers as a null */
  Null: (options?: TNullSchema['options']) =>
    ({
      ...buildSchema('Null', options)
    }) as TNullSchema,

  /** Schema that infers as a undefined */
  Undefined: (options?: TUndefinedSchema['options']) =>
    ({
      ...buildSchema('Undefined', options)
    }) as TUndefinedSchema,

  /** Schema that infers as a void for use with Schemas.Func as a return schema */
  Void: (options?: TVoidSchema['options']) =>
    ({
      ...buildSchema('Void', options)
    }) as TVoidSchema,

  /** Schema that infers as a number, defaults to 0 */
  Number: (options?: TNumberSchema['options']) =>
    ({
      ...buildSchema('Number', options)
    }) as TNumberSchema,

  /** Schema that infers as a boolean, defaults to false */
  Bool: (options?: TBoolSchema['options']) =>
    ({
      ...buildSchema('Bool', options)
    }) as TBoolSchema,

  /** Schema that infers as a string, defaults to '' */
  String: (options?: TStringSchema['options']) =>
    ({
      ...buildSchema('String', options)
    }) as TStringSchema,

  /**
   * Schema that infers as the const values of an object, requires that the object to infer as be passed in, default to the first value of the object
   */
  Enum: <Value extends TLiteralValue>(
    item: Record<string, Value>,
    options?: TUnionSchema<TLiteralSchema<Value>[]>['options']
  ) => {
    const defaultItem = Object.values(item)[0]
    let deserialize
    if (typeof defaultItem === 'string') {
      // Handle migration from enum index to object value, eventually remove this
      deserialize = (curr, value) => {
        if (typeof value === 'number') return Object.values(item)[value]
        return value
      }
    }

    return Schema.LiteralUnion(Object.values(item), {
      default: defaultItem,
      deserialize: deserialize,
      ...options,
      metadata: { objectRef: item, ...options?.metadata }
    })
  },

  /**
   * Schema that infers as a literal value
   * Schemas.Literal('test') -> 'test'
   */
  Literal: <T extends TLiteralValue>(item: T, options?: TLiteralSchema<T>['options']) =>
    ({
      ...buildSchema('Literal', options),
      properties: item
    }) as TLiteralSchema<T>,

  /**
   * Schema that infers as an object type of the properties provided, defaults to an empty object ({})
   * Schemas.Object({ test: Schemas.Number() }) -> { test: number }
   */
  Object: <T extends TProperties>(properties: T, options?: TObjectSchema<T>['options']) =>
    ({
      ...buildSchema('Object', options),
      properties: properties
    }) as TObjectSchema<T>,

  /**
   * Schema that infers as a record type of key and value schemas passed in, defaults to an empty object ({})
   * Schemas.Record(Schemas.String(), Schemas.Number()) -> Record<string, number>
   */
  Record: <K extends SchemaDefinition, V extends SchemaDefinition>(
    key: K,
    value: V,
    options?: TRecordSchema<K, V>['options']
  ) =>
    ({
      ...buildSchema('Record', options),
      properties: { key, value }
    }) as TRecordSchema<K, V>,

  /**
   * Schema that infers as a Partial type of the schema passed in
   * Schemas.Partial(T.Vec3()) -> Partial<Vector3>
   */
  Partial: <T extends SchemaDefinition>(item: T, options?: TPartialSchema<T>['options']) =>
    ({
      ...buildSchema('Partial', options),
      properties: item
    }) as TPartialSchema<T>,

  /**
   * Schema that infers as an array type of the schema passed in, defaults to []
   * Schemas.Array(Schemas.Number()) -> number[]
   */
  Array: <T extends SchemaDefinition>(item: T, options?: TArraySchema<T>['options']) =>
    ({
      ...buildSchema('Array', options),
      properties: item
    }) as TArraySchema<T>,

  /**
   * Schema that infers as an tuple type of the schema passed in defaults to []
   * Schemas.Tuple([Schemas.Number(), Schemas.Number()]) -> [number, number]
   */
  Tuple: <T extends SchemaDefinition[]>(items: [...T], options?: TTupleSchema<T>['options']) =>
    ({
      ...buildSchema('Tuple', options),
      properties: items
    }) as TTupleSchema<T>,

  /**
   * Schema that infers as a union type of the schemas provided, defaults to the default value of the first element in the union
   * It will serialize as the first schema in the array that matches the value's shape
   * */
  Union: <T extends SchemaDefinition[]>(schemas: [...T], options?: TUnionSchema<T>['options']) =>
    ({
      ...buildSchema('Union', options),
      properties: schemas
    }) as TUnionSchema<T>,

  /** Schema that infers as a literal union (ie. 'key' | 'value') */
  LiteralUnion: <T extends TLiteralValue>(items: T[], options?: TUnionSchema<TLiteralSchema<T>[]>['options']) =>
    Schema.Union([...items.map((lit) => Schema.Literal(lit))], options),

  /**
   * Schema that infers as the return type of the function passed in, not serialized
   */
  Class: <T extends TProperties, Class>(init: () => Class, options?: TClassSchema<T, Class>['options']) =>
    ({
      ...buildSchema('Class', { default: init, ...options }),
      properties: {} as T
    }) as TClassSchema<T, Class>,

  /**
   * Schema that infers as the return type of the function passed in
   * if properties are passed in, those values will be serialized, otherwise it will not be serialized
   * Can provide a serializer function that can be used for custom serialization
   */
  SerializedClass: <T extends TProperties, Class>(items: T, options?: TClassSchema<T, Class>['options']) =>
    ({
      ...buildSchema('Class', { serialized: true, id: 'SerializedClass', ...options }),
      properties: items
    }) as TClassSchema<T, Class>,

  /**
   *
   * Schema of a function type, is not serializable
   *
   * @param parameters array of schemas to infer the type of the parameters
   * @param returns schema to infer the return type of the function
   * @param init initial value
   * @param options schema option
   * @returns
   */
  Func: <Params extends SchemaDefinition[], Return extends SchemaDefinition, Initial extends (...params: any[]) => any>(
    parameters: [...Params],
    returns: Return,
    options?: TFuncSchema<Params, Return>['options']
  ) =>
    ({
      ...buildSchema('Func', options),
      properties: { params: parameters, return: returns }
    }) as TFuncSchema<Params, Return>,

  Call: <Initial extends (...params: any[]) => any>(
    options?: TFuncSchema<SchemaDefinition[], TVoidSchema>['options']
  ) => Schema.Func([], Schema.Void(), options),

  /**
   * Schemas wrapped in this schema are optional values that can be undefined, will default to undefined if not default value is provided
   */
  Optional: <T extends SchemaDefinition>(schema: T, options?: TUnionSchema<[T, TUndefinedSchema]>['options']) =>
    Schema.Union([Schema.Undefined(), schema], options),

  /**
   *
   * Creates a schema object that infers to the generic type provided
   * Only the properties that are passed in on the props object will be serialized, if none are provided the value will not be serialized
   *
   * @param options schema options
   * @param props the properties you want to be serialized for the type
   * @returns
   */
  Type: <T>(options?: TTypedSchema<T>['options'], props?: TProperties) =>
    Schema.SerializedClass(props ?? {}, { default: () => undefined, ...options }) as unknown as TTypedSchema<T>,

  /**
   * Create a schema object that infers as an any type, the value is serialized
   */
  Any: () =>
    ({
      ...buildSchema('Any')
    }) as TTypedSchema<any>,

  /** UserID type schema helper, defaults to '' */
  UserID: (options?: TTypedSchema<UserID>['options']) =>
    Schema.String({ serialized: true, ...options, id: 'UserUUID' }) as unknown as TTypedSchema<UserID>,

  /** PeerID type schema helper, defaults to '' */
  PeerID: (options?: TTypedSchema<PeerID>['options']) =>
    Schema.String({ serialized: true, ...options, id: 'PeerUUID' }) as unknown as TTypedSchema<PeerID>,

  Proxy: <T extends SchemaDefinition>(schema: T) =>
    ({
      ...buildSchema('Proxy', { serialized: true }),
      properties: schema
    }) as TProxySchema<T>
}
