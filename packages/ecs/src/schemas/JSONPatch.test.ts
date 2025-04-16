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

import { describe, expect, it } from 'vitest'
import { applyJSONPatch, JSONPatch } from './JSONPatch'

describe('JSONPatch', () => {
  describe('applyJSONPatch', () => {
    it('should apply "add" operation to an object', () => {
      const obj = { foo: 'bar' }
      const patch: JSONPatch = [{ op: 'add', path: '/baz', value: 'qux' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: 'bar', baz: 'qux' })
      // Original object should not be modified
      expect(obj).toEqual({ foo: 'bar' })
    })

    it('should apply "add" operation to an array', () => {
      const obj = { foo: ['bar', 'baz'] }
      const patch: JSONPatch = [{ op: 'add', path: '/foo/1', value: 'qux' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: ['bar', 'qux', 'baz'] })
    })

    it('should apply "add" operation to the end of an array using "-" index', () => {
      const obj = { foo: ['bar', 'baz'] }
      const patch: JSONPatch = [{ op: 'add', path: '/foo/-', value: 'qux' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: ['bar', 'baz', 'qux'] })
    })

    it('should apply "remove" operation to an object', () => {
      const obj = { foo: 'bar', baz: 'qux' }
      const patch: JSONPatch = [{ op: 'remove', path: '/baz' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: 'bar' })
    })

    it('should apply "remove" operation to an array', () => {
      const obj = { foo: ['bar', 'qux', 'baz'] }
      const patch: JSONPatch = [{ op: 'remove', path: '/foo/1' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: ['bar', 'baz'] })
    })

    it('should apply "replace" operation', () => {
      const obj = { foo: 'bar', baz: 'qux' }
      const patch: JSONPatch = [{ op: 'replace', path: '/baz', value: 'quux' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: 'bar', baz: 'quux' })
    })

    it('should apply "move" operation', () => {
      const obj = { foo: { bar: 'baz' }, qux: { corge: 'grault' } }
      const patch: JSONPatch = [{ op: 'move', from: '/foo/bar', path: '/qux/thud' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: {}, qux: { corge: 'grault', thud: 'baz' } })
    })

    it('should apply "copy" operation', () => {
      const obj = { foo: { bar: 'baz' }, qux: { corge: 'grault' } }
      const patch: JSONPatch = [{ op: 'copy', from: '/foo/bar', path: '/qux/thud' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: { bar: 'baz' }, qux: { corge: 'grault', thud: 'baz' } })
    })

    it('should apply "test" operation that passes', () => {
      const obj = { foo: { bar: 'baz' } }
      const patch: JSONPatch = [{ op: 'test', path: '/foo/bar', value: 'baz' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual(obj)
    })

    it('should throw error for "test" operation that fails', () => {
      const obj = { foo: { bar: 'baz' } }
      const patch: JSONPatch = [{ op: 'test', path: '/foo/bar', value: 'qux' }]
      expect(() => applyJSONPatch(obj, patch)).toThrow('Test failed')
    })

    it('should apply multiple operations in sequence', () => {
      const obj = { foo: 'bar', baz: 'qux' }
      const patch: JSONPatch = [
        { op: 'remove', path: '/baz' },
        { op: 'add', path: '/quux', value: 'corge' },
        { op: 'replace', path: '/foo', value: 'grault' }
      ]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: 'grault', quux: 'corge' })
    })

    it('should throw error for unknown operation', () => {
      const obj = { foo: 'bar' }
      const patch = [{ op: 'unknown' as any, path: '/foo' }]
      expect(() => applyJSONPatch(obj, patch)).toThrow('Unknown operation')
    })

    it('should throw error for invalid path', () => {
      const obj = { foo: 'bar' }
      const patch: JSONPatch = [{ op: 'remove', path: '/baz' }]
      expect(() => applyJSONPatch(obj, patch)).toThrow('Path baz does not exist')
    })

    it('should throw error for "move" operation without "from" field', () => {
      const obj = { foo: 'bar' }
      // Use type assertion to bypass TypeScript's type checking for testing purposes
      const patch = [{ op: 'move', path: '/baz' } as any]
      expect(() => applyJSONPatch(obj, patch)).toThrow('Move operation requires "from" field')
    })

    it('should throw error for "copy" operation without "from" field', () => {
      const obj = { foo: 'bar' }
      // Use type assertion to bypass TypeScript's type checking for testing purposes
      const patch = [{ op: 'copy', path: '/baz' } as any]
      expect(() => applyJSONPatch(obj, patch)).toThrow('Copy operation requires "from" field')
    })

    it('should handle nested paths correctly', () => {
      const obj = { foo: { bar: { baz: 'qux' } } }
      const patch: JSONPatch = [{ op: 'replace', path: '/foo/bar/baz', value: 'quux' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: { bar: { baz: 'quux' } } })
    })

    it('should create missing intermediate objects for add operation', () => {
      const obj = { foo: {} }
      const patch: JSONPatch = [{ op: 'add', path: '/foo/bar/baz', value: 'qux' }]
      const result = applyJSONPatch(obj, patch)
      expect(result).toEqual({ foo: { bar: { baz: 'qux' } } })
    })
  })
})
