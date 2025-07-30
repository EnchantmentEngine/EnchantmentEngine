import { AnimationClip, Quaternion, QuaternionKeyframeTrack, Vector3, VectorKeyframeTrack } from 'three'

import { Entity, EntityTreeComponent, EntityUUID, getComponent, setComponent, UUIDComponent } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { getHips } from '../AvatarBoneMatching'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { VRMHumanBoneName } from '../maps/VRMHumanBoneName'

const restRotationInverse = new Quaternion()
const parentRestWorldRotation = new Quaternion()
const _quatA = new Quaternion()
const _scale = new Vector3()

/**Converts an animation clip to normalized bone space for use with any T-Posed normalized humanoid rig
 */
export const normalizeAnimationClips = (gltfEntity: Entity) => {
  const hips = getHips(gltfEntity)
  if (!hips) return
  const hipsPositionScale = TransformComponent.getWorldScale(hips, _scale).y
  getComponent(hips, ObjectComponent).updateWorldMatrix(false, true)

  for (const clip of getComponent(gltfEntity, AnimationComponent).animations)
    for (let i = 0; i < clip.tracks.length; i++) {
      const track = clip.tracks[i]
      const trackSplitted = track.name.lastIndexOf('.')
      const rigNodeName = track.name.slice(0, trackSplitted)
      const rigNodeEntity = UUIDComponent.getEntityByUUID((UUIDComponent.get(gltfEntity) + rigNodeName) as EntityUUID)
      if (!rigNodeEntity) continue

      // Store rotations of rest-pose
      TransformComponent.getWorldRotation(rigNodeEntity, restRotationInverse).invert()
      const parentEntity = getComponent(rigNodeEntity, EntityTreeComponent).parentEntity
      TransformComponent.getWorldRotation(parentEntity, parentRestWorldRotation)

      if (track instanceof QuaternionKeyframeTrack) {
        // Retarget rotation of mixamoRig to NormalizedBone
        for (let i = 0; i < track.values.length; i += 4) {
          const flatQuaternion = track.values.slice(i, i + 4)

          _quatA.fromArray(flatQuaternion)

          _quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse)

          _quatA.toArray(flatQuaternion)

          flatQuaternion.forEach((v, index) => {
            track.values[index + i] = v
          })
        }
      } else if (track instanceof VectorKeyframeTrack) {
        const isPosition = track.name.includes('position')
        // quick dirty check for hips - we only want to keep hips position for root motion
        if (rigNodeEntity !== hips || !isPosition) {
          clip.tracks.splice(i, 1)
          i--
          continue
        }
        track.values.forEach((v, index) => {
          track.values[index] = isPosition ? v * hipsPositionScale : v
        })
      }
    }
}

/**Retargets animation clips from the source to the VRM schema
 */
export const retargetAnimationClips = (sourceAnimationEntity) => {
  const animationClips = [] as AnimationClip[]
  const clips = getComponent(sourceAnimationEntity, AnimationComponent).animations
  const sourceRigMap = getComponent(sourceAnimationEntity, AvatarRigComponent).entitiesToBones
  for (const clip of clips) {
    const newClip = new AnimationClip(clip.name, clip.duration, [], clip.blendMode)
    for (const track of clip.tracks) {
      const sourceEntity = UUIDComponent.getEntityByUUID(
        (UUIDComponent.get(sourceAnimationEntity) + track.name.substring(0, track.name.lastIndexOf('.'))) as EntityUUID
      )
      if (!sourceEntity) continue
      const vrmBone = sourceRigMap[sourceEntity] as VRMHumanBoneName
      if (!vrmBone) continue
      const newTrack = track.clone()
      newTrack.name = vrmBone + '.' + track.name.substring(track.name.lastIndexOf('.') + 1)
      newClip.tracks.push(newTrack)
    }
    animationClips.push(newClip)
  }
  setComponent(sourceAnimationEntity, AnimationComponent, { animations: animationClips })
}
