import { getComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'

import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { MotionCapturePoseComponent } from './MotionCapturePoseComponent'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'

export type MotionCapturePoses = 'sitting' | 'standing'
/**todo: this can be filled out with hold/end data for the pose */
export type MotionCapturePoseState = { begun: boolean }

const minSeatedAngle = 1.25, //radians
  poseHoldTime = 0.25 //seconds
let poseHoldTimer = 0

export const evaluatePose = (entity: Entity) => {
  const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
  if (!rig.hips) return

  const deltaSeconds = getState(ECSState).deltaSeconds

  if (!hasComponent(entity, MotionCapturePoseComponent)) setComponent(entity, MotionCapturePoseComponent)

  const pose = getComponent(entity, MotionCapturePoseComponent)

  if (!MotionCaptureRigComponent.solvingLowerBody[entity]) return 'none'

  const rightUpperLeg = getComponent(rig.rightUpperLeg, BoneComponent).quaternion
  const leftUpperLeg = getComponent(rig.leftUpperLeg, BoneComponent).quaternion
  const spine = getComponent(rig.spine, BoneComponent).quaternion
  /**Detect if our legs pose has changed by their angle */
  const getLegsSeatedChange = (toPose: MotionCapturePoses): boolean => {
    let metTargetStateAngle =
      rightUpperLeg.angleTo(spine) < minSeatedAngle && leftUpperLeg.angleTo(spine) < minSeatedAngle
    metTargetStateAngle = toPose == 'sitting' ? !metTargetStateAngle : metTargetStateAngle

    if (!metTargetStateAngle || pose[toPose]) return false

    poseHoldTimer += deltaSeconds
    if (poseHoldTimer > poseHoldTime) {
      //remove old pose
      delete pose[toPose === 'standing' ? 'sitting' : 'standing']
      poseHoldTimer = 0
      return true
    }

    return false
  }

  /**if we find a change in pose, set a new pose
   * otherwise, set the begun property to false */
  if (getLegsSeatedChange('sitting')) {
    pose['sitting'] = { begun: true }
  } else if (pose.sitting && pose.sitting.begun) pose.sitting.begun = false

  if (getLegsSeatedChange('standing')) pose['standing'] = { begun: true }
  else if (pose.standing && pose.standing.begun) pose.standing.begun = false
}
