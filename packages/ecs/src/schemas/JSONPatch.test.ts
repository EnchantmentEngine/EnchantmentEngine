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
