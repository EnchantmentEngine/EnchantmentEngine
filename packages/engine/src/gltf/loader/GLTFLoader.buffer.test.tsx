/**
 * @fileoverview
 * Unit Test suite for loading the `glTF.buffers` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

beforeEach(() => {
  DependencyCache.clear()
})

overrideFileLoaderLoad()

beforeEach(async () => {
  createEngine()
  startEngineReactor()

  await act(() => render(null))
})

afterEach(() => {
  destroyEngine()
})

/**
 * @todo
 * Cannot possibly tested in our current GLTFLoader implementation
 * It requires a GLTFLoader gltf root properties validation function that does not exist.
 * */
describe('glTF.buffers Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `buffer` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.buffers

describe('glTF: Buffer Type', () => {
  function mockGLTFMinimalBuffer() {
    const result = mockGLTF()
    result.buffers = [
      {
        byteLength: 1
      }
    ]
    return result
  }

  describe('uri', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      delete options.document.buffers![0].uri
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).resolves.not.toThrow()
    })

    it('MUST be a `string` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      options.document.buffers![0].uri = 42 as any
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).rejects.toThrowError()
    })

    it.todo('MUST follow the iri-reference format when defined', async () => {
      const validOptions = mockGLTFOptions(mockGLTFMinimalBuffer())
      validOptions.document.buffers![0].uri = 'data:application/octet-stream;base64,AAAA'
      await expect(GLTFLoaderFunctions.loadBuffer(validOptions, 0)).resolves.not.toThrow()

      const invalidOptions = mockGLTFOptions(mockGLTFMinimalBuffer())
      invalidOptions.document.buffers![0].uri = 'invalid uri with spaces'
      await expect(GLTFLoaderFunctions.loadBuffer(invalidOptions, 0)).rejects.toThrowError()
    })

    it.todo('MUST be base64 encoded when it starts with data:', async () => {
      const validOptions = mockGLTFOptions(mockGLTFMinimalBuffer())
      validOptions.document.buffers![0].uri = 'data:application/octet-stream;base64,AAAA'
      await expect(GLTFLoaderFunctions.loadBuffer(validOptions, 0)).resolves.not.toThrow()

      const invalidOptions = mockGLTFOptions(mockGLTFMinimalBuffer())
      invalidOptions.document.buffers![0].uri = 'data:application/octet-stream;base64,$$$$'
      await expect(GLTFLoaderFunctions.loadBuffer(invalidOptions, 0)).rejects.toThrowError()
    })
  }) //:: uri

  describe('byteLength', () => {
    /** @todo Should throw. Our implementation does not respect the specification for glTF.buffer.byteLength */
    it.todo('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.buffers![0].byteLength
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.buffer.byteLength */
    it.todo('MUST be an `integer` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      options.document.buffers![0].byteLength = 1.42
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.buffer.byteLength */
    it.todo('MUST have a value in range [1..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      options.document.buffers![0].byteLength = 0
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).rejects.toThrowError()
    })

    it.todo('MUST match the total size of the buffer data in bytes', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      options.document.buffers![0].uri = 'data:application/octet-stream;base64,AAAA'
      options.document.buffers![0].byteLength = 4
      await expect(GLTFLoaderFunctions.loadBuffer(options, 0)).resolves.not.toThrow()

      const mismatchOptions = mockGLTFOptions(mockGLTFMinimalBuffer())
      mismatchOptions.document.buffers![0].uri = 'data:application/octet-stream;base64,AAAA'
      mismatchOptions.document.buffers![0].byteLength = 8
      await expect(GLTFLoaderFunctions.loadBuffer(mismatchOptions, 0)).rejects.toThrowError()
    })
  }) //:: byteLength

  describe('name', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      delete options.document.buffers![0].name
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.buffer.name */
    it.fails('MUST be a `string` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      options.document.buffers![0].name = 42 as any
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).rejects.toThrowError()
    })
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      delete options.document.buffers![0].extensions
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.buffer.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      options.document.buffers![0].extensions = 42 as any
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalBuffer())
      delete options.document.buffers![0].extras
      expect(GLTFLoaderFunctions.loadBuffer(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Buffer
