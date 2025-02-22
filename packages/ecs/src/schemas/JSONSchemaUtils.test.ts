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

import { Schema } from './JSONSchemaTypes'
import { HasSchemaDeserializers } from './JSONSchemaUtils'

/**
 * @description Returns an object nested to `@param depth` levels of depth.
 * Adds the given `@param value` to each level of the object with fieldname `nested`
 * */
export function createDeeplyNestedObject<T extends object>(depth: number, value?: T): T {
  /* @todo Move out of this file into tests/utils */
  let result = { nested: value } as T
  for (let level = 0; level < depth; ++level) {
    let current = result
    for (let field = 0; field <= level; ++field) {
      current[field] = current[field] || {}
      current = current[field]
    }
    current['nested'] = value
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
        // @ts-expect-error Coerce string into Schema
        HasSchemaDeserializers(42)
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce string into Schema
        HasSchemaDeserializers('TestString')
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce string into Schema
        HasSchemaDeserializers({ thing: 42 })
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce string into Schema
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
      const emptySchema = {} as Schema
      // 3. Set input & dependencies data
      const schema = createDeeplyNestedObject(nested.depth, emptySchema)
      // 1. Sanity check (input & dependencies)
      // 2. Run the process
      const result = HasSchemaDeserializers(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
    it.todo(
      'should return false if the toplevel of the `@param schema` object has a falsy .options?.deserialize field and has no children',
      () => {}
    )
    it.todo(
      'should return true if the toplevel of the `@param schema` object has a falsy .options?.deserialize field but has a children where it is truthy',
      () => {}
    )
    it.todo(
      'should return true if the toplevel of the `@param schema` object has a falsy .options?.deserialize field, all its children have no such field, but has a deeply nested children where it is truthy',
      () => {}
    )
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
