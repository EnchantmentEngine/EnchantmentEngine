import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { VPSSystem } from './VPSSystem'
import { XRPersistentAnchorSystem } from './XRPersistentAnchorSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('VPSSystem', () => {
  const System = SystemDefinitions.get(VPSSystem)!

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
      expect(System.uuid).toBe('ee.engine.VPSSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(VPSSystem).toBe('ee.engine.VPSSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(XRPersistentAnchorSystem)
    })
  }) //:: Fields

  describe('execute', () => {
    /**
    // @todo
    // for every action in the PersistentAnchorActions.anchorFound list
      // for every entity with a PersistentAnchorComponent component
        // when the entity.PersistentAnchorComponent.name is the same as the current action.name
          // should set active to true
          // should copy action.position into entity.TransformComponent.position
          // should copy action.rotation into entity.TransformComponent.rotation
    // for every action in the PersistentAnchorActions.anchorUpdated list
      // for every entity with a PersistentAnchorComponent component
        // when the entity.PersistentAnchorComponent.name is the same as the current action.name
          // should copy action.position into entity.TransformComponent.position
          // should copy action.rotation into entity.TransformComponent.rotation
    // for every action in the PersistentAnchorActions.anchorLost list
      // for every entity with a PersistentAnchorComponent component
        // when the entity.PersistentAnchorComponent.name is the same as the current action.name
          // should set active to false
    */
  }) //:: execute
}) //:: VPSSystem
