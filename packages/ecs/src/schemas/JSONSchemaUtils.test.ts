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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEntity, removeEntity } from '../ComponentFunctions'
import { createEngine, destroyEngine } from '../Engine'
import { Entity, UndefinedEntity } from '../Entity'
import { Kind, NonSerializable, Schema, TArraySchema, TEnumSchema } from './JSONSchemaTypes'
import {
  CheckSchemaValue,
  CloneSerializable,
  CreateSchemaValue,
  DeserializeSchemaValue,
  HasRequiredSchema,
  HasRequiredSchemaValues,
  HasSchemaDeserializers,
  HasSchemaValidators,
  HasValidSchemaValues,
  IsSingleValueSchema,
  JSONSchemaUtilsFunctions,
  requiresDeserialization,
  SerializeSchema
} from './JSONSchemaUtils'

/**
 * @description Returns an object nested to `@param depth` levels of depth.
 * Adds the given `@param value` to each level of the object with fieldname `properties`
 * */
export function createDeeplyNestedSchemaObject<T extends object>(depth: number, value?: T): T {
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
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEngine()
  })

  it('should return the result of `@param schema.options.deserialize` with (`@param curr`, `@param value`) as args when `@param value` is not null or undefined, and deserialize is truthy', () => {
    const Expected = 42
    // 3. Set input & dependencies data
    const schema = { options: { deserialize: (_, __) => Expected } } as Schema
    const curr = {}
    const value = {}
    // 1. Sanity check (input & dependencies)
    expect(value).not.toBeNull()
    expect(value).not.toBeUndefined()
    expect(schema.options?.deserialize).toBeTruthy()
    // 2. Run the process
    const result = DeserializeSchemaValue(testEntity, schema, curr, value)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  describe('case: Kind.Number', () => {
    const TestSchemaKind = 'Number'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return undefined when typeof `@param value` is not 'number'", () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = false
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).not.toBe('number')
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return `@param value` when its typeof is 'number'", () => {
      const Expected = 42
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).toBe('number')
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Number

  describe('case: Kind.Bool', () => {
    const TestSchemaKind = 'Bool'
    const TestValueTypeof = 'boolean'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return undefined when typeof `@param value` is not 'boolean'", () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = 'IncorrectValue'
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).not.toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return `@param value` when its typeof is 'boolean'", () => {
      const Expected = false
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Bool

  describe('case: Kind.String', () => {
    const TestSchemaKind = 'String'
    const TestValueTypeof = 'string'
    const StringProtoValue = '__proto__'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return undefined when typeof `@param value` is not 'string'", () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = false
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).not.toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return undefined when `@param value` is '__proto__'", () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = '__proto__'
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(value).toBe(StringProtoValue)
      expect(typeof value).toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return `@param value` when it is not null/undefined, its typeof is 'string' and its value is not '__proto__'", () => {
      const Expected = 'SomeTestString'
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(value).not.toBe(StringProtoValue)
      expect(typeof value).toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.String

  describe('case: Kind.Enum', () => {
    const TestSchemaKind = 'Enum'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return undefined when `@param value` is not contained in the enum's schema", () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const properties = {} as TEnumSchema<Record<string, string | number>>['properties']
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = 42
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).toBeTruthy()
      expect(Object.values(properties).includes(value)).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return `@param value` when its value is contained in the enum's schema", () => {
      const Expected = 42
      // 3. Set input & dependencies data
      const properties = { one: 1, two: Expected } as TEnumSchema<Record<string, string | number>>['properties']
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).toBeTruthy()
      expect(Object.values(properties).includes(value)).toBeTruthy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Enum

  describe('case: Kind.Literal', () => {
    const TestSchemaKind = 'Literal'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return undefined when `@param value` is not equal to `@param schema`.properties', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const properties = 21
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = 42
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(value).not.toBe(properties)
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).toBeTruthy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when its value is equal to `@param schema`.properties', () => {
      const Expected = 42
      // 3. Set input & dependencies data
      const properties = Expected
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = properties
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(value).toBe(properties)
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).toBeTruthy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Literal

  describe('case: Kind.Array', () => {
    const TestSchemaKind = 'Array'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return undefined when Array.isArray( `@param value` ) is falsy', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = 42
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(Array.isArray(value)).toBeFalsy()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should add default values to `@param curr` when its .length is less than `@param value`.length', () => {
      const Expected = [0, 0, 0, 0, 0]
      // 3. Set input & dependencies data
      const options = { deserialize: undefined }
      const properties = { [Kind]: 'Number' } as TArraySchema<Schema>['properties']
      const schema = { [Kind]: TestSchemaKind, options: options, properties: properties } as Schema
      const curr = []
      const invalid = [
        { [Kind]: 'Null', properties: null, options: options } as Schema,
        { [Kind]: 'Undefined', properties: undefined, options: options } as Schema
      ]
      const valid = [
        { [Kind]: 'Number', properties: 42, options: options } as Schema,
        { [Kind]: 'String', properties: 'someString', options: options } as Schema,
        { [Kind]: 'Bool', properties: false, options: options } as Schema
      ]
      const value = [40, 41, 42, 43, 44]
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(Array.isArray(value)).toBeTruthy()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      expect(curr.length).lessThan(value.length)
      const before = curr
      expect(before).not.toEqual(Expected)
      // 2. Run the process
      DeserializeSchemaValue(testEntity, schema, curr, value)
      const result = curr
      // 4. Check the result (output)
      expect(result.length).toEqual(Expected.length)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return a new array based on deserializing every entry of `@param value` and ignoring any of the entries that are not valid values', () => {
      const Expected = [40, 41, 42, 43, 44]
      // 3. Set input & dependencies data
      const options = { deserialize: undefined }
      const properties = { [Kind]: 'Number' } as TArraySchema<Schema>['properties']
      const schema = { [Kind]: TestSchemaKind, options: options, properties: properties } as Schema
      const curr = [1, 2, 3, 4, 5]
      const value = [...Expected, undefined, null]
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(Array.isArray(value)).toBeTruthy()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      expect(curr.length).not.toBe(value.length)
      const before = value
      expect(before).not.toEqual(Expected)
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)!
      // 4. Check the result (output)
      expect(result.length).toEqual(Expected.length)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param curr` if `@param value` is an array and an error is thrown while deserializing its entries', () => {
      const Expected = [40, 41, 42, 43, 44]
      // 3. Set input & dependencies data
      const options = { deserialize: undefined }
      const properties = undefined // This makes `value.map` throw an error and trigger the `catch(e) return curr` branch
      const schema = { [Kind]: TestSchemaKind, options: options, properties: properties } as Schema
      const curr = Expected
      const value = [0, 1, 2, 3, 4]
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(Array.isArray(value)).toBeTruthy()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).toBeUndefined()
      expect(curr.length).toBe(value.length)
      const before = value
      expect(before).not.toEqual(Expected)
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)!
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Array

  describe('case: Kind.Tuple', () => {
    const TestSchemaKind = 'Tuple'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return undefined when Array.isArray( `@param value` ) is falsy', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = 42
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(Array.isArray(value)).toBeFalsy()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return a new tuple array with the deserialized values of `@param value`, and replacing each nullish entry with the respective entry from `@param curr`', () => {
      const Expected = [40, '41_String', 42, '43_String', false]
      // 3. Set input & dependencies data
      const properties = [
        { [Kind]: 'Number' } as Schema,
        { [Kind]: 'String' } as Schema,
        { [Kind]: 'Number' } as Schema,
        { [Kind]: 'String' } as Schema,
        { [Kind]: 'Bool' } as Schema
      ]
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = [0, Expected[1], 2, Expected[3], true]
      const value = [Expected[0], undefined, Expected[2], null, Expected[4]]
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(Array.isArray(value)).toBeTruthy()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).toBeTruthy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Tuple

  describe('case: Kind.Object', () => {
    const TestSchemaKind = 'Object'
    const TestValueTypeof = 'object'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return undefined if typeof `@param value` when is not 'object'", () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = 'IncorrectValue'
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).not.toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should ignore every key of `@param value` (continue) that is not described by `@param schema`.properties', () => {
      const Expected = { valid1: 1, valid2: true, valid3: 'String' }
      // 3. Set input & dependencies data
      const properties = {
        valid1: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
        valid2: { [Kind]: 'Bool', options: { deserialize: undefined } } as Schema,
        valid3: { [Kind]: 'String', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = { valid1: 1, valid2: true, valid3: 'String', ignore: 'IgnoredField' }
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should add the respective field of `@param curr` to the result if that same field at `@param value` represents an invalid value', () => {
      const Expected = { valid1: 1, valid2: true, valid3: 'ValidString', missing: 'MissingString' }
      // 3. Set input & dependencies data
      const properties = {
        valid1: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
        valid2: { [Kind]: 'Bool', options: { deserialize: undefined } } as Schema,
        valid3: { [Kind]: 'String', options: { deserialize: undefined } } as Schema,
        missing: { [Kind]: 'String', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = { missing: Expected.missing }
      const value = {
        valid1: Expected.valid1,
        valid2: Expected.valid2,
        valid3: Expected.valid3,
        missing: undefined,
        ignore: 'IgnoredField'
      } as any
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return a new object that contains every valid field of `@param value` deserialized', () => {
      const Expected = { valid1: 1, valid2: true, valid3: 'ValidString' }
      // 3. Set input & dependencies data
      const properties = {
        valid1: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
        valid2: { [Kind]: 'Bool', options: { deserialize: undefined } } as Schema,
        valid3: { [Kind]: 'String', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = {
        valid1: Expected.valid1,
        valid2: Expected.valid2,
        valid3: Expected.valid3,
        invalid1: undefined,
        invalid2: null
      }
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should not add any field of `@param value` to the result when deserializing it results in an undefined value', () => {
      const Expected = { valid1: 1, valid2: true }
      // 3. Set input & dependencies data
      const properties = {
        valid1: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
        valid2: { [Kind]: 'Bool', options: { deserialize: undefined } } as Schema,
        valid3: { [Kind]: 'String', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const invalid = 42
      const value = { valid1: Expected.valid1, valid2: Expected.valid2, valid3: invalid }
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(typeof value).toBe(TestValueTypeof)
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Object

  describe('case: Kind.Class', () => {
    const TestSchemaKind = 'Class'

    it('should return `@param value` when it is null', () => {
      const Expected = null
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should mutate every `@param value` field to its deserialized value when value[key] is a valid value', () => {
      const Expected = { test: { one: 4, two: 5 } }
      // 3. Set input & dependencies data
      const properties = {
        test: {
          [Kind]: 'Object',
          options: { deserialize: undefined },
          properties: {
            one: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
            two: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = { test: { one: 21, two: 22 } }
      const value = { test: { one: 4 as unknown, two: 5 as unknown } }
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(value)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should mutate every `@param value` field to its respective curr[key] when value[key] is an invalid value', () => {
      const Expected = { test: 42 }
      // 3. Set input & dependencies data
      const properties = {
        test: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = { test: Expected.test }
      const value = { test: undefined } as any
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(value)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return `@param value`', () => {
      const Expected = { test: 42 }
      // 3. Set input & dependencies data
      const properties = {
        test: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Class

  describe.each(['Required', 'Proxy', 'NonSerialized', 'Partial'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it('should call DeserializeSchemaValue by passing the same arguments and `@param schema`.properties as the schema parameter value', () => {
      const Expected = 42
      // 3. Set input & dependencies data
      const properties = { [Kind]: 'Number', options: { deserialize: undefined } } as Schema
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).not.toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: [Kind.Required, Kind.Proxy, Kind.NonSerialized, Kind.Partial]

  describe('case: Kind -> default', () => {
    const TestSchemaKind = 'UnknownKind'

    it('should return `@param value` for any other Kind', () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      // @ts-expect-error Coerce an invalid Kinds string into the Kind sympol field
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected
      // 1. Sanity check (input & dependencies)
      expect(value).not.toBeNull()
      expect(value).toBeUndefined()
      expect(schema.options?.deserialize).toBeFalsy()
      // 2. Run the process
      const result = DeserializeSchemaValue(testEntity, schema, curr, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
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
        HasSchemaDeserializers(createDeeplyNestedSchemaObject(depth, schema))
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
      const schema = createDeeplyNestedSchemaObject(nested.depth, emptySchema)
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
  it('should return false if `@param schema` has no children and does not have a Kind.Required field', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const schema = { [Kind]: 'Number', properties: undefined } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = HasRequiredSchema(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return false if `@param schema` has children, does not have a Kind.Required field and none of its children have it either', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const children = {
      child1: child,
      child2: child,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).not.toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = HasRequiredSchema(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return true if `@param schema` has a Kind.Required field', () => {
    const Expected = true
    // 3. Set input & dependencies data
    const schema = { [Kind]: 'Required', properties: undefined } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).toBeUndefined()
    expect(schema[Kind]).toBe('Required')
    // 2. Run the process
    const result = HasRequiredSchema(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  /** @todo Why is this setup not returning true ?? */
  it('should return true if `@param schema` has children, does not have a Kind.Required field and at least one of its children have a Kind.Required field ', () => {
    const Expected = true
    // 3. Set input & dependencies data
    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const required = { [Kind]: 'Required', properties: child } as Schema
    const children = {
      child1: child,
      child2: required,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).not.toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = HasRequiredSchema(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: HasRequiredSchema

describe('HasSchemaValidators', () => {
  it('should return false if `@param schema` has no children and does not have an .options.validate field', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const schema = { [Kind]: 'Number', properties: undefined } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).toBeUndefined()
    expect(schema.options?.validate).toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = HasSchemaValidators(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return false if `@param schema` has children, does not have an .options.validate field and none of its children have it either', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const children = {
      child1: child,
      child2: child,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).not.toBeUndefined()
    expect(schema.options?.validate).toBeUndefined()
    expect(child.options?.validate).toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = HasSchemaValidators(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return true if `@param schema` has an .options.validate field', () => {
    const Expected = true
    // 3. Set input & dependencies data
    const schema = { [Kind]: 'Number', options: { validate: (_, __, ____) => {} }, properties: undefined } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).toBeUndefined()
    expect(schema.options?.validate).not.toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = HasSchemaValidators(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return true if `@param schema` has children, does not have an .options.validate field and at least one of its children have an .options.validate field ', () => {
    const Expected = true
    // 3. Set input & dependencies data
    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const validate = { [Kind]: 'Any', options: { validate: (_, __, ____) => {} }, properties: undefined } as Schema
    const children = {
      child1: child,
      child2: validate,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).not.toBeUndefined()
    expect(schema.options?.validate).toBeUndefined()
    expect(child.options?.validate).toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = HasSchemaValidators(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: HasSchemaValidators

describe('requiresDeserialization', () => {
  it('should return false if `@param schema` has no children and does not have an .options.deserialize field', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const schema = { [Kind]: 'Number', properties: undefined } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).toBeUndefined()
    expect(schema.options?.serialize).toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = requiresDeserialization(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return false if `@param schema` has children, does not have an .options.deserialize field and none of its children have it either', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const children = {
      child1: child,
      child2: child,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).not.toBeUndefined()
    expect(schema.options?.deserialize).toBeUndefined()
    expect(child.options?.deserialize).toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = requiresDeserialization(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return true if `@param schema` has an .options.deserialize field', () => {
    const Expected = true
    // 3. Set input & dependencies data
    const schema = { [Kind]: 'Number', options: { deserialize: (_, __) => {} }, properties: undefined } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).toBeUndefined()
    expect(schema.options?.deserialize).not.toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = requiresDeserialization(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return true if `@param schema` has children, does not have an .options.deserialize field and at least one of its children have an .options.deserialize field ', () => {
    const Expected = true
    // 3. Set input & dependencies data
    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const validate = { [Kind]: 'Any', options: { deserialize: (_, __) => {} }, properties: undefined } as Schema
    const children = {
      child1: child,
      child2: validate,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).not.toBeUndefined()
    expect(schema.options?.deserialize).toBeUndefined()
    expect(child.options?.deserialize).toBeUndefined()
    expect(schema[Kind]).not.toBe('Required')
    // 2. Run the process
    const result = requiresDeserialization(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: requiresDeserialization

describe('IsSingleValueSchema', () => {
  it('should return false if `@param schema` is falsy', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const schema = undefined
    // 1. Sanity check (input & dependencies)
    expect(schema).toBeFalsy()
    // 2. Run the process
    const result = IsSingleValueSchema(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return false if `@param schema`[Kind] is falsy', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const schema = {} as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema).toBeTruthy()
    // 2. Run the process
    const result = IsSingleValueSchema(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  describe.each([
    'Null',
    'Undefined',
    'Void',
    'Number',
    'Bool',
    'String',
    'Enum',
    'Literal',
    'Class',
    'Array',
    'Tuple',
    'Func'
  ])('case: Kind.%s', (kind) => {
    it('should return true', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const schema = { [Kind]: kind } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      // 2. Run the process
      const result = IsSingleValueSchema(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  })

  describe.each(['Any', 'Object', 'Record', 'Partial'])('case: Kind.%s', (kind) => {
    it('should return false', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const schema = { [Kind]: kind } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      // 2. Run the process
      const result = IsSingleValueSchema(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  })

  describe('case: Kind.Union', () => {
    const TestSchemaKind = 'Union'

    it('should return false when `@param schema`.properties has no values', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const properties = {} as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = IsSingleValueSchema(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if any of the `@param schema`.properties is not a single value schema', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'Object' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      expect(Object.keys(schema.properties!).length).not.toBe(0)
      // 2. Run the process
      const result = IsSingleValueSchema(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return true if `@param schema`.properties has values and all of them are single value schemas', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const properties = [{ [Kind]: 'Number' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      expect(Object.keys(schema.properties!).length).not.toBe(0)
      // 2. Run the process
      const result = IsSingleValueSchema(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Union

  describe.each(['NonSerialized', 'Required', 'Proxy'])('case: Kind.%s', (kind) => {
    it('should return the result of IsSingleValueSchema( `@param schema`.properties )', () => {
      // 3. Set input & dependencies data
      const properties = { [Kind]: kind } as Schema
      const schema = { [Kind]: kind, properties: properties } as Schema
      const Expected = IsSingleValueSchema(schema.properties as Schema)
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      // 2. Run the process
      const result = IsSingleValueSchema(schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  })

  it('should return false if `@param schema`[Kind] is a value that is not mapped', () => {
    const Expected = false
    // 3. Set input & dependencies data
    // @ts-expect-error Coerce an invalid Kinds string into the Kind sympol field
    const schema = { [Kind]: 'IncorrectKind' } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema).toBeTruthy()
    // 2. Run the process
    const result = IsSingleValueSchema(schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: IsSingleValueSchema

describe('HasRequiredSchemaValues', () => {
  describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it("should call HasRequiredSchemaValues recursively and return [false, 'fieldName'] when one of the fields of `@param schema`.properties or its children does not have a valid value", () => {
      const Expected = [false, 'wrongKey']
      // 3. Set input & dependencies data
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        container: {
          [Kind]: 'Object',
          properties: {
            wrongKey: { [Kind]: 'Required' } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', container: { wrongKey: undefined } }
      const currentKey = 'TestKey'
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasRequiredSchemaValues(schema, value, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return [true, ''] when all fields of `@param schema`.properties and its children have valid values", () => {
      const Expected = [true, '']
      // 3. Set input & dependencies data
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO' }
      const currentKey = 'TestKey'
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasRequiredSchemaValues(schema, value, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: [Kind.Object, Kind.Class]

  describe.each(['Proxy', 'Partial', 'NonSerialized'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it('should return the result of calling HasRequiredSchemaValues with (`@param schema`.properties, `@param value`) as arguments', () => {
      // 3. Set input & dependencies data
      const OtherKey = 'other'
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          [OtherKey]: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', other: undefined }
      const currentKey = 'TestKey'
      const Expected = HasRequiredSchemaValues(schema.properties as Schema, value, currentKey)
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasRequiredSchemaValues(schema, value, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      expect(result[1]).toBe(OtherKey)
      // 5? Cleanup (dependencies)
    })
  }) //:: [Kind.Proxy, Kind.Partial, Kind.NonSerialized]

  describe('case: Kind.Required', () => {
    const TestSchemaKind = 'Required'

    it('should return [false, `@param current`] when `@param value` is null', () => {
      const Expected = [false, 'CurrentKey'] as [boolean, string]
      // 3. Set input & dependencies data
      const OtherKey = Expected[1]
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          [OtherKey]: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = null
      const currentKey = Expected[1]
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasRequiredSchemaValues(schema, value, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      expect(result[1]).toBe(OtherKey)
      // 5? Cleanup (dependencies)
    })

    it('should return [false, `@param current`] when `@param value` is undefined', () => {
      const Expected = [false, 'CurrentKey'] as [boolean, string]
      // 3. Set input & dependencies data
      const OtherKey = Expected[1]
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          [OtherKey]: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = undefined
      const currentKey = Expected[1]
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasRequiredSchemaValues(schema, value, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      expect(result[1]).toBe(OtherKey)
      // 5? Cleanup (dependencies)
    })

    it('should return [true, `@param current`] when `@param value` is not null or undefined', () => {
      const Expected = [true, 'CurrentKey'] as [boolean, string]
      // 3. Set input & dependencies data
      const OtherKey = Expected[1]
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          [OtherKey]: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO' }
      const currentKey = Expected[1]
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasRequiredSchemaValues(schema, value, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      expect(result[1]).toBe(OtherKey)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Required

  describe('case: default', () => {
    const TestSchemaKind = 'UnknownKind' as any

    it("should return [true, ''] when `@param schema`[Kind] is not one of [Kind.Object, Kind.Class, Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Required]", () => {
      const Expected = [true, ''] as [boolean, string]
      // 3. Set input & dependencies data
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          otherKey: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO' }
      const currentKey = 'TestKey'
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasRequiredSchemaValues(schema, value, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: default
}) //:: HasRequiredSchemaValues

describe('HasValidSchemaValues', () => {
  describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it("should call HasValidSchemaValues recursively and return [false, 'fieldName'] when one of the fields of `@param schema`.properties or its children does not have a valid value", () => {
      const Expected = [false, 'wrongKey'] as [boolean, string]
      // 3. Set input & dependencies data
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        container: {
          [Kind]: 'Object',
          properties: {
            [Expected[1]]: { [Kind]: 'Number', options: { validate: (_, __, ___) => false } } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', container: { [Expected[1]]: 'InvalidNumber' } }
      const prev = { one: 61, two: 'prev_TWO', container: { [Expected[1]]: 'prev_InvalidNumber' } }
      const testEntity = 12345 as Entity
      const currentKey = 'TestKey'
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasValidSchemaValues(schema, value, prev, testEntity, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return [true, ''] when all fields of `@param schema`.properties and its children have valid values", () => {
      const Expected = [true, ''] as [boolean, string]
      // 3. Set input & dependencies data
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        container: {
          [Kind]: 'Object',
          properties: {
            [Expected[1]]: { [Kind]: 'Number' } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = {}
      const prev = {}
      const testEntity = 12345 as Entity
      const currentKey = 'TestKey'
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasValidSchemaValues(schema, value, prev, testEntity, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: [Kind.Object, Kind.Class]

  describe.each(['Proxy', 'Partial', 'NonSerialized', 'Partial'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it('should return the result of calling HasValidSchemaValues with (`@param schema`.properties, `@param value`, `@param prev`, `@param entity`) as arguments', () => {
      const Expected = [false, 'wrongKey'] as [boolean, string]
      // 3. Set input & dependencies data
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          container: {
            [Kind]: 'Object',
            properties: {
              [Expected[1]]: { [Kind]: 'Number', options: { validate: (_, __, ___) => false } } as Schema
            }
          } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', container: { [Expected[1]]: 'InvalidNumber' } }
      const prev = { one: 61, two: 'prev_TWO', container: { [Expected[1]]: 'prev_InvalidNumber' } }
      const testEntity = 12345 as Entity
      const currentKey = 'TestKey'
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasValidSchemaValues(schema, value, prev, testEntity, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: [Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Partial]

  describe('case: default', () => {
    const TestSchemaKind = 'UnknownKind' as any

    it("should return [true, ''] when `@param schema`[Kind] is not one of [Kind.Object, Kind.Class, Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Required]", () => {
      const Expected = [true, ''] as [boolean, string]
      // 3. Set input & dependencies data
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          container: {
            [Kind]: 'Object',
            properties: {
              [Expected[1]]: { [Kind]: 'Number', options: { validate: (_, __, ___) => false } } as Schema
            }
          } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', container: { [Expected[1]]: 'InvalidNumber' } }
      const prev = { one: 61, two: 'prev_TWO', container: { [Expected[1]]: 'prev_InvalidNumber' } }
      const testEntity = 12345 as Entity
      const currentKey = 'TestKey'
      // 1. Sanity check (input & dependencies)
      expect(schema).toBeTruthy()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = HasValidSchemaValues(schema, value, prev, testEntity, currentKey)
      // 4. Check the result (output)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: default
}) //:: HasValidSchemaValues

describe('CreateSchemaValue', () => {
  it('should return a deepcopy of `@param schema`.options.default when it is not a function, options is truthy and options has a field called default', () => {
    const Expected = { one: 41, two: 42 }
    // 3. Set input & dependencies data
    const defaultField = structuredClone(Expected)
    const schema = { options: { default: defaultField } } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema.options).toBeTruthy()
    expect(typeof schema.options?.default).not.toBe('function')
    expect('default' in schema.options!).not.toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return the result of `@param schema`.options.default() when it is a function, options is truthy and options has a field called default', () => {
    const Expected = { one: 41, two: 42 }
    // 3. Set input & dependencies data
    const schema = { options: { default: () => Expected } } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema.options).toBeTruthy()
    expect(typeof schema.options?.default).toBe('function')
    expect('default' in schema.options!).not.toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it.each([
    [null, 'Null'],
    [undefined, 'Undefined'],
    [undefined, 'Void'],
    [0, 'Number'],
    [false, 'Bool'],
    ['', 'String']
  ])('should return %s when `@param schema`[Kind] is %s', (Expected, kind) => {
    // 3. Set input & dependencies data
    const schema = { [Kind]: kind } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema[Kind]).toBeTruthy()
    expect(schema.options).not.toBeTruthy()
    expect(schema.options?.default).toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it("should return the first value that can be represented by the `@param schema`.properties enum when schema[Kind] is 'Enum'", () => {
    const Expected = 42
    // 3. Set input & dependencies data
    const kind = 'Enum'
    const properties = { expectedValue: Expected, One: 1, Two: 2 }
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema[Kind]).toBeTruthy()
    expect(schema.options).not.toBeTruthy()
    expect(schema.options?.default).toBeUndefined()
    expect(schema.properties).not.toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it("should return `@param schema`.properties when schema[Kind] is 'Literal'", () => {
    const Expected = { thing: 42 }
    // 3. Set input & dependencies data
    const kind = 'Literal'
    const properties = Expected
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema[Kind]).toBeTruthy()
    expect(schema.options).not.toBeTruthy()
    expect(schema.options?.default).toBeUndefined()
    expect(schema.properties).not.toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it.each(['Object', 'Class'])(
    'should create an object as defined by `@schema properties` with all proxies flattened (Kind.Proxy) when `@param schema`[Kind] is Kind.%s',
    (kind) => {
      const Expected = { one: 42, two: 'SomeString' }
      // 3. Set input & dependencies data
      const schema = {
        [Kind]: kind,
        properties: {
          one: {
            [Kind]: 'Proxy',
            options: {
              create: () => {
                return Expected.one
              }
            },
            properties: { [Kind]: 'Number' }
          } as unknown as Schema,
          two: {
            [Kind]: 'Proxy',
            options: {
              create: () => {
                return Expected.two
              }
            },
            properties: { [Kind]: 'String' }
          } as unknown as Schema
        }
      } as Schema
      const testEntity = 12345 as Entity
      // 1. Sanity check (input & dependencies)
      expect(schema[Kind]).toBeTruthy()
      expect(schema.options).not.toBeTruthy()
      expect(schema.options?.default).toBeUndefined()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = CreateSchemaValue(testEntity, schema)
      // 4. Check the result (output)
      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    }
  )

  it.each(['Any', 'Record', 'Partial'])(
    'should return an empty object when `@param schema`[Kind] is Kind.%s',
    (kind) => {
      const Expected = {}
      // 3. Set input & dependencies data
      const schema = { [Kind]: kind } as Schema
      const testEntity = 12345 as Entity
      // 1. Sanity check (input & dependencies)
      expect(schema[Kind]).toBeTruthy()
      expect(schema.options).not.toBeTruthy()
      expect(schema.options?.default).toBeUndefined()
      // 2. Run the process
      const result = CreateSchemaValue(testEntity, schema)
      // 4. Check the result (output)
      expect(typeof result).toBe(typeof Expected)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    }
  )

  it.each(['Array', 'Tuple'])('should return an empty array when `@param schema`[Kind] is Kind.%s', (kind) => {
    const Expected = []
    // 3. Set input & dependencies data
    const schema = { [Kind]: kind } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema[Kind]).toBeTruthy()
    expect(schema.options).not.toBeTruthy()
    expect(schema.options?.default).toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(Array.isArray(result)).toBeTruthy()
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it("should return null when `@param schema`[Kind] is 'Union' and the `@param schema`.properties array has no child schemas ", () => {
    const Expected = null
    // 3. Set input & dependencies data
    const kind = 'Union'
    const properties = []
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema[Kind]).toBeTruthy()
    expect(schema.options).not.toBeTruthy()
    expect(schema.options?.default).toBeUndefined()
    expect(schema.properties).not.toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it("should return the first value representable by `@param schema`.properties when schema[Kind] is 'Union' and the `@param schema`.properties array has at least one child schema", () => {
    const Expected = 0
    // 3. Set input & dependencies data
    const kind = 'Union'
    const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema[Kind]).toBeTruthy()
    expect(schema.options).not.toBeTruthy()
    expect(schema.options?.default).toBeUndefined()
    expect(schema.properties).not.toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    expect(result).not.toEqual('')
    // 5? Cleanup (dependencies)
  })

  it("should return a new function as represented by `@param schema`.properties.return when schema[Kind] is 'Func'", () => {
    const Expected = 0
    // 3. Set input & dependencies data
    const kind = 'Func'
    const returnSchema = { [Kind]: 'Number' } as Schema
    const properties = { params: [], return: returnSchema }
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema[Kind]).toBeTruthy()
    expect(schema.options).not.toBeTruthy()
    expect(schema.options?.default).toBeUndefined()
    expect(schema.properties).not.toBeUndefined()
    // 2. Run the process
    const result = (CreateSchemaValue(testEntity, schema) as any)()
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    expect(result).not.toEqual('')
    // 5? Cleanup (dependencies)
  })

  it.each(['Required', 'NonSerialized'])(
    'should call CreateSchemaValue to create a schema value from (`@param entity`, `@param schema`.properties) when schema[Kind] is %s',
    (kind) => {
      const Expected = 0
      // 3. Set input & dependencies data
      const properties = {
        [Kind]: 'Union',
        properties: [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      }
      const schema = { [Kind]: kind, properties: properties } as Schema
      const testEntity = 12345 as Entity
      // 1. Sanity check (input & dependencies)
      expect(schema[Kind]).toBeTruthy()
      expect(schema.options).not.toBeTruthy()
      expect(schema.options?.default).toBeUndefined()
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = CreateSchemaValue(testEntity, schema)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
      expect(result).not.toEqual('')
      // 5? Cleanup (dependencies)
    }
  )

  it('should return undefined for every other `@param schema`[Kind] (case: default)', () => {
    const Expected = undefined
    // 3. Set input & dependencies data
    const kind = 'UnknownKind' as any
    const properties = { [Kind]: 'Union', properties: [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema] }
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity
    // 1. Sanity check (input & dependencies)
    expect(schema[Kind]).toBeTruthy()
    expect(schema.options).not.toBeTruthy()
    expect(schema.options?.default).toBeUndefined()
    expect(schema.properties).not.toBeUndefined()
    // 2. Run the process
    const result = CreateSchemaValue(testEntity, schema)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    expect(result).not.toEqual('')
    // 5? Cleanup (dependencies)
  })
}) //:: CreateSchemaValue

describe('CheckSchemaValue', () => {
  describe.each([
    ['Null', { one: null, two: 42 }],
    ['Undefined', { one: undefined, two: 42 }]
  ])('case Kind.%s', (kind, value) => {
    it(`should return true if '@param value' is ${value.one}`, () => {
      const Expected = true
      // 3. Set input & dependencies data
      const schema = { [Kind]: kind } as Schema
      // 1. Sanity check (input & dependencies)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value.one)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it(`should return false if '@param value' is not ${value.one}`, () => {
      const Expected = false
      // 3. Set input & dependencies data
      const schema = { [Kind]: kind } as Schema
      // 1. Sanity check (input & dependencies)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value.two)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Null

  describe.each([
    ['Number', 'number', { one: 1, two: false }],
    ['Bool', 'boolean', { one: false, two: 42 }],
    ['String', 'string', { one: 'SomeString', two: 42 }]
  ])('case Kind.%s', (kind, typ, value) => {
    it("should return true if typeof `@param value` is 'number'", () => {
      const Expected = true
      // 3. Set input & dependencies data
      const schema = { [Kind]: kind } as Schema
      // 1. Sanity check (input & dependencies)
      expect(typeof value.one).toBe(typ)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value.one)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return false if typeof `@param value` is not 'number'", () => {
      const Expected = false
      // 3. Set input & dependencies data
      const schema = { [Kind]: kind } as Schema
      // 1. Sanity check (input & dependencies)
      expect(typeof value.two).not.toBe(typ)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value.two)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Number

  describe('case Kind.Enum', () => {
    const TestSchemaKind = 'Enum'

    it('should return true if `@param schema`.properties includes `@param value`', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = 42
      const properties = { expectedValue: value, One: 1, Two: 2 }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(Object.values(schema.properties!).includes(value)).toBeTruthy()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if `@param schema`.properties does not include `@param value`', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = 42
      const properties = { One: 1, Two: 2 }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(Object.values(schema.properties!).includes(value)).toBeFalsy()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Enum

  describe('case Kind.Literal', () => {
    const TestSchemaKind = 'Literal'

    it('should return true if `@param schema`.properties is `@param value`', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = { one: 42 }
      const properties = value
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.properties!).toBe(value)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if `@param schema`.properties is not `@param value`', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = { one: 41 }
      const properties = { two: 42 }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.properties!).not.toBe(value)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Literal

  describe.each(['Object', 'Class'])('case Kind.%s', (kind) => {
    it('should ignore any `@param schema`.properties or their children when they are not serializable', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = { one: 41, two: 'SomeString', ignored1: null, ignored2: { ignoredChild1: null } }
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        ignored1: { [Kind]: 'NonSerialized' } as Schema,
        ignored2: {
          [Kind]: 'Object',
          properties: {
            ignoredChild1: { [Kind]: 'NonSerialized' } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: kind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if any of the `@param schema`.properties is not a schema value', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = { one: 'ShouldBeNumber', two: 'SomeString', ignored1: null, ignored2: { ignoredChild1: null } }
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        ignored1: { [Kind]: 'NonSerialized' } as Schema,
        ignored2: {
          [Kind]: 'Object',
          properties: {
            ignoredChild1: { [Kind]: 'NonSerialized' } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: kind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return true if all `@param schema`.properties are schema values', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = { one: 41, two: 'SomeString' }
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema
      }
      const schema = { [Kind]: kind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.properties).not.toBeUndefined()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: [Kind.Object, Kind.Class]

  it('should return true if `@param schema`[Kind] is Kind.Any', () => {
    const Expected = true
    // 3. Set input & dependencies data
    const TestSchemaKind = 'Any'
    const value = null
    const schema = { [Kind]: TestSchemaKind, properties: {} } as Schema
    // 1. Sanity check (input & dependencies)
    expect(schema.properties).not.toBeUndefined()
    // 2. Run the process
    const result = CheckSchemaValue(schema, value)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  describe('case Kind.Record', () => {
    const TestSchemaKind = 'Record'

    it('should return true if `@param schema`.properties.value is not serializable', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = null
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'NonSerialized' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return false if `@param value` is truthy, its typeof is 'object' and one of its .properties.values is not a schema value", () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = { One: 1, Two: 2, 3: 'test' } as Record<number, string>
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'Number' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(typeof value).toBe('object')
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return true if `@param schema`.properties.value is not serializable', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = { One: 1, Two: 2 } as Record<string, number>
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'NonSerialized' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(typeof value).toBe('object')
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return true if `@param schema`.properties.value is serializable and `@param value` is falsy', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = null
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'Number' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeFalsy()
      expect(typeof value).toBe('object')
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it("should return true if `@param schema`.properties.value is serializable, `@param value` is truthy but its typeof is not 'object'", () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = 42
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'Number' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(typeof value).not.toBe('object')
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Record

  describe('case Kind.Array', () => {
    const TestSchemaKind = 'Array'

    it('should return true if `@param schema`.properties is not serializable', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = 42
      const properties = { [Kind]: 'NonSerialized' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(typeof value).not.toBe('object')
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if `@param value` is not an array', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = 42
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(typeof value).not.toBe('object')
      expect(Array.isArray(value)).toBeFalsy()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return true if `@param value` is an array of length 0', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = []
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(value)).toBeTruthy()
      expect(value.length).toBe(0)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if `@param value` is an array and at least one of its entries is not a schema value', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = [42, 'invalid']
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(value)).toBeTruthy()
      expect(value.length).not.toBe(0)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return true if `@param value` is an array and all its entries are schema values', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = [41, 42]
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(value)).toBeTruthy()
      expect(value.length).not.toBe(0)
      for (const entry of value) expect(typeof entry).toBe('number')
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Array

  describe('case Kind.Tuple', () => {
    const TestSchemaKind = 'Tuple'

    it('should return false if `@param value` is not an array', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = 42
      const properties = undefined
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(typeof value).not.toBe('object')
      expect(Array.isArray(value)).toBeFalsy()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if `@param value` is an array and at least one of its entries is not a schema value', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = [41, 42]
      const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(value)).toBeTruthy()
      expect(value.length).not.toBe(0)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return true if `@param value` is an array and all its entries are schema values', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = [42, 'SomeString']
      const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(value)).toBeTruthy()
      expect(value.length).not.toBe(0)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Tuple

  describe('case Kind.Union', () => {
    const TestSchemaKind = 'Union'

    it('should return false if `@param schema`.properties.length is 0', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = 42
      const properties = []
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(schema.properties)).toBeTruthy()
      expect((schema.properties as any).length).toBe(0)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return true if `@param value` is a schema value of any of the `@param schema`.properties fields', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = 42
      const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(schema.properties)).toBeTruthy()
      expect((schema.properties as any).length).not.toBe(0)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should ignore (continue) any values of `@param schema`.properties that are not serializable', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = 42
      const properties = [
        { [Kind]: 'NonSerialized', properties: { [Kind]: 'Number' } as Schema } as Schema,
        { [Kind]: 'String' } as Schema
      ]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(schema.properties)).toBeTruthy()
      expect((schema.properties as any).length).not.toBe(0)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if `@param schema`.properties.length is not 0 and `@param value` is not a schema value of any of the `@param schema`.properties fields', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = 42
      const properties = [{ [Kind]: 'Bool' } as Schema, { [Kind]: 'String' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(Array.isArray(schema.properties)).toBeTruthy()
      expect((schema.properties as any).length).not.toBe(0)
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: Kind.Union

  describe.each(['Required', 'Proxy'])('case Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it('should return true if `@param value` is a schema value of any of the `@param schema`.properties fields', () => {
      const Expected = true
      // 3. Set input & dependencies data
      const value = 42
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(schema.properties).toBeTruthy()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return false if `@param value` is not a schema value of any of the `@param schema`.properties fields', () => {
      const Expected = false
      // 3. Set input & dependencies data
      const value = 42
      const properties = { [Kind]: 'String' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect(value).toBeTruthy()
      expect(schema.properties).toBeTruthy()
      // 2. Run the process
      const result = CheckSchemaValue(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  }) //:: [Kind.Required, Kind.Proxy]

  it.each(['Partial', 'Func', 'NonSerialized'])('should return true if `@param schema`[Kind] is Kind.%s', (kind) => {
    const Expected = true
    // 3. Set input & dependencies data
    const TestSchemaKind = kind
    const value = 42
    const schema = { [Kind]: TestSchemaKind } as Schema
    // 1. Sanity check (input & dependencies)
    expect(value).toBeTruthy()
    // 2. Run the process
    const result = CheckSchemaValue(schema, value)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return false for every other `@param schema`[Kind] value  (case: default)', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const TestSchemaKind = 'InvalidSchemaKind' as any
    const value = 42
    const schema = { [Kind]: TestSchemaKind } as Schema
    // 1. Sanity check (input & dependencies)
    expect(value).toBeTruthy()
    // 2. Run the process
    const result = CheckSchemaValue(schema, value)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: CheckSchemaValue

describe('CloneSerializable', () => {
  it('should return null if typeof `@param value` is undefined', () => {
    const Expected = null
    // 3. Set input & dependencies data
    const value = undefined
    // 1. Sanity check (input & dependencies)
    expect(typeof value).toBe('undefined')
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it.each([
    [BigInt(42), 'bigint'],
    [true, 'boolean'],
    [42, 'number'],
    ['thing', 'string'],
    [Symbol('thing'), 'symbol']
  ])('should return `@param value` if its typeof is a value type', (value, typ) => {
    const Expected = value
    // 3. Set input & dependencies data
    // 1. Sanity check (input & dependencies)
    expect(typeof value).toBe(typ)
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return `@param value` if its null', () => {
    const Expected = null
    // 3. Set input & dependencies data
    const value = Expected
    // 1. Sanity check (input & dependencies)
    expect(value).toBeNull()
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return a duplicate of `@param value` if it is an ArrayBuffer', () => {
    const Expected = new Int32Array(42)
    // 3. Set input & dependencies data
    const value = Expected
    // 1. Sanity check (input & dependencies)
    expect(value).not.toBeNull()
    expect(ArrayBuffer.isView(value)).toBeTruthy()
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return a duplicate of `@param value` without any of its NonSerializable entries if value is an Array', () => {
    const Expected = [41, 42, null]
    // 3. Set input & dependencies data
    const value = [Expected[0], Expected[1], undefined]
    // 1. Sanity check (input & dependencies)
    expect(value).not.toBeNull()
    expect(Array.isArray(value)).toBeTruthy()
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return a new Set containing all the serializable values of `@param value`.entries() if value is a Set', () => {
    const one = 41
    const two = 42
    const Expected = new Set([one, two, null])

    // 3. Set input & dependencies data
    const value = new Set([one, two, undefined])

    // 1. Sanity check (input & dependencies)
    expect(value).not.toBeNull()
    expect(value instanceof Set).toBeTruthy()
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return a new Map containing all the serializable values of `@param value`.entries() if value is a Map', () => {
    const one = 41
    const two = 42
    const Expected = new Map([
      ['one', one],
      ['two', two],
      ['thr', null]
    ])
    // 3. Set input & dependencies data
    const value = new Map([
      ['one', one],
      ['two', two],
      ['thr', undefined]
    ])
    // 1. Sanity check (input & dependencies)
    expect(value).not.toBeNull()
    expect(value instanceof Map).toBeTruthy()
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it("should return a new object containing all the serializable values of `@param value` if typeof value is 'object'", () => {
    const one = 41
    const two = 42
    const Expected = { one: one, two: two, thr: null }
    // 3. Set input & dependencies data
    const value = { one: one, two: two, thr: undefined }
    // 1. Sanity check (input & dependencies)
    expect(value).not.toBeNull()
    expect(typeof value).toBe('object')
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  /** Just for reference. This branch/case can never be hit */
  it.skip("should return NonSerializable if typeof `@param value` is not 'undefined', its typeof is not a value type, and it is not null, an ArrayBuffer, an Array, a Set, a Map or an object", () => {
    const Expected = NonSerializable
    // 3. Set input & dependencies data
    const value = new ArrayBuffer(2) // @todo Is there any value that could trigger this case ?
    // 1. Sanity check (input & dependencies)
    expect(value).not.toBeUndefined()
    expect(typeof value).not.toBe('bigint')
    expect(typeof value).not.toBe('boolean')
    expect(typeof value).not.toBe('number')
    expect(typeof value).not.toBe('string')
    expect(typeof value).not.toBe('symbol')
    expect(typeof value).not.toBe('undefined')
    expect(value).not.toBeNull()
    expect(ArrayBuffer.isView(value)).toBeFalsy()
    expect(Array.isArray(value)).toBeFalsy()
    expect((value as any) instanceof Set).toBeFalsy()
    expect((value as any) instanceof Map).toBeFalsy()
    expect(typeof value).not.toBe('object')
    // 2. Run the process
    const result = CloneSerializable(value)
    // 4. Check the result (output)
    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: CloneSerializable

describe('ConvertToSchema', () => {
  describe('when `@param schema`.options.serialize is truthy ..', () => {
    it('.. should return the result of calling schema.options.serialize with (`@param value`) as arguments', () => {
      const Expected = 42
      // 3. Set input & dependencies data
      const resultSpy = vi.fn((_: any): any => Expected)
      const value = 21
      const schema = { options: { serialize: resultSpy as any } } as Schema
      // 1. Sanity check (input & dependencies)
      expect(schema.options?.serialize).toBeTruthy()
      // 2. Run the process
      const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
      // 4. Check the result (output)
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledWith(value)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })
  })

  describe('when `@param schema`.options.serialize is falsy ..', () => {
    it.todo.each(['Null', 'Undefined', 'Void', 'Number', 'Bool', 'String', 'Enum', 'Literal', 'Any'])(
      "should return `@param value` when `@param schema`[Kind] is '%s'",
      (kind) => {
        const Expected = { one: 42 }
        // 3. Set input & dependencies data
        const TestSchemaKind = kind
        const value = Expected
        const schema = { [Kind]: TestSchemaKind, options: { serialize: undefined } } as Schema
        // 1. Sanity check (input & dependencies)
        expect(schema.options?.serialize).not.toBeTruthy()
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      }
    )

    describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
      const TestSchemaKind = kind

      describe("when schema.properties has keys, `@param value` is truthy and its typeof is 'object' ..", () => {
        it('.. should return an object that contains all serializable fields of `@param value` converted to schema values', () => {
          const Expected = { one: 42 }
          // 3. Set input & dependencies data
          const TestSchemaKind = kind
          const value = { one: 42, two: undefined }
          const properties = {
            one: { [Kind]: 'Number' } as Schema,
            two: { [Kind]: 'NonSerialized', properties: { [Kind]: 'Number' } as Schema } as Schema
          }
          const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
          // 1. Sanity check (input & dependencies)
          expect(schema).toBeTruthy()
          expect(typeof schema).toBe('object')
          expect(Object.keys(schema.properties!).length).not.toBe(0)
          expect(schema.options?.serialize).not.toBeTruthy()
          // 2. Run the process
          const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
          // 4. Check the result (output)
          expect(result).not.toBe(Expected)
          expect(result).toEqual(Expected)
          // 5? Cleanup (dependencies)
        })
      })

      describe("when schema.properties has no keys, `@param value` is truthy or its typeof is not 'object' ..", () => {
        it(".. should return null if `@param schema`[Kind] is 'Class'", () => {
          const Expected = kind === 'Class' ? null : { one: 42, two: undefined }
          // 3. Set input & dependencies data
          const TestSchemaKind = kind
          const value = { one: 42, two: undefined }
          const properties = {}
          const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
          // 1. Sanity check (input & dependencies)
          expect(schema).toBeTruthy()
          expect(typeof schema).toBe('object')
          expect(Object.keys(schema.properties!).length).toBe(0)
          expect(schema.options?.serialize).not.toBeTruthy()
          expect(typeof value).toBe('object')
          // 2. Run the process
          const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
          // 4. Check the result (output)
          expect(result).toEqual(Expected)
          // 5? Cleanup (dependencies)
        })

        it(".. should return `@param value` if `@param schema`[Kind] is not 'Class',", () => {
          const Expected = kind !== 'Class' ? { one: 42, two: undefined } : null
          // 3. Set input & dependencies data
          const TestSchemaKind = kind
          const value = { one: 42, two: undefined }
          const properties = {}
          const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
          // 1. Sanity check (input & dependencies)
          expect(schema).toBeTruthy()
          expect(typeof schema).toBe('object')
          expect(Object.keys(schema.properties!).length).toBe(0)
          expect(schema.options?.serialize).not.toBeTruthy()
          expect(typeof value).toBe('object')
          // 2. Run the process
          const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
          // 4. Check the result (output)
          expect(result).toEqual(Expected)
          // 5? Cleanup (dependencies)
        })
      })
    }) //:: case: ['Object', 'Class']

    describe("case 'Record'", () => {
      const TestSchemaKind = 'Record'

      it('should return null if `@param schema`.properties.value is falsy', () => {
        const Expected = null
        // 3. Set input & dependencies data
        const value = { one: 42, two: undefined }
        const properties = {}
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect(schema).toBeTruthy()
        expect((schema.properties! as any).value).toBeFalsy()
        expect(value).toBeTruthy()
        expect(typeof value).toBe('object')
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      })

      it("should return a new record object with all the (key:value)s from `@param value` converted to schema values if value is truthy and its typeof is 'object'", () => {
        const one = 41
        const two = 42
        const Expected = { one: one, two: two }
        // 3. Set input & dependencies data
        const value = structuredClone(Expected)
        const properties = {
          key: { [Kind]: 'String' } as Schema,
          value: { [Kind]: 'Number' } as Schema
        }
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect(schema).toBeTruthy()
        expect((schema.properties! as any).key).toBeTruthy()
        expect((schema.properties! as any).value).toBeTruthy()
        expect(value).toBeTruthy()
        expect(typeof value).toBe('object')
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      })

      it('should return `@param value` if it is falsy', () => {
        const Expected = null
        // 3. Set input & dependencies data
        const value = Expected
        const properties = {
          key: { [Kind]: 'String' } as Schema,
          value: { [Kind]: 'Number' } as Schema
        }
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect(schema).toBeTruthy()
        expect((schema.properties! as any).key).toBeTruthy()
        expect((schema.properties! as any).value).toBeTruthy()
        expect(value).toBeFalsy()
        expect(typeof value).toBe('object')
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      })

      it("should return `@param value` if it its typeof is not 'object'", () => {
        const Expected = 42
        // 3. Set input & dependencies data
        const value = Expected
        const properties = {
          key: { [Kind]: 'String' } as Schema,
          value: { [Kind]: 'Number' } as Schema
        }
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect(schema).toBeTruthy()
        expect((schema.properties! as any).key).toBeTruthy()
        expect((schema.properties! as any).value).toBeTruthy()
        expect(value).toBeTruthy()
        expect(typeof value).not.toBe('object')
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      })
    }) //:: case 'Record'

    describe("case 'Array'", () => {
      const TestSchemaKind = 'Array'

      it('should return null if `@param schema`.properties is not serializable', () => {
        const Expected = null
        // 3. Set input & dependencies data
        const value = 42
        const properties = { [Kind]: 'NonSerialized' } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any)[Kind]).toBe('NonSerialized')
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        // 5? Cleanup (dependencies)
      })

      it('should return a new array with the values of `@param schema`.properties used to convert `@param value` to schema values if value is an array', () => {
        const Expected = [41, 42]
        // 3. Set input & dependencies data
        const value = Expected
        const properties = { [Kind]: 'Number' } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any)[Kind]).not.toBe('NonSerialized')
        expect(Array.isArray(value)).toBeTruthy()
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).not.toBe(Expected)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      })

      it('should return `@param value` if it is not an array', () => {
        const Expected = { one: 42 }
        // 3. Set input & dependencies data
        const value = Expected
        const properties = { [Kind]: 'Number' } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any)[Kind]).not.toBe('NonSerialized')
        expect(Array.isArray(value)).toBeFalsy()
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      })
    }) //:: case 'Array'

    describe("case 'Tuple'", () => {
      const TestSchemaKind = 'Tuple'

      it('should return a new tuple/array with the values of `@param schema`.properties used to convert `@param value` to schema values if value is an array', () => {
        const Expected = [42, 'SomeString']
        // 3. Set input & dependencies data
        const value = Expected
        const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect(Array.isArray(value)).toBeTruthy()
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).not.toBe(Expected)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      })

      it('should return `@param value` if it is not an array', () => {
        const Expected = { one: 42 }
        // 3. Set input & dependencies data
        const value = Expected
        const properties = { [Kind]: 'Number' } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any)[Kind]).not.toBe('NonSerialized')
        expect(Array.isArray(value)).toBeFalsy()
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      })
    }) //:: case 'Tuple'

    describe("case 'Union'", () => {
      const TestSchemaKind = 'Union'

      it('should return null if `@param schema`.properties has no values', () => {
        const Expected = null
        // 3. Set input & dependencies data
        const value = 42
        const properties = []
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any).length).toBe(0)
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        // 5? Cleanup (dependencies)
      })

      it('should return `@param value` converted to the first entry of `@param schema`.properties that matches its value', () => {
        const Expected = 42
        // 3. Set input & dependencies data
        const value = Expected
        const properties = [
          { [Kind]: 'String' } as Schema,
          { [Kind]: 'Void' } as Schema,
          { [Kind]: 'Number' } as Schema
        ]
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any).length).not.toBe(0)
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        // 5? Cleanup (dependencies)
      })

      it('should return null if no entry of `@param schema`.properties matches `@param value`', () => {
        const Expected = null
        // 3. Set input & dependencies data
        const value = 42
        const properties = [{ [Kind]: 'String' } as Schema, { [Kind]: 'Void' } as Schema]
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any).length).not.toBe(0)
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        // 5? Cleanup (dependencies)
      })

      it('should ignore (continue) all values of `@param schema`.properties that are not serializable', () => {
        const Expected = null
        // 3. Set input & dependencies data
        const value = 42
        const properties = [
          { [Kind]: 'String' } as Schema,
          { [Kind]: 'Void' } as Schema,
          { [Kind]: 'NonSerialized', properties: { [Kind]: 'Number' } as Schema } as Schema
        ]
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any).length).not.toBe(0)
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        // 5? Cleanup (dependencies)
      })
    }) //:: case 'Union'

    it.each(['Partial', 'Required', 'Proxy'])(
      'should flatten the schema and return `@param value` converted to the schema defined by `@param schema`.properties when schema[Kind] is "%s"',
      (kind) => {
        const Expected = [41, 42]
        const TestSchemaKind = kind
        // 3. Set input & dependencies data
        const value = Expected
        const properties = { [Kind]: 'Array', properties: { [Kind]: 'Number' } as Schema } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
        // 1. Sanity check (input & dependencies)
        expect((schema.properties! as any)[Kind]).not.toBe('NonSerialized')
        expect(Array.isArray(value)).toBeTruthy()
        // 2. Run the process
        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
        // 4. Check the result (output)
        expect(result).not.toBe(Expected)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      }
    ) //:: case: ['Partial', 'Required', 'Proxy']

    it("should return undefined when `@param schema`[Kind] is 'NonSerialized'", () => {
      const Expected = undefined
      const TestSchemaKind = 'NonSerialized'
      // 3. Set input & dependencies data
      const value = [41, 42]
      const properties = { [Kind]: 'Array', properties: { [Kind]: 'Number' } as Schema } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect((schema.properties! as any)[Kind]).not.toBe('NonSerialized')
      expect(Array.isArray(value)).toBeTruthy()
      // 2. Run the process
      const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should return null for every other value of `@param schema`[Kind]  (case: default)', () => {
      const Expected = null
      const TestSchemaKind = 'UnknownSchemaKind' as any
      // 3. Set input & dependencies data
      const value = [41, 42]
      const properties = { [Kind]: 'Array', properties: { [Kind]: 'Number' } as Schema } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      // 1. Sanity check (input & dependencies)
      expect((schema.properties! as any)[Kind]).not.toBe('NonSerialized')
      expect(Array.isArray(value)).toBeTruthy()
      // 2. Run the process
      const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)
      // 4. Check the result (output)
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  })
}) //:: ConvertToSchema

describe('SerializeSchema', () => {
  it('should return a deep clone of `@param value` with all its serializable values converted based on `@param schema`', () => {
    const Expected = { one: 41, two: 'TWO' }
    // 3. Set input & dependencies data
    const value = { one: Expected.one, two: Expected.two, three: undefined, four: null }
    const properties = {
      one: { [Kind]: 'Number' } as Schema,
      two: { [Kind]: 'String' } as Schema
    }
    const schema = { [Kind]: 'Object', properties: properties } as Schema
    // 1. Sanity check (input & dependencies)
    // 2. Run the process
    const result = SerializeSchema(schema, value)
    // 4. Check the result (output)
    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: SerializeSchema
