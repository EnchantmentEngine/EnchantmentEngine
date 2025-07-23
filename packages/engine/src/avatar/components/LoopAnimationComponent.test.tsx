import {
  createEngine,
  destroyEngine,
  EntityID,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest'

import { createTestGLTFEntity, rings_gltf } from '../../../tests/avatar/mockAnimatedAvatar'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { LoopAnimationComponent } from './LoopAnimationComponent'

describe('LoopAnimationComponent', () => {
  describe('Animation is started/stopped', () => {
    overrideFileLoaderLoad()

    beforeEach(() => {
      createEngine()
      startEngineReactor()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('Should start animation when index is set', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      await vi.waitFor(
        () => {
          return GLTFComponent.isSceneLoaded(entity)
        },
        { timeout: 20000, interval: 100 }
      )

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: 0
      })

      await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        assert(!!loopAnimationComponent._action)
        assert(loopAnimationComponent._action.isRunning())
      })
    })

    it('Should stop animation when index is set to -1', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      await vi.waitFor(
        () => {
          return GLTFComponent.isSceneLoaded(entity)
        },
        { timeout: 20000 }
      )

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: 0
      })

      await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        assert(!!loopAnimationComponent._action)
        assert(loopAnimationComponent._action.isRunning())
      })
    })

    it('Should stop animation when index is set to -1', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      await vi.waitFor(
        () => {
          return GLTFComponent.isSceneLoaded(entity)
        },
        { timeout: 20000 }
      )

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: 0
      })

      await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        assert(!!loopAnimationComponent._action)
        assert(loopAnimationComponent._action.isRunning())
      })

      const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
      const action = loopAnimationComponent._action
      assert(!!action)
      assert(action.isRunning())

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: -1
      })

      await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        assert(loopAnimationComponent._action === null)
        assert(action.isRunning() === false)
      })
    })

    it('Should stop animation when the component is removed', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      await vi.waitFor(
        () => {
          return GLTFComponent.isSceneLoaded(entity)
        },
        { timeout: 20000 }
      )

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: 0
      })

      const action = await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        const action = loopAnimationComponent._action
        assert(!!action)
        assert(action.isRunning())
        return action
      })

      removeComponent(entity, LoopAnimationComponent)

      await vi.waitFor(() => {
        assert(hasComponent(entity, LoopAnimationComponent) === false)
        assert(action.isRunning() === false)
      })
    })
  })
})
