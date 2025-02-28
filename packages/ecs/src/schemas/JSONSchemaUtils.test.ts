/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { describe, expect, it, vi } from 'vitest'

import { Kind, Schema } from './JSONSchemaTypes'
import { HasSchemaDeserializers } from './JSONSchemaUtils'

/**
 * @description Returns an object nested to `@param depth` levels of depth.
 * Adds the given `@param value` to each level of the object with fieldname `properties`
 * */
export function createDeeplyNestedObject<T extends object>(depth: number, value?: T): T {
  /* @todo Move out of this file into tests/utils */
  const result = { properties: value } as T
  for (let level = 0; level < depth; ++level) {
    let current = result
    for (let field = 0; field <= level; ++field) {
      current[field] = current[field] || {}
      current = current[field]
    }
    current[Kind] = 'Object'
    current['options'] = { deserialize: undefined }
    current['properties'] = value
  }
  return result
}

describe('DeserializeSchemaValue', () => {
  it.todo(
    'should return the result of `@param schema.options.deserialize` with (`@param curr`, `@param value`) as args when `@param value` is not null or undefined, and deserialize is truthy',
    () => {}
  )
  describe('case: Kind.Number', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    it.todo("should return undefined when typeof `@param value` is not 'number'", () => {})
    it.todo("should return `@param value` when its typeof is 'number'", () => {})
  }) //:: Kind.Number

  describe('case: Kind.Bool', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    it.todo("should return undefined when typeof `@param value` is not 'boolean'", () => {})
    it.todo("should return `@param value` when its typeof is 'boolean'", () => {})
  }) //:: Kind.Bool

  describe('case: Kind.String', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    it.todo("should return undefined when typeof `@param value` is not 'string'", () => {})
    it.todo("should return undefined when `@param value` is '__proto__'", () => {})
    it.todo(
      "should return `@param value` when it is not null/undefined, its typeof is 'string' and its value is not '__proto__'",
      () => {}
    )
  }) //:: Kind.String

  describe('case: Kind.Enum', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    it.todo("should return undefined when `@param value` is not contained in the enum's schema", () => {})
    it.todo("should return `@param value` when its value contained in the enum's schema", () => {})
  }) //:: Kind.Enum

  describe('case: Kind.Literal', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    it.todo('should return undefined when `@param value` is not equal to `@param schema`.properties', () => {})
    it.todo('should return `@param value` when its value is equal to `@param schema`.properties', () => {})
  }) //:: Kind.Literal

  describe('case: Kind.Array', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    it.todo('should return undefined when Array.isArray( `@param value` ) is falsy', () => {})
    // TODO: valid return cases for Kind.Array
  }) //:: Kind.Array

  describe('case: Kind.Tuple', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    it.todo('should return undefined when Array.isArray( `@param value` ) is falsy', () => {})
    // TODO: valid return cases for Kind.Tuple
  }) //:: Kind.Tuple

  describe('case: Kind.Object', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    it.todo("should return undefined if typeof `@param value` when is not 'object'", () => {})
    // TODO: valid return cases for Kind.Object
  }) //:: Kind.Object

  describe('case: Kind.Class', () => {
    it.todo('should return `@param value` when it is null', () => {})
    it.todo('should return `@param value` when it is undefined', () => {})
    // TODO: valid return cases for Kind.Class
  }) //:: Kind.Class

  describe('case: Kind.Required', () => {
    // TODO: -- fallthrough
  }) //:: Kind.Required

  describe('case: Kind.Proxy', () => {
    // TODO: -- fallthrough
  }) //:: Kind.Proxy

  describe('case: Kind.NonSerialized', () => {
    // TODO: -- fallthrough
  }) //:: Kind.NonSerialized

  describe('case: Kind.Partial', () => {
    it.todo(
      'should call DeserializeSchemaValue by passing the same arguments and `@param schema`.properties as the schema parameter value',
      () => {}
    )
  }) //:: Kind.Partial

  describe('case: Kind -> default', () => {
    it.todo('should return `@param value` for any other Kind', () => {})
  }) //:: Kind -> default
}) //:: DeserializeSchemaValue

describe('HasSchemaDeserializers', () => {
  const nested = {
    depth: 1_000, // depth=2000 runs in ~200ms
    timeout: 2_000 // waitUntil timeout is 1000ms (default)
  }
  async function checkNestedSchema(schema: Schema, depth = nested.depth, timeout = nested.timeout) {
    return vi.waitUntil(
      () => {
        HasSchemaDeserializers(createDeeplyNestedObject(depth, schema))
        return true
      },
      { timeout: timeout }
    )
  }

  describe('inputs.invalid', () => {
    it('should not error if `@param schema` is coerced from a type that does not match the Schema interface', () => {
      expect(() => {
        // @ts-expect-error Coerce number into Schema
        HasSchemaDeserializers(42)
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce string into Schema
        HasSchemaDeserializers('TestString')
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce object into Schema
        HasSchemaDeserializers({ thing: 42 })
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce function into Schema
        HasSchemaDeserializers(() => true)
      }).not.toThrowError()
    })
  }) //:: HasSchemaDeserializers.inputs.invalid

  describe('process.recursion', () => {
    it('should not fall into infinite recursion', async () => {
      const emptySchema = {} as Schema
      const validSchema = { options: { deserialize: (_, __) => {} } } as Schema
      await checkNestedSchema(emptySchema)
      await checkNestedSchema(validSchema)
    })
  }) //:: HasSchemaDeserializers.process.recursion

  describe('output.expected', () => {
    it('should return true if the toplevel of the `@param schema` object has a truthy .options?.deserialize field', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const emptySchema = {} as Schema
      const schema = createDeeplyNestedObject(nested.depth, emptySchema)
      schema.options = { deserialize: (_, __) => {} }
      // 1. Sanity check (input & dependencies)
      expect(schema.options?.deserialize).toBeTruthy()
      // 2. Run the process
      const result = HasSchemaDeserializers(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
    })

    it('should return false if the toplevel of the `@param schema` object has a falsy .options?.deserialize field and has no children', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const schema = { options: { deserialize: undefined } } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = HasSchemaDeserializers(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
    })

    it('should return true if the toplevel of the `@param schema` object has a falsy .options?.deserialize field but has a child where it is truthy', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const child = { testField: { options: { deserialize: (_, __) => {} } } as Schema }
      const schema = { [Kind]: 'Object', options: { deserialize: undefined }, properties: child } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.options?.deserialize).toBeFalsy()
      expect(((schema.properties! as any).testField as Schema).options!.deserialize).toBeTruthy()
      // 2. Run the process
      const result = HasSchemaDeserializers(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
    })

    it('should return true if the toplevel of the `@param schema` object has a falsy .options?.deserialize field, all its children have no such field, but has a deeply nested children where it is truthy', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const deepChild = { testField: { options: { deserialize: (_, __) => {} } } as Schema }
      const child3 = {
        schema: { [Kind]: 'Object', options: { deserialize: undefined }, properties: deepChild } as Schema
      }
      const child2 = { schema: { [Kind]: 'Object', options: { deserialize: undefined }, properties: child3 } as Schema }
      const child1 = { schema: { [Kind]: 'Object', options: { deserialize: undefined }, properties: child2 } as Schema }
      const child0 = { schema: { [Kind]: 'Object', options: { deserialize: undefined }, properties: child1 } as Schema }
      const schema = { [Kind]: 'Object', options: { deserialize: undefined }, properties: child0 } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.options?.deserialize).toBeFalsy()
      expect(((schema.properties! as any).testField as Schema)?.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = HasSchemaDeserializers(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
    })
  }) //:: HasSchemaDeserializers.output.expected
}) //:: HasSchemaDeserializers

describe('HasRequiredSchema', () => {
  it.todo('should return false if `@param schema` has no children and does not have a Kind.Required field', () => {})
  it.todo(
    'should return false if `@param schema` has children, does not have a Kind.Required field and none of its children have it either',
    () => {}
  )
  it.todo('should return true if `@param schema` has a Kind.Required field', () => {})
  it.todo(
    'should return true if `@param schema` has children, does not have a Kind.Required field and at least one of its children have a Kind.Required field ',
    () => {}
  )
}) //:: HasRequiredSchema

describe('HasSchemaValidators', () => {
  it.todo(
    'should return false if `@param schema` has no children and does not have an .options.validate field',
    () => {}
  )
  it.todo(
    'should return false if `@param schema` has children, does not have an .options.validate field and none of its children have it either',
    () => {}
  )
  it.todo('should return true if `@param schema` has an .options.validate field', () => {})
  it.todo(
    'should return true if `@param schema` has children, does not have an .options.validate field and at least one of its children have an .options.validate field ',
    () => {}
  )
}) //:: HasSchemaValidators

describe('requiresDeserialization', () => {
  it.todo(
    'should return false if `@param schema` has no children and does not have an .options.deserialize field',
    () => {}
  )
  it.todo(
    'should return false if `@param schema` has children, does not have an .options.deserialize field and none of its children have it either',
    () => {}
  )
  it.todo('should return true if `@param schema` has an .options.deserialize field', () => {})
  it.todo(
    'should return true if `@param schema` has children, does not have an .options.deserialize field and at least one of its children have an .options.deserialize field ',
    () => {}
  )
}) //:: requiresDeserialization

describe('IsSingleValueSchema', () => {
  it.todo('should return false if `@param schema` is falsy', () => {})
  it.todo('should return false if `@param schema`[Kind] is falsy', () => {})
  it.todo('should return true if `@param schema`[Kind] is Null', () => {})
  it.todo('should return true if `@param schema`[Kind] is Undefined', () => {})
  it.todo('should return true if `@param schema`[Kind] is Void', () => {})
  it.todo('should return true if `@param schema`[Kind] is Number', () => {})
  it.todo('should return true if `@param schema`[Kind] is Bool', () => {})
  it.todo('should return true if `@param schema`[Kind] is String', () => {})
  it.todo('should return true if `@param schema`[Kind] is Enum', () => {})
  it.todo('should return true if `@param schema`[Kind] is Literal', () => {})
  it.todo('should return true if `@param schema`[Kind] is Class', () => {})
  it.todo('should return true if `@param schema`[Kind] is Array', () => {})
  it.todo('should return true if `@param schema`[Kind] is Tuple', () => {})
  it.todo('should return true if `@param schema`[Kind] is Func', () => {})
  it.todo('should return false if `@param schema`[Kind] is Any', () => {})
  it.todo('should return false if `@param schema`[Kind] is Object', () => {})
  it.todo('should return false if `@param schema`[Kind] is Record', () => {})
  it.todo('should return false if `@param schema`[Kind] is Partial', () => {})

  describe('case: Kind.Union', () => {
    it.todo('should return false when `@param schema`.properties has no values', () => {})
    it.todo('should return false if any of the `@param schema`.properties is not a single value schema', () => {})
    it.todo(
      'should return true if `@param schema`.properties has values and all of them are single value schemas',
      () => {}
    )
  }) //:: Kind.Union
  it.todo(
    'should return the result of IsSingleValueSchema( `@param schema`.properties ) if `@param schema`[Kind] is NonSerialized',
    () => {}
  )
  it.todo(
    'should return the result of IsSingleValueSchema( `@param schema`.properties ) if `@param schema`[Kind] is Required',
    () => {}
  )
  it.todo(
    'should return the result of IsSingleValueSchema( `@param schema`.properties ) if `@param schema`[Kind] is Proxy',
    () => {}
  )
  it.todo('should return false if `@param schema`[Kind] is a value that is not mapped', () => {})
}) //:: IsSingleValueSchema

describe('HasRequiredSchemaValues', () => {
  describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
    it.todo(
      "should call HasRequiredSchemaValues recursively and return [false, 'fieldName'] when one of the fields of `@param schema`.properties or its children does not have a valid value",
      () => {}
    )
    it.todo(
      "should return [true, ''] when all fields of `@param schema`.properties and its children have valid values",
      () => {}
    )
  }) //:: [Kind.Object, Kind.Class]

  describe.each(['Proxy', 'Partial', 'NonSerialized'])('case: Kind.%s', (kind) => {
    it.todo(
      'should return the result of calling HasRequiredSchemaValues with (`@param schema`.properties, `@param value`) as arguments',
      () => {}
    )
  }) //:: [Kind.Proxy, Kind.Partial, Kind.NonSerialized]

  describe('case: Kind.Required', () => {
    it.todo('should return [false, `@param current`] when `@param value` is null', () => {})
    it.todo('should return [false, `@param current`] when `@param value` is undefined', () => {})
    it.todo('should return [true, `@param current`] when `@param value` is not null or undefined', () => {})
  }) //:: Kind.Required

  describe('case: default', () => {
    it.todo(
      "should return [true, ''] when `@param schema`[Kind] is not one of [Kind.Object, Kind.Class, Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Required]",
      () => {}
    )
  }) //:: default
}) //:: HasRequiredSchemaValues

describe('HasValidSchemaValues', () => {
  describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
    it.todo(
      "should call HasValidSchemaValues recursively and return [false, 'fieldName'] when one of the fields of `@param schema`.properties or its children does not have a valid value",
      () => {}
    )
    it.todo(
      "should return [true, ''] when all fields of `@param schema`.properties and its children have valid values",
      () => {}
    )
  }) //:: [Kind.Object, Kind.Class]

  describe.each(['Proxy', 'Partial', 'NonSerialized', 'Partial'])('case: Kind.%s', (kind) => {
    it.todo(
      'should return the result of calling HasValidSchemaValues with (`@param schema`.properties, `@param value`, `@param prev`, `@param entity`) as arguments',
      () => {}
    )
  }) //:: [Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Partial]

  describe('case: default', () => {
    it.todo(
      "should return [true, ''] when `@param schema`[Kind] is not one of [Kind.Object, Kind.Class, Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Required]",
      () => {}
    )
  }) //:: default
}) //:: HasValidSchemaValues

describe('CreateSchemaValue', () => {
  it.todo(
    'should return a deepcopy of `@param schema`.options.default when it is not a function, options is truthy and options has a field called default',
    () => {}
  )
  it.todo(
    'should return the result of `@param schema`.options.default() when it is a function, options is truthy and options has a field called default',
    () => {}
  )
  it.todo("should return null when `@param schema`[Kind] is 'Null'", () => {})
  it.todo("should return .undefined when `@param schema`[Kind] is 'Undefined'", () => {})
  it.todo("should return undefined when `@param schema`[Kind] is 'Void'", () => {})
  it.todo("should return return when `@param schema`[Kind] is 'Number'", () => {})
  it.todo("should return false when `@param schema`[Kind] is 'Bool'", () => {})
  it.todo("should return '' when `@param schema`[Kind] is 'String'", () => {})
  it.todo(
    "should return the first value that can be represented by the `@param schema`.properties enum when schema[Kind] is 'Enum'",
    () => {}
  )
  it.todo("should return `@param schema`.properties when schema[Kind] is 'Literal'", () => {})
  it.todo.each(['Object', 'Class'])(
    'should return a deep clone of `@schema properties` with all proxies flattened (Kind.Proxy) when `@param schema`[Kind] is Kind.%s',
    (kind) => {}
  )
  it.todo.each(['Any', 'Record', 'Partial'])(
    'should return an empty object when `@param schema`[Kind] is Kind.%s',
    (kind) => {}
  )
  it.todo.each(['Array', 'Tuple'])('should return an empty array when `@param schema`[Kind] is Kind.%s', (kind) => {})
  it.todo(
    "should return null when `@param schema`[Kind] is 'Union' and the `@param schema`.properties array has no child schemas ",
    () => {}
  )
  it.todo(
    "should return the first value representable by `@param schema`.properties when schema[Kind] is 'Union' and the `@param schema`.properties array has at least one child schema",
    () => {}
  )
  it.todo(
    "should return a new function as represented by `@param schema`.properties.return when schema[Kind] is 'Func'",
    () => {}
  )
  it.todo(
    "should call CreateSchemaValue to create a schema value from (`@param entity`, `@param schema`.properties) when schema[Kind] is 'Required'",
    () => {}
  )
  it.todo(
    "should call CreateSchemaValue to create a schema value from (`@param entity`, `@param schema`.properties) when schema[Kind] is 'NonSerialized'",
    () => {}
  )
  it.todo('should return undefined for every other `@param schema`[Kind] (case: default)', () => {})
}) //:: CreateSchemaValue

describe('CheckSchemaValue', () => {
  describe('case Kind.Null', () => {
    it.todo('should return true if `@param value` is null', () => {})
    it.todo('should return false if `@param value` is not null', () => {})
  }) //:: Kind.Null

  describe('case Kind.Undefined', () => {
    it.todo('should return true if `@param value` is undefined', () => {})
    it.todo('should return false if `@param value` is not undefined', () => {})
  }) //:: Kind.Undefined

  describe('case Kind.Number', () => {
    it.todo("should return true if typeof `@param value` is 'number'", () => {})
    it.todo("should return false if typeof `@param value` is not 'number'", () => {})
  }) //:: Kind.Number

  describe('case Kind.Bool', () => {
    it.todo("should return true if typeof `@param value` is 'boolean'", () => {})
    it.todo("should return false if typeof `@param value` is not 'boolean'", () => {})
  }) //:: Kind.Bool

  describe('case Kind.String', () => {
    it.todo("should return true if typeof `@param value` is 'string'", () => {})
    it.todo("should return false if typeof `@param value` is not 'string'", () => {})
  }) //:: Kind.String

  describe('case Kind.Enum', () => {
    it.todo('should return true if `@param schema`.properties includes `@param value`', () => {})
    it.todo('should return false if `@param schema`.properties does not include `@param value`', () => {})
  }) //:: Kind.Enum

  describe('case Kind.Literal', () => {
    it.todo('should return true if `@param schema`.properties is `@param value`', () => {})
    it.todo('should return false if `@param schema`.properties is not `@param value`', () => {})
  }) //:: Kind.Literal

  describe.each(['Object', 'Class'])('case Kind.%s', () => {
    it.todo('should ignore any `@param schema`.properties or their children when they are not serializable', () => {})
    it.todo('should return false if any of the `@param schema`.properties is not a schema value', () => {})
    it.todo('should return true if all `@param schema`.properties are schema values', () => {})
    it.todo('should return true if `@param schema`[Kind] is Kind.Any', () => {})
  }) //:: [Kind.Object, Kind.Class]

  describe('case Kind.Record', () => {
    it.todo('should return true if `@param schema`.properties.value is not serializable', () => {})
    it.todo(
      "should return false if `@param value` is truthy, its typeof is 'object' and one of its .properties.keys is not a schema value",
      () => {}
    )
    it.todo(
      "should return false if `@param value` is truthy, its typeof is 'object' and one of its .properties.values is not a schema value",
      () => {}
    )
    it.todo(
      "should return true if `@param schema`.properties.value is serializable, `@param value` is falsy of its typeof is not 'object'",
      () => {}
    )
  }) //:: Kind.Record

  describe('case Kind.Array', () => {
    it.todo('should return true if `@param schema`.properties is not serializable', () => {})
    it.todo('should return false if `@param value` is not an array', () => {})
    it.todo('should return true if `@param value` is an array of length 0', () => {})
    it.todo(
      'should return false if `@param value` is an array and at least one of its entries is not a schema value',
      () => {}
    )
    it.todo('should return true if `@param value` is an array and all its entries are schema values', () => {})
  }) //:: Kind.Array

  describe('case Kind.Tuple', () => {
    it.todo('should return false if `@param value` is not an array', () => {})
    it.todo(
      'should return false if `@param value` is an array and at least one of its entries is not a schema value',
      () => {}
    )
    it.todo('should return true if `@param value` is an array and all its entries are schema values', () => {})
  }) //:: Kind.Tuple

  describe('case Kind.Union', () => {
    it.todo('should return false if `@param schema`.properties.length is 0', () => {})
    it.todo('should ignore (continue) any values of `@param schema`.properties that are not serializable', () => {})
    it.todo(
      'should return true if `@param value` is a schema value of any of the `@param schema`.properties fields',
      () => {}
    )
    it.todo(
      'should return false if `@param schema`.properties.length is not 0 and `@param value` is not a schema value of any of the `@param schema`.properties fields',
      () => {}
    )
  }) //:: Kind.Union

  describe.each(['Required', 'Proxy'])('case Kind.%s', () => {
    it.todo(
      'should return true if `@param value` is a schema value of any of the `@param schema`.properties fields',
      () => {}
    )
    it.todo(
      'should return false if `@param value` is not a schema value of any of the `@param schema`.properties fields',
      () => {}
    )
  }) //:: [Kind.Required, Kind.Proxy]

  it.todo.each(['Partial', 'Func', 'NonSerialized'])(
    'should return true if `@param schema`[Kind] is Kind.%s',
    (kind) => {}
  )

  it.todo('should return false for every other `@param schema`[Kind] value  (case: default)', () => {})
}) //:: CheckSchemaValue

describe('CloneSerializable', () => {
  it.todo('should return null if typeof `@param value` is undefined', () => {})
  it.todo('should return `@param value` if its typeof is a value type', () => {})
  it.todo('should return `@param value` if its null', () => {})
  it.todo('should return a duplicate of `@param value` if it is an ArrayBuffer', () => {})
  it.todo(
    'should return a duplicate of `@param value` without any of its NonSerializable entries if it is an Array',
    () => {}
  )
  it.todo(
    'should return a new Set containing all the serializable values of `@param value`.entries() if its a Set',
    () => {}
  )
  it.todo(
    'should return a new Map containing all the serializable values of `@param value`.entries() if its a Map',
    () => {}
  )
  it.todo(
    "should return a new object containing all the serializable values of `@param value` if its typeof is 'object'",
    () => {}
  )
  it.todo(
    "should return NonSerializable if typeof `@param value` is not 'undefined', its typeof is not a value type, and it is not null, an ArrayBuffer, an Array, a Set, a Map or an object",
    () => {}
  )
}) //:: CloneSerializable

describe('SerializeSchema', () => {
  it.todo(
    'should return a deep clone of `@param value` with all its serializable values converted based on `@param schema`',
    () => {}
  )
}) //:: SerializeSchema

describe('ConvertToSchema', () => {
  describe('when `@param schema`.options.serialize is truthy ..', () => {
    it.todo(
      '.. should return the result of calling schema.options.serialize with (`@param value`) as arguments',
      () => {}
    )
  })

  describe('when `@param schema`.options.serialize is falsy ..', () => {
    it.todo.each(['Null', 'Undefined', 'Void', 'Number', 'Bool', 'String', 'Enum', 'Literal', 'Any'])(
      "should return `@param value` when `@param schema`[Kind] is '%s'",
      (kind) => {}
    )
    describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
      describe("when schema.properties has keys, `@param value` is truthy and its typeof is 'object' ..", () => {
        it.todo(
          '.. should return an object that contains all serializable fields of `@param value` converted to schema values',
          () => {}
        )
      })
      describe("when schema.properties has no keys, `@param value` is truthy or its typeof is no 'object' ..", () => {
        it.todo(".. should return null if `@param schema`[Kind] is 'Class'", () => {})
        it.todo(".. should return `@param value` if `@param schema`[Kind] is not 'Class',", () => {})
      })
    }) //:: case: ['Object', 'Class']

    describe("case 'Record'", () => {
      it.todo('should return null if `@param schema`.properties.value is falsy', () => {})
      it.todo(
        "should return a new record object with all the (key:value)s from `@param value` that are not null or undefined converted to schema values if value is truthy and its typeof is 'object'",
        () => {}
      )
      it.todo("should return `@param value` if it is falsy or its typeof is not 'object'", () => {})
    }) //:: case 'Record'

    describe("case 'Array'", () => {
      it.todo('should return null if `@param schema`.properties is not serializable', () => {})
      it.todo(
        'should return a new array with the values of `@param schema`.properties used to convert `@param value` to schema values if value is an array',
        () => {}
      )
      it.todo('should return `@param value` if it is not an array', () => {})
    }) //:: case 'Array'

    describe("case 'Tuple'", () => {
      it.todo(
        'should return a new tuple/array with the values of `@param schema`.properties used to convert `@param value` to schema values if value is an array',
        () => {}
      )
      it.todo('should return `@param value` if it is not an array', () => {})
    }) //:: case 'Tuple'

    describe("case 'Union'", () => {}) //:: case 'Union'
    it.todo('should return null if `@param schema`.properties has no values', () => {})
    it.todo('should ignore (continue) all values of `@param schema`.properties that are not serializable', () => {})
    it.todo(
      'should return `@param value` converted to the first entry of `@param schema`.properties that matches its value',
      () => {}
    )
    it.todo('should return null if no entry of `@param schema`.properties that matches `@param value`', () => {})

    describe.each(['Partial', 'Required', 'Proxy'])('case %s', (kind) => {
      it.todo(
        'should flatten the schema and return `@param value` converted to the schema defined by `@param schema`.properties',
        () => {}
      )
    }) //:: case: ['Partial', 'Required', 'Proxy']

    it.todo("should return undefined when `@param schema`[Kind] is 'NonSerialized'", () => {})
    it.todo('should return null for every other value of `@param schema`[Kind]  (case: default)', () => {})
  })
}) //:: ConvertToSchema
