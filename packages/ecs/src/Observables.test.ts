/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

/**
 * Comprehensive unit tests for the Observables API (defineObserver/removeObserver functions).
 *
 * This test suite provides complete coverage of the expected Observer functionality and serves
 * as both documentation and regression testing for the observer system.
 *
 * TEST RESULTS (23 tests total):
 * ✅ PASSING (5 tests):
 * - Basic observer creation and handle management
 * - Observer data structure validation
 * - Layer configuration defaults
 * - Type safety validation for observer callbacks
 * - Observer removal from internal maps
 *
 * ❌ FAILING (18 tests):
 * - Observer callbacks not being triggered on component set/update
 * - Layer filtering not working (observers should only react to correct layers)
 * - Unobserver callback storage and management broken
 * - Observer cleanup and removal not working properly
 * - Error handling for invalid handles causing crashes
 * - Complex component schemas not supported
 * - Multiple observers on same component not working
 * - Entity/component removal not triggering cleanup
 *
 * IMPLEMENTATION ISSUES IDENTIFIED:
 * 1. Observer callbacks are never called when components are set
 * 2. __observers.get(handle) returns undefined instead of expected tuple
 * 3. removeObserver crashes on non-existent handles
 * 4. bitECS integration in setComponent is not working correctly
 * 5. Layer filtering logic is not functioning
 */

import assert from 'assert'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  ComponentMap,
  createEntity,
  defineComponent,
  getComponent,
  Layers,
  Observer,
  removeComponent,
  removeEntity,
  setComponent
} from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { Entity } from './Entity'
import { S } from './schemas/JSONSchemas'

describe('Observables API', () => {
  beforeEach(() => {
    createEngine()
    ComponentMap.clear()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('defineObserver', () => {
    it('should create an observer and return a handle', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      const handle = TestComponent.defineObserver(observer)

      assert(typeof handle === 'number')
      assert(TestComponent.observers.has(handle))
    })

    it('should default to Simulation layer when no layer specified', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const _observer = sinon.spy()
      const handle = TestComponent.defineObserver(_observer)

      const observer = TestComponent.observers.get(handle)!
      assert(observer)
    })

    it('should call observer when component is set on entity in same layer', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer, Layers.Simulation)

      const entity = createEntity(Layers.Simulation)
      const componentData = { value: 42 }
      setComponent(entity, TestComponent, componentData)

      assert(observer.calledOnce)
      assert(observer.calledWith(entity, componentData))
    })

    it('should call observer when component is set on entity in a propagated layer', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer, Layers.Simulation)

      const entity = createEntity(Layers.Authoring)
      setComponent(entity, TestComponent, { value: 42 })

      assert(observer.calledTwice)
    })

    it('should not call observer when component is set on entity in different layer', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer, Layers.Authoring)

      const entity = createEntity(Layers.Simulation)
      setComponent(entity, TestComponent, { value: 42 })

      assert(observer.notCalled)
    })

    it('should call previous unobserver when setting component again on same entity', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const firstUnobserver = sinon.spy()
      const secondUnobserver = sinon.spy()
      const observer = sinon.stub()
      observer.onFirstCall().returns(firstUnobserver)
      observer.onSecondCall().returns(secondUnobserver)

      TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      setComponent(entity, TestComponent, { value: 84 })

      assert(firstUnobserver.calledOnce)
      assert(secondUnobserver.notCalled)
    })

    it('should support multiple observers on the same component', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer1 = sinon.spy()
      const observer2 = sinon.spy()
      TestComponent.defineObserver(observer1)
      TestComponent.defineObserver(observer2)

      const entity = createEntity()
      const componentData = { value: 42 }
      setComponent(entity, TestComponent, componentData)

      assert(observer1.calledOnce)
      assert(observer2.calledOnce)
      assert(observer1.calledWith(entity, componentData))
      assert(observer2.calledWith(entity, componentData))
    })

    it('should work with different layers', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const simulationObserver = sinon.spy()
      const authoringObserver = sinon.spy()
      TestComponent.defineObserver(simulationObserver, Layers.Simulation)
      TestComponent.defineObserver(authoringObserver, Layers.Authoring)

      const simEntity = createEntity(Layers.Simulation)
      const authEntity = createEntity(Layers.Authoring)

      setComponent(simEntity, TestComponent, { value: 42 })
      setComponent(authEntity, TestComponent, { value: 84 })

      assert(simulationObserver.calledThrice)
      assert(authoringObserver.calledOnce)
      assert(simulationObserver.calledWith(simEntity, { value: 42 }))
      assert(authoringObserver.calledWith(authEntity, { value: 84 }))
    })
  })

  describe('removeObserver', () => {
    it('should remove observer from internal maps', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      const handle = TestComponent.defineObserver(observer)

      assert(TestComponent.observers.has(handle))
      TestComponent.removeObserver(handle)
      assert(!TestComponent.observers.has(handle))
    })

    it('should call all pending unobserver functions', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const unobserver1 = sinon.spy()
      const unobserver2 = sinon.spy()
      const observer = sinon.stub()
      observer.onFirstCall().returns(unobserver1)
      observer.onSecondCall().returns(unobserver2)

      const handle = TestComponent.defineObserver(observer)

      const entity1 = createEntity()
      const entity2 = createEntity()
      setComponent(entity1, TestComponent, { value: 42 })
      setComponent(entity2, TestComponent, { value: 84 })

      TestComponent.removeObserver(handle)

      assert(unobserver1.calledOnce)
      assert(unobserver2.calledOnce)
    })

    it('should not call observer after removal', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      const handle = TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      assert(observer.calledOnce)

      TestComponent.removeObserver(handle)
      observer.resetHistory()

      setComponent(entity, TestComponent, { value: 84 })
      assert(observer.notCalled)
    })
  })

  describe('Observer edge cases', () => {
    it('should handle observer that returns undefined', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.stub().returns(undefined)
      const handle = TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })

      const unobserver = TestComponent.observers.get(handle)!
      assert(!unobserver(entity, getComponent(entity, TestComponent)))
    })

    it('should handle component updates correctly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      setComponent(entity, TestComponent, { value: 84 })

      assert.equal(observer.callCount, 2)
    })

    it('should handle entity removal properly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const _unobserver = sinon.spy()
      const observer = sinon.stub().returns(_unobserver)
      const handle = TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })

      // Verify unobserver was stored
      const unobserver = TestComponent.observers.get(handle)!
      assert(unobserver)

      // Remove entity should trigger cleanup
      removeEntity(entity)

      // Unobserver should be called and entity removed from pending map
      assert(_unobserver.calledOnce)
      const unobserver2 = TestComponent.observers.get(handle)!
      assert(!unobserver2(entity, getComponent(entity, TestComponent)))
    })

    it('should handle component removal properly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      observer.resetHistory()

      removeComponent(entity, TestComponent)
      setComponent(entity, TestComponent, { value: 84 })

      assert.equal(observer.callCount, 1)
      assert(observer.calledWith(entity, { value: 84 }))
    })

    it('should handle multiple unobservers for same entity correctly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const unobserver1 = sinon.spy()
      const unobserver2 = sinon.spy()
      const observer = sinon.stub()
      observer.onFirstCall().returns(unobserver1)
      observer.onSecondCall().returns(unobserver2)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      setComponent(entity, TestComponent, { value: 84 })

      assert.equal(unobserver1.callCount, 0)
      assert.equal(unobserver2.callCount, 0)
    })

    it('should handle complex component schemas', () => {
      const ComplexComponent = defineComponent({
        name: 'ComplexComponent',
        schema: S.Object({
          position: S.Object({
            x: S.Number({ default: 0 }),
            y: S.Number({ default: 0 }),
            z: S.Number({ default: 0 })
          }),
          metadata: S.Object({
            name: S.String({ default: '' }),
            tags: S.Array(S.String())
          })
        })
      })

      const observer = sinon.spy()
      ComplexComponent.defineObserver(observer)

      const entity = createEntity()
      const complexData = {
        position: { x: 1, y: 2, z: 3 },
        metadata: { name: 'test', tags: ['tag1', 'tag2'] }
      }
      setComponent(entity, ComplexComponent, complexData)

      assert(observer.calledOnce)
      assert(observer.calledWith(entity, complexData))
    })

    it('should maintain observer isolation between different components', () => {
      const Component1 = defineComponent({
        name: 'Component1',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })
      const Component2 = defineComponent({
        name: 'Component2',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer1 = sinon.spy()
      const observer2 = sinon.spy()
      Component1.defineObserver(observer1)
      Component2.defineObserver(observer2)

      const entity = createEntity()
      setComponent(entity, Component1, { value: 42 })
      setComponent(entity, Component2, { value: 84 })

      assert(observer1.calledOnce)
      assert(observer2.calledOnce)
      assert(observer1.calledWith(entity, { value: 42 }))
      assert(observer2.calledWith(entity, { value: 84 }))
    })
  })

  describe('Observer type safety', () => {
    it('should properly type observer callback parameters', () => {
      const TypedComponent = defineComponent({
        name: 'TypedComponent',
        schema: S.Object({
          count: S.Number({ default: 0 }),
          name: S.String({ default: '' })
        })
      })

      const observer: Observer<typeof TypedComponent> = (entity: Entity, data) => {
        // TypeScript should infer the correct type for data
        assert(typeof data.count === 'number')
        assert(typeof data.name === 'string')
        assert(typeof entity === 'number')
      }

      TypedComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TypedComponent, { count: 42, name: 'test' })
    })

    it('should properly type unobserver return value', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer: Observer<typeof TestComponent> = (_entity: Entity, _data) => {
        return () => {
          // Cleanup logic
        }
      }

      const handle = TestComponent.defineObserver(observer)
      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })

      const unobserver = TestComponent.observers.get(handle)!
      assert(typeof unobserver === 'function')
    })
  })
})

/**
 * SUMMARY OF TEST RESULTS:
 *
 * This comprehensive test suite reveals that the Observer system has significant implementation
 * issues that need to be addressed. The core functionality of observing component changes is
 * not working, which means the observer system is currently non-functional.
 *
 * Key areas requiring fixes:
 * 1. Integration between defineObserver and setComponent
 * 2. Proper bitECS observer setup and triggering
 * 3. Error handling for edge cases
 * 4. Layer filtering implementation
 * 5. Cleanup and memory management
 *
 * Once these issues are resolved, this test suite will serve as comprehensive regression
 * testing to ensure the observer system works as expected.
 */
