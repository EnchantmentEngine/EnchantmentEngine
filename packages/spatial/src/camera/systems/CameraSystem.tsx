import React, { useEffect } from 'react'
import { PerspectiveCamera } from 'three'

import {
  AnimationSystemGroup,
  defineSystem,
  getComponent,
  getOptionalComponent,
  NetworkObjectOwnedTag,
  NetworkObjectSendPeriodicUpdatesTag,
  QueryReactor,
  removeComponent,
  setComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { getState, useMutableState } from '@ir-engine/hyperflux'

import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSettingsState'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { FollowCameraMode } from '../types/FollowCameraMode'

function CameraReactor() {
  const cameraSettings = useMutableState(CameraSettingsState)

  useEffect(() => {
    if (!cameraSettings?.cameraNearClip) return
    const camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent) as PerspectiveCamera
    if (camera?.isPerspectiveCamera) {
      camera.fov = cameraSettings.fov.value
      camera.near = cameraSettings.cameraNearClip.value
      camera.far = cameraSettings.cameraFarClip.value
      camera.updateProjectionMatrix()
    }
  }, [cameraSettings.fov, cameraSettings.cameraNearClip, cameraSettings.cameraFarClip])

  // TODO: this is messy and not properly reactive; we need a better way to handle camera settings
  useEffect(() => {
    if (!cameraSettings?.fov) return
    const follow = getOptionalComponent(getState(ReferenceSpaceState).viewerEntity, FollowCameraComponent)
    if (follow) {
      let startDistance = cameraSettings.thirdPersonDefaultDistance.value
      let minDistance = cameraSettings.thirdPersonMinDistance.value
      let maxDistance = cameraSettings.thirdPersonMaxDistance.value
      if (follow.mode === FollowCameraMode.FirstPerson) {
        startDistance = 0
        minDistance = 0
        maxDistance = 0
      } else if (follow.mode === FollowCameraMode.ThirdPerson) {
        startDistance = cameraSettings.thirdPersonDefaultDistance.value
        minDistance = cameraSettings.thirdPersonMinDistance.value
        maxDistance = cameraSettings.thirdPersonMaxDistance.value
      } else if (follow.mode === FollowCameraMode.TopDown) {
        startDistance = cameraSettings.topDownDefaultDistance.value
        minDistance = cameraSettings.topDownMinDistance.value
        maxDistance = cameraSettings.topDownMaxDistance.value
      }
      follow.minDistance = minDistance
      follow.maxDistance = maxDistance
      follow.distance = startDistance
    }
  }, [cameraSettings])

  return <QueryReactor Components={[CameraComponent, NetworkObjectOwnedTag]} ChildEntityReactor={OwnedCameraReactor} />
}

const OwnedCameraReactor = () => {
  const entity = useEntityContext()
  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value

  useEffect(() => {
    setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)
    const networkTransform = getComponent(entity, TransformComponent)
    const cameraTransform = getComponent(viewerEntity, TransformComponent)
    setComponent(entity, ComputedTransformComponent, {
      referenceEntities: [viewerEntity],
      computeFunction: () => {
        networkTransform.position.copy(cameraTransform.position)
        networkTransform.rotation.copy(cameraTransform.rotation)
      }
    })
    return () => {
      removeComponent(entity, ComputedTransformComponent)
      removeComponent(entity, NetworkObjectSendPeriodicUpdatesTag)
    }
  }, [])

  return null
}

export const CameraSystem = defineSystem({
  uuid: 'ee.engine.CameraSystem',
  insert: { with: AnimationSystemGroup },
  reactor: () => {
    if (!useMutableState(ReferenceSpaceState).viewerEntity.value) return null
    return <CameraReactor />
  }
})
