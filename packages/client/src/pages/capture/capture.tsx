import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import '../../engine'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { LocationService, LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { AuthService } from '@ir-engine/client-core/src/user/services/AuthService'
import { ECSRecordingActions } from '@ir-engine/common/src/recording/ECSRecordingSystem'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { defineActionQueue, useMutableState } from '@ir-engine/hyperflux'
import CaptureUI from '@ir-engine/ui/src/pages/Capture'

import '@ir-engine/client-core/src/world/ClientNetworkModule'

import { hasComponent, setComponent, useQuery } from '@ir-engine/ecs'

import '@ir-engine/engine/src/EngineModule'

import Debug from '@ir-engine/client-core/src/components/Debug'
import { AvatarControllerComponent } from '@ir-engine/engine/src/avatar/components/AvatarControllerComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'

const ecsRecordingErrorActionQueue = defineActionQueue(ECSRecordingActions.error.matches)

const NotifyRecordingErrorSystem = defineSystem({
  uuid: 'notifyRecordingErrorSystem',
  insert: { after: PresentationSystemGroup },
  execute: () => {
    for (const action of ecsRecordingErrorActionQueue()) {
      NotificationService.dispatchNotify(action.error, { variant: 'error' })
    }
  }
})

export const CaptureLocation = () => {
  const locationState = useMutableState(LocationState)

  const params = useParams()

  const locationName = params?.locationName as string | undefined

  useEffect(() => {
    if (locationName) LocationState.setLocationName(locationName)
  }, [])

  useEffect(() => {
    if (locationState.locationName.value) LocationService.getLocationByName(locationState.locationName.value)
  }, [locationState.locationName.value])

  const avatarQuery = useQuery([AvatarControllerComponent, RigidBodyComponent])

  useEffect(() => {
    //removeComponent(avatarQuery[0], AvatarControllerComponent)
    if (hasComponent(avatarQuery[0], RigidBodyComponent))
      setComponent(avatarQuery[0], RigidBodyComponent, { type: 'fixed' })
  }, [avatarQuery])

  useNetwork({ online: !!locationName })

  AuthService.useAPIListeners()

  return (
    <>
      <CaptureUI />
      <Debug />
    </>
  )
}

export default CaptureLocation
