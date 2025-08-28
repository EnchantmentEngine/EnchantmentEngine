import {
  createEngine,
  destroyEngine,
  EntityID,
  getComponent,
  getOptionalComponent,
  setComponent,
  SourceID,
  traverseEntityNode,
  UUIDComponent
} from '@ir-engine/ecs'
import { applyIncomingActions } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { act, render } from '@testing-library/react'
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestGLTFEntity } from '../../../tests/avatar/mockAnimatedAvatar'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { mixamoVRMRigMap } from '../AvatarBoneMatching'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { retargetAnimationClips } from './retargetingFunctions'

const default_url = 'packages/projects/default-project/assets'
const animation_pack = default_url + '/animations/emotes.glb'

describe('retargetingFunctions', () => {
  describe('retargetAnimationClips', () => {
    overrideFileLoaderLoad()

    beforeEach(() => {
      createEngine()
      startEngineReactor()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should bind animation tracks to rig entities based on VRM schema', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'animation-pack' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: animation_pack })
      setComponent(entity, NameComponent, 'animationPack')

      await act(() => render(null))

      applyIncomingActions()

      //extra wait for animation component to prevent race conditions
      await vi.waitFor(
        async () => {
          await act(() => render(null))
          expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
        },
        { timeout: 20000 }
      )

      setComponent(entity, AvatarRigComponent)
      traverseEntityNode(entity, (child) => {
        const name = getComponent(child, NameComponent).replace(':', '')
        if (mixamoVRMRigMap[name]) AvatarRigComponent.setBone(entity, child, mixamoVRMRigMap[name])
      })

      retargetAnimationClips(entity)

      const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
      for (const clip of getComponent(entity, AnimationComponent).animations) {
        for (const track of clip.tracks) {
          assert.equal(!!rig[track.name.split('.')[0]], true)
        }
      }
    })
  })
})
