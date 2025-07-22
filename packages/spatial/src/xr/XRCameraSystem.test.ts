import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { AnimationSystemGroup, SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { XRCameraInputSystem, XRCameraUpdateSystem } from './XRCameraSystem'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRCameraInputSystem', () => {
  const System = SystemDefinitions.get(XRCameraInputSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRCameraInputSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRCameraInputSystem).toBe('ee.engine.XRCameraInputSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {}) //:: execute
}) //:: XRCameraInputSystem

describe('XRCameraUpdateSystem', () => {
  const System = SystemDefinitions.get(XRCameraUpdateSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRCameraUpdateSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRCameraUpdateSystem).toBe('ee.engine.XRCameraUpdateSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.before).not.toBe(undefined)
      expect(System.insert!.before!).toBe(AnimationSystemGroup)
    })
  }) //:: Fields

  /** @todo */
  /* @note Same as updateXRCamera */
  describe('execute', () => {}) //:: execute
}) //:: XRCameraUpdateSystem
