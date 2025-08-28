import { describe, expect, it } from 'vitest'
import { PersistentAnchorActions, PersistentAnchorComponent } from './XRAnchorComponents'

describe('PersistentAnchorComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(PersistentAnchorComponent.name).toBe('PersistentAnchorComponent')
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      expect(PersistentAnchorComponent.jsonID).toBe('EE_persistent_anchor')
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {
    it.todo('should not do anything if the entityContext does not have a GroupComponent', () => {})
    describe("when PersistentAnchorComponent.value is truthy and XRState.sessionMode is 'immersive-ar' ..", () => {
      it.todo('.. should set entityContext.EntityTreeComponent.parentEntity to EngineState.localFloorEntity', () => {})
      it.todo('.. should set TransformComponent.dirtyTransforms for the entityContext to true', () => {})
      it.todo('.. should call anchorMeshFound with (?....?)', () => {})
    })

    describe("when PersistentAnchorComponent.value is falsy or XRState.sessionMode is not 'immersive-ar' ..", () => {
      it.todo('.. should set entityContext.EntityTreeComponent.parentEntity to the originalParentEntity', () => {})
      it.todo('.. should set TransformComponent.dirtyTransforms for the entityContext to true', () => {})
      it.todo('.. should call anchorMeshLost with (?....?)', () => {})
    })

    // @todo: how to find/control the originalParentEntity ??
    it.todo('should trigger when entity.PersistentAnchorComponent.active changes', () => {})

    it.todo('should trigger when entity.GroupComponent.length changes', () => {})
    it.todo('should trigger when XRState.sessionActive changes', () => {})
  }) //:: reactor
}) //:: PersistentAnchorComponent

describe('PersistentAnchorActions', () => {
  describe('anchorFound', () => {
    const anchor = PersistentAnchorActions.anchorFound

    it('should initialize the anchor*.type field with the expected value', () => {
      expect(anchor.type).toBe('xre.anchor.anchorFound')
    })

    it('should initialize the anchor*.name field with a string', () => {
      expect(typeof anchor.name).toBe('string')
    })
  }) //:: anchorFound

  describe('anchorUpdated', () => {
    const anchor = PersistentAnchorActions.anchorUpdated

    it('should initialize the anchor*.type field with the expected value', () => {
      expect(anchor.type).toBe('xre.anchor.anchorUpdated')
    })

    it('should initialize the anchor*.name field with a string', () => {
      expect(typeof anchor.name).toBe('string')
    })
  }) //:: anchorUpdated

  describe('anchorLost', () => {
    const anchor = PersistentAnchorActions.anchorLost

    it('should initialize the anchor*.type field with the expected value', () => {
      expect(anchor.type).toBe('xre.anchor.anchorLost')
    })

    it('should initialize the anchor*.name field with a string', () => {
      expect(typeof anchor.name).toBe('string')
    })
  }) //:: anchorLost
}) //:: PersistentAnchorActions
