import { Quaternion, Vector3 } from 'three'

import { EngineState } from '@ir-engine/ecs'
import { getComponent, getOptionalComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { MotionCapturePoseComponent } from '../../mocap/MotionCapturePoseComponent'
import { MotionCaptureRigComponent } from '../../mocap/MotionCaptureRigComponent'
import { MountPointComponent } from '../../scene/components/MountPointComponent'
import { SittingComponent } from '../../scene/components/SittingComponent'
import { InteractableState } from '../functions/interactableFunctions'

const sittingIdleQuery = defineQuery([SittingComponent])

const execute = () => {
  if (getState(EngineState).isEditing) return
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()

  /*Consider mocap inputs in the event we want to snap a real world seated person
    to a mount point, to maintain physical continuity
  */
  const mocapInputSource = getOptionalComponent(selfAvatarEntity, MotionCapturePoseComponent)
  if (mocapInputSource) {
    if (mocapInputSource.sitting?.begun)
      MountPointComponent.mountEntity(selfAvatarEntity, getState(InteractableState).available[0])
    if (mocapInputSource.standing?.begun) MountPointComponent.unmountEntity(selfAvatarEntity)
  }

  for (const entity of sittingIdleQuery()) {
    const controller = getComponent(entity, AvatarControllerComponent)
    if (controller.gamepadLocalInput.lengthSq() > 0.01) {
      MountPointComponent.unmountEntity(entity)
      continue
    }
    const mountTransform = getComponent(getComponent(entity, SittingComponent).mountPointEntity, TransformComponent)

    mountTransform.matrixWorld.decompose(vec3_0, quat, vec3_1)
    const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
    vec3_0.y -= getComponent(rig.hips, BoneComponent).position.y - 0.25
    setComponent(entity, TransformComponent, { rotation: mountTransform.rotation, position: vec3_0 })

    if (!hasComponent(entity, MotionCaptureRigComponent)) continue

    //Force mocapped avatar to always face the mount point's rotation
    //const hipsQaut = new Quaternion(
    //  MotionCaptureRigComponent.rig.hips.x[entity],
    //  MotionCaptureRigComponent.rig.hips.y[entity],
    //  MotionCaptureRigComponent.rig.hips.z[entity],
    //  MotionCaptureRigComponent.rig.hips.w[entity]
    //)
    //avatarTransform.rotation.copy(mountTransform.rotation).multiply(hipsQaut.invert())
  }
}

const vec3_0 = new Vector3()
const quat = new Quaternion()
const vec3_1 = new Vector3()

export const MountPointSystem = defineSystem({
  uuid: 'ee.engine.MountPointSystem',
  insert: { with: AnimationSystemGroup },
  execute
})
