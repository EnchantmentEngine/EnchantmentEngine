import { Vector3 } from 'three'

import { iterateEntityNode } from '@ir-engine/ecs'
import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
// Use TransformComponent.computeTransformMatrix instead

import { AnimationState } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarProportionsComponent } from '../components/AvatarComponent'

const hipsPos = new Vector3(),
  headPos = new Vector3(),
  leftFootPos = new Vector3(),
  leftToesPos = new Vector3(),
  rightFootPos = new Vector3(),
  leftLowerLegPos = new Vector3(),
  leftUpperLegPos = new Vector3(),
  footGap = new Vector3(),
  eyePos = new Vector3()
// box = new Box3()

export const setupAvatarProportions = (entity: Entity) => {
  iterateEntityNode(entity, TransformComponent.computeTransformMatrix, (e) => hasComponent(e, TransformComponent))

  const worldHeight = TransformComponent.getWorldPosition(entity, new Vector3()).y
  const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
  if (!rig) return

  const requiredBones = ['hips', 'head', 'leftFoot', 'rightFoot', 'leftLowerLeg', 'leftUpperLeg'] as const
  for (const boneName of requiredBones) {
    const boneEntity = rig[boneName]
    if (!boneEntity || !hasComponent(boneEntity, TransformComponent)) return

    const transform = getComponent(boneEntity, TransformComponent)
    if (!transform.matrixWorld) return

    TransformComponent.computeTransformMatrix(boneEntity)
  }

  TransformComponent.getWorldPosition(rig.hips, hipsPos)
  TransformComponent.getWorldPosition(rig.head, headPos)
  TransformComponent.getWorldPosition(rig.leftFoot, leftFootPos)
  TransformComponent.getWorldPosition(rig.rightFoot, rightFootPos)
  rig.leftToes && TransformComponent.getWorldPosition(rig.leftToes, leftToesPos)
  TransformComponent.getWorldPosition(rig.leftLowerLeg, leftLowerLegPos)
  TransformComponent.getWorldPosition(rig.leftUpperLeg, leftUpperLegPos)
  rig.leftEye ? TransformComponent.getWorldPosition(rig.leftEye, eyePos) : eyePos.copy(headPos).setY(headPos.y + 0.1) // fallback to rough estimation if no eye bone is present

  setComponent(entity, AvatarProportionsComponent, {
    avatarHeight: Math.abs(headPos.y - worldHeight + 0.25),
    torsoLength: Math.abs(headPos.y - hipsPos.y),
    upperLegLength: Math.abs(hipsPos.y - leftLowerLegPos.y),
    lowerLegLength: Math.abs(leftLowerLegPos.y - leftFootPos.y),
    hipsHeight: Math.abs(hipsPos.y - worldHeight),
    eyeHeight: eyePos.y - worldHeight,
    footHeight: leftFootPos.y - worldHeight,
    footGap: footGap.subVectors(leftFootPos, rightFootPos).length(),
    footAngle: rig.leftToes ? Math.atan2(leftFootPos.z - leftToesPos.z, leftFootPos.y - leftToesPos.y) : 0
  })
}

export const getAllLoadedAnimations = () =>
  Object.values(getState(AnimationState).loadedAnimations)
    .map((anim) => getComponent(anim, AnimationComponent).animations)
    .flat()
