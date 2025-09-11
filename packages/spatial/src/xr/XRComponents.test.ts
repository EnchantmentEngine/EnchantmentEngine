import { UndefinedEntity, createEngine, createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { assertArray } from '../../tests/util/assert'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { EntityTreeComponent, hasComponent, removeComponent, removeEntity } from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { TransformComponent } from '../transform/components/TransformComponent'
import {
  XRAnchorComponent,
  XRHandComponent,
  XRHitTestComponent,
  XRLeftHandComponent,
  XRRightHandComponent,
  XRSpaceComponent
} from './XRComponents'
import { ReferenceSpace } from './XRState'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

const XRHandRotationDefaults = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]

function assertXRHandComponentDefaults(data: any) {
  assertArray.eq([...data.rotations.values()], XRHandRotationDefaults)
  expect(data.hand).toBeUndefined()
}

describe('XRHandComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRHandComponent.name).toBe('XRHandComponent')
    })
  }) //:: Fields
}) //:: XRHandComponent

describe('XRLeftHandComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRLeftHandComponent.name).toBe('XRLeftHandComponent')
    })
  }) //:: Fields

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      destroyEngine()
    })

    it("should initialize the Component's data with the expected default values", () => {
      setComponent(testEntity, XRLeftHandComponent)
      const result = getComponent(testEntity, XRLeftHandComponent)
      assertXRHandComponentDefaults(result)
    })
  }) //:: onInit
}) //:: XRLeftHandComponent

describe('XRRightHandComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRRightHandComponent.name).toBe('XRRightHandComponent')
    })
  }) //:: Fields

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      destroyEngine()
    })

    it("should initialize the Component's data with the expected default values", () => {
      setComponent(testEntity, XRRightHandComponent)
      const result = getComponent(testEntity, XRRightHandComponent)
      assertXRHandComponentDefaults(result)
    })
  }) //:: onInit
}) //:: XRRightHandComponent

describe('XRHitTestComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRHitTestComponent.name).toBe('XRHitTestComponent')
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    // @todo How to check the contents of the function inside the `.then(fn)` call?
    describe("when XRHitTestComponent.options has a field called 'space' ..", () => {
      it.todo(
        '.. should call XRState.session.requestHitTestSource with XRHitTestComponent.options and a .then callback that [??]',
        () => {}
      )
    })

    // @todo How to check the contents of the function inside the `.then(fn)` call?
    describe("when XRHitTestComponent.options does not have a field called 'space' ..", () => {
      it.todo(
        '.. should call XRState.session.requestHitTestSource with XRHitTestComponent.options and a .then callback that [??]',
        () => {}
      )
    })

    // @todo Why is the cancel spy not getting triggered ?
    it.todo('should call XRHitTestComponent.source.cancel when it unmounts', async () => {
      // Set the data as expected
      const resultSpy = vi.fn()
      setComponent(testEntity, XRHitTestComponent, { source: { cancel: resultSpy } })
      // Sanity check before running
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      await vi.waitFor(() => {
        removeComponent(testEntity, XRHitTestComponent)
        expect(resultSpy).toHaveBeenCalledOnce()
      })
    })

    // @todo Use the test above, but with the opposite case
    it.todo('should not do anything if the entityContext does not have an XRHitTestComponent', () => {
      const Expected = false
      // Set the data as expected
      // Sanity check before running
      // Run and Check the result
      const result = true
      expect(result).toBe(Expected)
    })

    it.todo('should trigger when entityContext.XRHitTestComponent.options changes', () => {})
  }) //:: reactor
}) //:: XRHitTestComponent

describe('XRAnchorComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRAnchorComponent.name).toBe('XRAnchorComponent')
    })
  }) //:: Fields

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should call entityContext.XRAnchorComponent.anchor.delete when it unmounts', async () => {
      // Set the data as expected
      const resultSpy = vi.fn()
      setComponent(testEntity, XRAnchorComponent, { anchor: { delete: resultSpy } as unknown as XRAnchor })
      await act(() => render(null))
      // Sanity check before running
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      removeComponent(testEntity, XRAnchorComponent)
      await act(() => render(null))
      expect(resultSpy).toHaveBeenCalledOnce()
    })
  }) //:: reactor
}) //:: XRAnchorComponent

describe('XRSpaceComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRSpaceComponent.name).toBe('XRSpaceComponent')
    })
  }) //:: Fields

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set an EntityTreeComponent to the entityContext with EngineState.localFloorEntity as its parentEntity when entityContext.XRSpaceComponent.baseSpace is ReferenceSpace.localFloor', async () => {
      const Expected = createEntity()
      // Set the data as expected
      getMutableState(ReferenceSpaceState).localFloorEntity.set(Expected)
      // Sanity check before running
      expect(hasComponent(testEntity, EntityTreeComponent)).toBe(false)
      // Run and Check the result
      setComponent(testEntity, XRSpaceComponent, { baseSpace: ReferenceSpace.localFloor! })
      await act(() => render(null))
      const result = getComponent(testEntity, EntityTreeComponent).parentEntity
      expect(result).toBe(Expected)
    })

    it('should set an EntityTreeComponent to the entityContext with EngineState.viewerEntity as its parentEntity when entityContext.XRSpaceComponent.baseSpace is ReferenceSpace.viewer', async () => {
      const Expected = createEntity()
      // Set the data as expected
      getMutableState(ReferenceSpaceState).viewerEntity.set(Expected)
      // Sanity check before running
      expect(hasComponent(testEntity, EntityTreeComponent)).toBe(false)
      // Run and Check the result
      setComponent(testEntity, XRSpaceComponent, { baseSpace: ReferenceSpace.viewer! })
      await act(() => render(null))
      const result = getComponent(testEntity, EntityTreeComponent).parentEntity
      expect(result).toBe(Expected)
    })

    it('should set an EntityTreeComponent to the entityContext with UndefinedEntity as its parentEntity when entityContext.XRSpaceComponent.baseSpace is not ReferenceSpace.viewer or ReferenceSpace.localFloor', async () => {
      const Expected = UndefinedEntity
      // Sanity check before running
      expect(hasComponent(testEntity, EntityTreeComponent)).toBe(false)
      // Run and Check the result
      setComponent(testEntity, XRSpaceComponent, { baseSpace: undefined })
      await act(() => render(null))
      const result = getComponent(testEntity, EntityTreeComponent).parentEntity
      expect(result).toBe(Expected)
    })

    it('should set a TransformComponent to the entityContext', async () => {
      const Expected = true
      const Initial = !Expected
      // Sanity check before running
      const before = hasComponent(testEntity, TransformComponent)
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      setComponent(testEntity, XRSpaceComponent)
      await act(() => render(null))
      const result = hasComponent(testEntity, TransformComponent)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  }) //:: reactor
}) //:: XRSpaceComponent
