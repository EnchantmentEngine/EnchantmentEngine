import React, { useEffect, useRef } from 'react'
import { ArrayCamera, OrthographicCamera, PerspectiveCamera } from 'three'

import {
  AnimationSystemGroup,
  defineSystem,
  Engine,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  NetworkObjectOwnedTag,
  NetworkObjectSendPeriodicUpdatesTag,
  query,
  QueryReactor,
  removeComponent,
  setComponent,
  useEntityContext,
  useOptionalComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import { defineState, getMutableState, getState, none, useMutableState } from '@ir-engine/hyperflux'

import { DEG2RAD } from 'three/src/math/MathUtils'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSettingsState'
import { CameraActions } from '../CameraState'
import { CameraComponent, isOrthographicCamera, isPerspectiveCamera } from '../components/CameraComponent'
import { CameraOrbitComponent } from '../components/CameraOrbitComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { FollowCameraMode } from '../types/FollowCameraMode'
import { ProjectionType } from '../types/ProjectionType'

export const CameraEntityState = defineState({
  name: 'CameraEntityState',
  initial: {} as Record<EntityUUID, true>,

  receptors: {
    onCameraSpawn: CameraActions.spawnCamera.receive((action) => {
      getMutableState(CameraEntityState)[
        UUIDComponent.join({ entityID: action.entityID, entitySourceID: action.entitySourceID })
      ].set(true)
    }),
    onEntityDestroy: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(CameraEntityState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(CameraEntityState)
    return (
      <>
        {state.keys.map((entityUUID: EntityUUID) => (
          <CameraEntity key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const CameraEntity = (props: { entityUUID: EntityUUID }) => {
  const entity = UUIDComponent.useEntityByUUID(props.entityUUID)

  useEffect(() => {
    if (!entity) return
    setComponent(entity, CameraComponent)
  }, [entity])

  return null
}

function CameraReactor() {
  const cameraSettings = useMutableState(CameraSettingsState)
  const camera = useOptionalComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)

  const getCameraAspect = () => {
    if (!camera) return 1
    if (isPerspectiveCamera(camera)) return camera.aspect
    return 1 // Default aspect for orthographic cameras
  }

  const getCameraNearFar = () => {
    if (!camera) return { near: 0.1, far: 2000 }
    return { near: camera.near, far: camera.far }
  }

  const alternateCameraRef = useRef<ArrayCamera | OrthographicCamera>(
    cameraSettings.projectionType.value === ProjectionType.Orthographic
      ? (new ArrayCamera([
          new PerspectiveCamera(
            cameraSettings.fov.value,
            getCameraAspect(),
            cameraSettings.cameraNearClip.value,
            cameraSettings.cameraFarClip.value
          )
        ]) as any)
      : (() => {
          const { near, far } = getCameraNearFar()
          return new OrthographicCamera(-1, 1, 1, -1, near, far) as any
        })()
  )

  useEffect(() => {
    if (!camera) return
    if (cameraSettings.projectionType.value === ProjectionType.Orthographic) {
      if (isOrthographicCamera(camera)) return
      const altCamera = alternateCameraRef.current as OrthographicCamera
      alternateCameraRef.current = camera as ArrayCamera
      setComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent, altCamera)
    } else {
      if (isPerspectiveCamera(camera)) return
      const altCamera = alternateCameraRef.current as ArrayCamera
      alternateCameraRef.current = camera as OrthographicCamera
      setComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent, altCamera)
    }
    camera.updateProjectionMatrix()
  }, [cameraSettings.projectionType])

  useEffect(() => {
    if (!cameraSettings?.cameraNearClip) return
    const camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
    if (isPerspectiveCamera(camera)) {
      camera.fov = cameraSettings.fov.value
      camera.near = cameraSettings.cameraNearClip.value
      camera.far = cameraSettings.cameraFarClip.value
      camera.updateProjectionMatrix()
    }
  }, [cameraSettings.fov, cameraSettings.cameraNearClip, cameraSettings.cameraFarClip])

  // TODO: this is messy and not properly reactive; we need a better way to handle camera settings
  useEffect(() => {
    if (!cameraSettings?.fov) return
    const follow = getOptionalComponent(Engine.instance.cameraEntity, FollowCameraComponent)
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

const updateOrthographicCamera = (camera: OrthographicCamera, distance: number, aspect: number, fov: number) => {
  const heightVisible = 2 * Math.tan((DEG2RAD * fov) / 2) * distance
  const widthVisible = heightVisible * aspect

  camera.left = -widthVisible / 2
  camera.right = widthVisible / 2
  camera.top = heightVisible / 2
  camera.bottom = -heightVisible / 2
}

const updatePerspectiveCamera = (camera: PerspectiveCamera, aspect: number) => {
  camera.aspect = aspect
}

const execute = () => {
  for (const cameraEid of query([RendererComponent, CameraComponent, CameraOrbitComponent])) {
    const transform = getComponent(cameraEid, TransformComponent)
    const cameraOrbit = getComponent(cameraEid, CameraOrbitComponent)
    const camera = getComponent(cameraEid, CameraComponent)
    const renderer = getComponent(cameraEid, RendererComponent)

    if (!renderer.canvas?.parentElement) {
      continue
    }

    const canvasParent = renderer.canvas.parentElement
    const aspect = canvasParent.clientWidth / canvasParent.clientHeight

    if (isOrthographicCamera(camera)) {
      const fov = getState(CameraSettingsState).fov
      const distance = transform.position.distanceTo(cameraOrbit.cameraOrbitCenter)
      updateOrthographicCamera(camera, distance, aspect, fov)
    } else if (isPerspectiveCamera(camera)) {
      updatePerspectiveCamera(camera, aspect)
    }

    camera.updateProjectionMatrix()
  }
}

export const CameraSystem = defineSystem({
  uuid: 'ee.engine.CameraSystem',
  insert: { with: AnimationSystemGroup },
  execute: execute,
  reactor: () => {
    if (!useMutableState(ReferenceSpaceState).viewerEntity.value) return null
    return <CameraReactor />
  }
})
