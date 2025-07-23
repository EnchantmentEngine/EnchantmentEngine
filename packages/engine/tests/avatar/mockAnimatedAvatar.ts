import {
  createEntity,
  EntityID,
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { AnimationMixer } from 'three'
import { vi } from 'vitest'
import { AnimationComponent } from '../../src/avatar/components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../../src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../src/avatar/components/AvatarComponent'

import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { setupMixamoAnimation } from '../../src/avatar/systems/AvatarAnimationSystem'
import { GLTFComponent } from '../../src/gltf/GLTFComponent'

export const createTestGLTFEntity = () => {
  const parent = createEntity()
  setComponent(parent, EntityTreeComponent)
  setComponent(parent, UUIDComponent, {
    entitySourceID: 'source' as SourceID,
    entityID: 'test-gltf-entity' as EntityID
  })
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

export const default_url = 'packages/projects/default-project/assets'
export const rings_gltf = default_url + '/rings.glb'
export const animation_pack = default_url + '/animations/emotes.glb'
export const vrm = default_url + '/avatars/irRobot.vrm'

/**Used to mock non user networked animated avatars */
export const mockAnimatedAvatar = async () => {
  const animationPackEntity = createTestGLTFEntity()

  setComponent(animationPackEntity, UUIDComponent, {
    entitySourceID: 'source' as SourceID,
    entityID: 'animation-pack' as EntityID
  })
  setComponent(animationPackEntity, GLTFComponent, { src: animation_pack })
  setComponent(animationPackEntity, NameComponent, 'animationPack')

  const vrmEntity = createTestGLTFEntity()

  setComponent(vrmEntity, UUIDComponent, { entitySourceID: 'source' as SourceID, entityID: 'vrm' as EntityID })
  setComponent(vrmEntity, GLTFComponent, { src: vrm })
  setComponent(vrmEntity, AvatarRigComponent)
  setComponent(vrmEntity, AvatarAnimationComponent)
  setComponent(vrmEntity, AvatarComponent)

  //extra wait for animation component to prevent race conditions
  await vi.waitUntil(
    () => {
      return (
        getOptionalComponent(animationPackEntity, AnimationComponent) &&
        getOptionalComponent(vrmEntity, AvatarRigComponent)?.bonesToEntities.hips
      )
    },
    { timeout: 20000 }
  )

  setupMixamoAnimation(animationPackEntity)

  setComponent(vrmEntity, AnimationComponent, {
    animations: getComponent(animationPackEntity, AnimationComponent).animations,
    mixer: new AnimationMixer(getComponent(vrmEntity, ObjectComponent))
  })

  return vrmEntity
}
