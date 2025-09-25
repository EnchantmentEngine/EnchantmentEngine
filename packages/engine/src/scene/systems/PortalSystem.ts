import { useEffect } from 'react'

import { setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { FollowCameraMode } from '@ir-engine/spatial/src/camera/types/FollowCameraMode'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { PortalState } from '../components/PortalComponent'

const reactor = () => {
  const activePortalEntityState = useHookstate(getMutableState(PortalState).activePortalEntity)

  useEffect(() => {
    const activePortalEntity = activePortalEntityState.value
    if (!activePortalEntity) return
    setComponent(getState(ReferenceSpaceState).viewerEntity, FollowCameraComponent, {
      mode: FollowCameraMode.ShoulderCam
    })
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    AvatarControllerComponent.captureMovement(selfAvatarEntity, activePortalEntity)

    return () => {
      const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
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
