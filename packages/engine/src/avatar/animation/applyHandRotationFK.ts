import { Entity, getComponent } from '@ir-engine/ecs'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { XRJointAvatarBoneMap } from '@ir-engine/spatial/src/xr/XRComponents'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { VRMHumanBoneName } from '../maps/VRMHumanBoneName'

export const applyHandRotationFK = (avatarEntity: Entity, handedness: 'left' | 'right', rotations: Float32Array) => {
  const bones = Object.values(XRJointAvatarBoneMap)
  for (let i = 0; i < bones.length; i++) {
    const label = bones[i]
    const boneName = `${handedness}${label}` as VRMHumanBoneName
    const bone = getComponent(avatarEntity, AvatarRigComponent).bonesToEntities[boneName]
    if (!bone) continue
    getComponent(bone, BoneComponent).quaternion.fromArray(rotations, i * 4)
  }
}
