import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'

import { SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { XRCameraViewSystem } from './XRCameraViewSystem'
import { XRSystem } from './XRSystem'

describe('XRCameraViewSystem', () => {
  const System = SystemDefinitions.get(XRCameraViewSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRCameraViewSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRCameraViewSystem).toBe('ee.engine.XRCameraViewSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo Not yet implemented */
  describe('execute', () => {}) //:: execute
}) //:: XRCameraViewSystem
