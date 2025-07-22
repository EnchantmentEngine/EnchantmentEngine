import {
  createEngine,
  destroyEngine,
  EntityID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  iterateEntityNode,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { AnimationComponent } from './AnimationComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'

import { createTestGLTFEntity, mockAnimatedAvatar, rings_gltf } from '../../../tests/avatar/mockAnimatedAvatar'
import { startEngineReactor } from '../../../tests/startEngineReactor'

describe('AnimationComponent', () => {
  describe('ECS PropertyBinding', () => {
    overrideFileLoaderLoad()

    beforeEach(() => {
      createEngine()
      startEngineReactor()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should bind animation tracks to entities based on node id sourced from entity UUIDs', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      //extra wait for animation component to prevent race conditions
      await vi.waitFor(
        () => {
          expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
        },
        { timeout: 20000 }
      )
      const startingFlatQuaternions = [] as number[]
      iterateEntityNode(entity, (e) => {
        if (hasComponent(e, MeshComponent))
          startingFlatQuaternions.push(...getComponent(e, TransformComponent).rotation.toArray())
      })

      const animationComponent = getComponent(entity, AnimationComponent)
      animationComponent.mixer.clipAction(animationComponent.animations[0]).play()
      animationComponent.mixer.update(0.1)

      const animatedFlatQuaternions = [] as number[]
      iterateEntityNode(entity, (e) => {
        if (hasComponent(e, MeshComponent))
          animatedFlatQuaternions.push(...getComponent(e, TransformComponent).rotation.toArray())
      })

      //quaternions update as a side effect of successful animation binding, so assert that they've changed
      for (let i = 0; i < startingFlatQuaternions.length / 4; i++) {
        const startX = startingFlatQuaternions[i]
        const startY = startingFlatQuaternions[i + 1]
        const startZ = startingFlatQuaternions[i + 2]
        const startW = startingFlatQuaternions[i + 3]
        const animatedX = animatedFlatQuaternions[i]
        const animatedY = animatedFlatQuaternions[i + 1]
        const animatedZ = animatedFlatQuaternions[i + 2]
        const animatedW = animatedFlatQuaternions[i + 3]
        assert(startX + startY + startZ + startW !== animatedX + animatedY + animatedZ + animatedW)
      }
    })

    it('should bind animation tracks to rig entities based on VRM schema', async () => {
      const vrmEntity = await mockAnimatedAvatar()

      const rig = getComponent(vrmEntity, AvatarRigComponent).entitiesToBones

      const startRigQuaternions = [] as number[]
      for (const bone in rig) {
        if (hasComponent(rig[bone], TransformComponent))
          startRigQuaternions.push(...getComponent(rig[bone], TransformComponent).rotation.toArray())
      }

      const animationComponent = getComponent(vrmEntity, AnimationComponent)
      animationComponent.mixer.clipAction(animationComponent.animations[0]).play()
      animationComponent.mixer.update(0.1)

      const animatedRigQuaternions = [] as number[]
      for (const bone in rig) {
        if (hasComponent(rig[bone], TransformComponent))
          animatedRigQuaternions.push(...getComponent(rig[bone], TransformComponent).rotation.toArray())
      }

      for (let i = 0; i < startRigQuaternions.length / 4; i++) {
        const startX = startRigQuaternions[i]
        const startY = startRigQuaternions[i + 1]
        const startZ = startRigQuaternions[i + 2]
        const startW = startRigQuaternions[i + 3]
        const animatedX = animatedRigQuaternions[i]
        const animatedY = animatedRigQuaternions[i + 1]
        const animatedZ = animatedRigQuaternions[i + 2]
        const animatedW = animatedRigQuaternions[i + 3]
        assert(startX + startY + startZ + startW !== animatedX + animatedY + animatedZ + animatedW)
      }
      // unmount()
    })
  })
})
