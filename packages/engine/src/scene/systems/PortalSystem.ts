import { useEffect } from 'react'

import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent, getMutableComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { FollowCameraMode } from '@ir-engine/spatial/src/camera/types/FollowCameraMode'

import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { SpawnPoseState } from '@ir-engine/spatial/src/transform/SpawnPoseState'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { PortalComponent, PortalState } from '../components/PortalComponent'

const reactor = () => {
  const activePortalEntityState = useHookstate(getMutableState(PortalState).activePortalEntity)

  useEffect(() => {
    const activePortalEntity = activePortalEntityState.value
    if (!activePortalEntity) return
    const activePortal = getComponent(activePortalEntity, PortalComponent)
    getMutableComponent(Engine.instance.cameraEntity, FollowCameraComponent).mode.set(FollowCameraMode.ShoulderCam)
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    AvatarControllerComponent.captureMovement(selfAvatarEntity, activePortalEntity)

    return () => {
      const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
      getState(SpawnPoseState)[UUIDComponent.get(selfAvatarEntity)].spawnPosition.copy(activePortal.remoteSpawnPosition)
      AvatarControllerComponent.releaseMovement(selfAvatarEntity, activePortalEntity)
      getMutableState(PortalState).lastPortalTimeout.set(Date.now())
    }
  }, [activePortalEntityState])

  return null
}

export const PortalSystem = defineSystem({
  uuid: 'ee.engine.PortalSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
