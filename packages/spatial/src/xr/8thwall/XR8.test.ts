import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../../tests/webxr/emulator'

import { SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { XRSystem } from '../XRSystem'
import { XR8System } from './XR8'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XR8System', () => {
  const System = SystemDefinitions.get(XR8System)!

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
      expect(System.uuid).toBe('ee.engine.XR8System')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XR8System).toBe('ee.engine.XR8System' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute,', () => {}) //:: execute
  describe('reactor', () => {}) //:: reactor
}) //:: XR8System
