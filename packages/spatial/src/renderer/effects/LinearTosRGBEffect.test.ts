import { createEngine, destroyEngine } from '@ir-engine/ecs'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { LinearTosRGBEffect } from './LinearTosRGBEffect'
import { BlendFunction } from './blending/BlendFunction'
import fragmentShader from './glsl/linear-to-srgb/shader.frag'

describe('LinearTosRGBEffect', () => {
  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('constructor', () => {
    it('should create a new object with the expected default values when `@param blendFunction` is not passed', () => {
      const result = new LinearTosRGBEffect()
      assert.equal(result.name, 'LinearTosRGBEffect')
      assert.equal(result.getFragmentShader(), fragmentShader)
      assert.equal(result.blendMode.blendFunction, 23)
    })

    it('should create a new object with the expected blendFunction when `@param blendFunction` is passed', () => {
      for (const [_, fn] of Object.entries(BlendFunction)) {
        const result = new LinearTosRGBEffect({ blendFunction: fn })
        assert.equal(result.name, 'LinearTosRGBEffect')
        assert.equal(result.getFragmentShader(), fragmentShader)
        assert.equal(result.blendMode.blendFunction, fn)
      }
    })
  })
})
