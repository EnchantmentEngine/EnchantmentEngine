import {
  createEngine,
  destroyEngine,
  Entity,
  EntityID,
  EntityUUIDPair,
  getComponent,
  getOptionalComponent,
  setComponent,
  SystemDefinitions,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { applyIncomingActions, startReactor } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import {
  TransformDirtyCleanupSystem,
  TransformDirtyUpdateSystem,
  TransformSystem
} from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockAnimatedAvatar } from '../../../tests/avatar/mockAnimatedAvatar'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import {
  AvatarIKComponent,
  AvatarIKPrefab,
  AvatarIKTargetComponent,
  IKMatrixComponent
} from '../components/AvatarIKComponents'
import { AnimationSystem } from './AnimationSystem'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'
import { AvatarIkReactor, AvatarIKSystem } from './AvatarIKSystem'

describe('AvatarIKSystem', () => {
  overrideFileLoaderLoad()

  beforeEach(async () => {
    createEngine()
    startEngineReactor()
  })

  afterEach(() => {
    destroyEngine()
  })

  /** @todo this is broken :( */
  it.skip('should solve IK such that every tip joint world position is at the ik target', async () => {
    const avatarUuidPair = { entitySourceID: 'user-id', entityID: 'avatar' } as EntityUUIDPair
    const avatarUuid = UUIDComponent.join(avatarUuidPair)
    let avatarEntity = UndefinedEntity as Entity
    avatarEntity = await mockAnimatedAvatar()
    setComponent(avatarEntity, UUIDComponent, avatarUuidPair)
    setComponent(avatarEntity, AvatarIKComponent)
    startReactor(AvatarIkReactor)
    const rig = getComponent(avatarEntity, AvatarRigComponent)

    // no idea why this is necessary
    for (const entity in rig.entitiesToBones) {
      const bone = getOptionalComponent(entity as unknown as Entity, BoneComponent)
      if (bone) bone.quaternion.fastSlerp = Quaternion.prototype.fastSlerp
    }

    await vi.waitFor(() => {
      expect(
        getOptionalComponent(rig.bonesToEntities.rightUpperArm, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightLowerArm, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightHand, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftUpperArm, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftLowerArm, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftHand, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightUpperLeg, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightLowerLeg, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.rightFoot, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftUpperLeg, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftLowerLeg, IKMatrixComponent) &&
          getOptionalComponent(rig.bonesToEntities.leftFoot, IKMatrixComponent)
      ).toBeTruthy()
    })

    for (const targetName of Object.values(ikTargets)) {
      AvatarIKPrefab.spawn({
        entityID: targetName as EntityID,
        parentUUID: avatarUuid,
        entitySourceID: avatarUuidPair.entitySourceID,
        components: {
          [NameComponent.jsonID]: `${avatarUuidPair.entitySourceID}'s ${targetName}`
        }
      })
    }
    applyIncomingActions()

    // Create the concatenated UUIDs
    const rightHandUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: ikTargets.rightHand as EntityID
    })
    const leftHandUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: ikTargets.leftHand as EntityID
    })
    const leftFootUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: ikTargets.leftFoot as EntityID
    })
    const rightFootUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: ikTargets.rightFoot as EntityID
    })
    const headUuid = UUIDComponent.join({
      entitySourceID: avatarUuidPair.entitySourceID,
      entityID: ikTargets.head as EntityID
    })

    await vi.waitUntil(
      () =>
        UUIDComponent.getEntityByUUID(rightHandUuid) &&
        UUIDComponent.getEntityByUUID(headUuid) &&
        UUIDComponent.getEntityByUUID(leftHandUuid)
    )

    const headEntity = UUIDComponent.getEntityByUUID(headUuid)
    const headPosition = getComponent(headEntity, TransformComponent).position
    headPosition.set(0, 1.8, 0)

    const rightHandEntity = UUIDComponent.getEntityByUUID(rightHandUuid)
    const rightHandPosition = getComponent(rightHandEntity, TransformComponent).position
    rightHandPosition.set(-0.2, 1, 0)

    const leftHandEntity = UUIDComponent.getEntityByUUID(leftHandUuid)
    const leftHandPosition = getComponent(leftHandEntity, TransformComponent).position
    leftHandPosition.set(0.2, 1, 0)

    const leftFootEntity = UUIDComponent.getEntityByUUID(leftFootUuid)
    const leftFootPosition = getComponent(leftFootEntity, TransformComponent).position
    leftFootPosition.set(-0.1, 0.1, 0)

    const rightFootEntity = UUIDComponent.getEntityByUUID(rightFootUuid)
    const rightFootPosition = getComponent(rightFootEntity, TransformComponent).position
    rightFootPosition.set(-0.1, 0.1, 0)

    AvatarIKTargetComponent.blendWeight[headEntity] = 1
    AvatarIKTargetComponent.blendWeight[rightHandEntity] = 1
    AvatarIKTargetComponent.blendWeight[leftHandEntity] = 1
    AvatarIKTargetComponent.blendWeight[leftFootEntity] = 1
    AvatarIKTargetComponent.blendWeight[rightFootEntity] = 1

    SystemDefinitions.get(AvatarAnimationSystem)?.execute()
    SystemDefinitions.get(AvatarIKSystem)?.execute()
    SystemDefinitions.get(AnimationSystem)?.execute()
    SystemDefinitions.get(TransformDirtyUpdateSystem)?.execute()
    SystemDefinitions.get(TransformSystem)?.execute()
    SystemDefinitions.get(TransformDirtyCleanupSystem)?.execute()

    const rightHandIkPos = TransformComponent.getWorldPosition(
      getComponent(avatarEntity, AvatarRigComponent).bonesToEntities.rightHand,
      new Vector3()
    )
    const leftHandIkPos = TransformComponent.getWorldPosition(
      getComponent(avatarEntity, AvatarRigComponent).bonesToEntities.leftHand,
      new Vector3()
    )
    const leftFootIkPos = TransformComponent.getWorldPosition(
      getComponent(avatarEntity, AvatarRigComponent).bonesToEntities.leftFoot,
      new Vector3()
    )
    const rightFootIkPos = TransformComponent.getWorldPosition(
      getComponent(avatarEntity, AvatarRigComponent).bonesToEntities.rightFoot,
      new Vector3()
    )

    console.log(`Right hand IK position: ${rightHandIkPos.toArray()}`)
    console.log(`Right hand target position: ${rightHandPosition.toArray()}`)
    expect(rightHandIkPos.distanceTo(rightHandPosition)).toBeLessThan(0.1)
    expect(leftHandIkPos.distanceTo(leftHandPosition)).toBeLessThan(0.1)
    expect(leftFootIkPos.distanceTo(leftFootPosition)).toBeLessThan(0.1)
    expect(rightFootIkPos.distanceTo(rightFootPosition)).toBeLessThan(0.1)
  })
})
