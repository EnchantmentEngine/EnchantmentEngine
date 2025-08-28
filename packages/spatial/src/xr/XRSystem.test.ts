import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { InputSystemGroup, SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { XRSystem, XRSystemFunctions } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRSystem', () => {
  const System = SystemDefinitions.get(XRSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRSystem).toBe('ee.engine.XRSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.before).not.toBe(undefined)
      expect(System.insert!.before!).toBe(InputSystemGroup)
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {
    // @todo When system mounting/unmounting is exposed
    describe('mount/unmount', () => {
      it.skip("should call navigator.xr.addEventListener with 'devicechange'  and updateSessionSupport", () => {})
      it.skip('should call XRSystemFunctions.updateSessionSupport', () => {
        // Set the data as expected
        const resultSpy = vi.spyOn(XRSystemFunctions, 'updateSessionSupport')
        // Sanity check before running
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        expect(resultSpy).toHaveBeenCalledOnce()
      })

      describe('when it unmounts ..', () => {
        it.skip(".. should call navigator.xr.removeEventListener with 'devicechange'  and XRSystemFunctions.updateSessionSupport", () => {})
      }) //:: unmount
    })
  }) //:: reactor

  /** @todo */
  describe('execute,', () => {}) //:: execute
}) //:: XRSystem
