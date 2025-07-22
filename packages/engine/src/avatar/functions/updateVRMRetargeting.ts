import { Matrix4, Quaternion, Vector3 } from 'three'

import { getComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { VRMHumanBoneName } from '../maps/VRMHumanBoneName'

const emptyQuaternion = new Quaternion()

export const updateVRMRetargeting = (avatarEntity: Entity) => {
  const rig = getComponent(avatarEntity, AvatarRigComponent)
  if (!rig?.bonesToEntities.hips) return

  for (const boneName in rig.bonesToEntities) {
    const boneEntity = rig.bonesToEntities[boneName]
    if (!TransformComponent.dirty[boneEntity]) continue
    const bone = getOptionalComponent(boneEntity, TransformComponent)
    if (!bone) continue

    const parentWorldRotation = rig.parentWorldRotations[boneName] ?? emptyQuaternion
    const parentInverseWorldRotation = rig.parentWorldRotationInverses[boneName] ?? emptyQuaternion
    const worldRotation = rig.rotations[boneName] ?? emptyQuaternion

    _quatA
      .copy(bone.rotation)
      .multiply(parentWorldRotation)
      .premultiply(parentInverseWorldRotation)
      .multiply(worldRotation)

    TransformComponent.rotation.x[boneEntity] = _quatA.x
    TransformComponent.rotation.y[boneEntity] = _quatA.y
    TransformComponent.rotation.z[boneEntity] = _quatA.z
    TransformComponent.rotation.w[boneEntity] = _quatA.w

    if (boneName === VRMHumanBoneName.Hips) {
      const parentEntity = getOptionalComponent(boneEntity, EntityTreeComponent)?.parentEntity
      if (!parentEntity) continue
      const parentBone = getOptionalComponent(parentEntity, TransformComponent)
      if (!parentBone) continue
      _boneWorldPos.copy(bone.position).applyMatrix4(parentBone?.matrixWorld)
      _parentWorldMatrixInverse.copy(parentBone.matrixWorld).invert()

      _boneWorldPos.applyMatrix4(_parentWorldMatrixInverse)
      _boneWorldPos.applyQuaternion(parentInverseWorldRotation)

      if (hasComponent(avatarEntity, AvatarComponent)) {
        _boneWorldPos.multiplyScalar(getComponent(avatarEntity, AvatarComponent).hipsHeight)
      }
      bone.position.copy(_boneWorldPos)
    }
  }
}

const _quatA = new Quaternion()
const _boneWorldPos = new Vector3()
const _parentWorldMatrixInverse = new Matrix4()
