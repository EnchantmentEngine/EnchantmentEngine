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

describe('DeserializeSchemaValue', () => {}) //:: DeserializeSchemaValue
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
