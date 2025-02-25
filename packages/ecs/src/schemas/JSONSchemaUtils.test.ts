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

describe('HasRequiredSchema', () => {}) //:: HasRequiredSchema
describe('HasRequiredSchemaValues', () => {}) //:: HasRequiredSchemaValues
describe('HasSchemaValidators', () => {}) //:: HasSchemaValidators
describe('HasValidSchemaValues', () => {}) //:: HasValidSchemaValues
describe('requiresDeserialization', () => {}) //:: requiresDeserialization
describe('IsSingleValueSchema', () => {}) //:: IsSingleValueSchema
describe('CreateSchemaValue', () => {}) //:: CreateSchemaValue
describe('CloneSerializable', () => {}) //:: CloneSerializable
describe('CheckSchemaValue', () => {}) //:: CheckSchemaValue
describe('ConvertToSchema', () => {}) //:: ConvertToSchema
describe('SerializeSchema', () => {}) //:: SerializeSchema
