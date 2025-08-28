import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { PresentationSystemGroup, SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { XRScenePlacementShaderSystem } from './XRScenePlacementShaderSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRScenePlacementShaderSystem', () => {
  const System = SystemDefinitions.get(XRScenePlacementShaderSystem)!

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.XRScenePlacementShaderSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRScenePlacementShaderSystem).toBe('ee.engine.XRScenePlacementShaderSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(PresentationSystemGroup)
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: XRScenePlacementShaderSystem
