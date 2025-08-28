/**
 * @fileoverview
 * Unit Test suite for loading the `glTF.asset` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { describe, expect, it } from 'vitest'

import { GLTF } from '@gltf-transform/core'
import { GLTFValidate } from '../GLTFLoaderFunctions'

const mockAssetMinimal = (): GLTF.IAsset => ({ version: '2.0' })

describe('glTF.asset Property', () => {
  /**
   * @todo
   * These root cases cannot possibly be tested with our current implementation.
   * Nothing in our current implementation checks the root glTF data directly.
   * */
  it.todo('MUST be defined', () => {})
  it.todo('MUST be an Asset object', () => {})

  describe('version', () => {
    it('MUST be defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Delete the version property to provoke the error
      delete asset.version
      expect(() => GLTFValidate.asset(asset)).toThrow()
    })

    it('MUST be a `string` type', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the version property to a number to provoke the error
      asset.version = 2.0 // Not a string
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.version = '2.0' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST match the glTF version format with pattern ^[0-9]+.[0-9]+$', () => {
      const asset = mockAssetMinimal()
      asset.version = '2.0.0' // Not a valid glTF version format
      expect(() => GLTFValidate.asset(asset)).toThrow()
    })
  }) //:: version

  describe('copyright', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST be a `string` type when defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the copyright property to a number to provoke the error
      asset.copyright = 2023 // Not a string
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.copyright = 'SomeCopyright' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })
  }) //:: copyright

  describe('generator', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST be a `string` type when defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the generator property to a number to provoke the error
      asset.generator = { toolName: 'SomeGeneratorTool' } // Not a string
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.generator = 'SomeGeneratorTool' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })
  }) //:: generator

  describe('minVersion', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST be a `string` type when defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the minVersion property to a number to provoke the error
      asset.minVersion = 2.0 // Not a string
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.minVersion = '2.0' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST NOT be greater than Asset.version', () => {
      const asset = mockAssetMinimal()
      asset.minVersion = '2.1' // Greater than 2.0
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.minVersion = '2.0' // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST match the glTF version format with pattern ^[0-9]+.[0-9]+$', () => {
      const asset = mockAssetMinimal()
      asset.minVersion = '2.0.0' // Not a valid glTF version format
      expect(() => GLTFValidate.asset(asset)).toThrow()
    })
  }) //:: minVersion

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })

    it('MUST be a JSON object when defined', () => {
      const asset = mockAssetMinimal()
      // @ts-expect-error Set the extensions property to a number to provoke the error
      asset.extensions = 42 // Not a JSON object
      expect(() => GLTFValidate.asset(asset)).toThrow()
      asset.extensions = {} // Set a valid value
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const asset = mockAssetMinimal()
      expect(() => GLTFValidate.asset(asset)).not.toThrow()
    })
  }) //:: extras
}) //:: glTF.asset
