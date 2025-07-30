import React, { useEffect } from 'react'

import {
  AnimationSystemGroup,
  defineSystem,
  Engine,
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
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
import { CameraComponent } from '../components/CameraComponent'
import { CameraOrbitComponent } from '../components/CameraOrbitComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { OrthographicCameraComponent } from '../components/OrthographicCameraComponent'
import { PerspectiveCameraComponent } from '../components/PerspectiveCameraComponent'
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
    setComponent(entity, PerspectiveCameraComponent)
  }, [entity])

  return null
}

function CameraReactor() {
  const cameraSettings = useMutableState(CameraSettingsState)
  const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value
  const camera = useOptionalComponent(viewerEntity, CameraComponent)

  const getCameraAspect = () => {
    if (!camera) return 1
    if (hasComponent(viewerEntity, PerspectiveCameraComponent))
      return getComponent(viewerEntity, PerspectiveCameraComponent).aspect
    if (hasComponent(viewerEntity, OrthographicCameraComponent))
      return (
        getComponent(viewerEntity, OrthographicCameraComponent).width /
        getComponent(viewerEntity, OrthographicCameraComponent).height
      )
    return 1
  }

  const getCameraNearFar = () => {
    if (!camera) return { near: 0.1, far: 2000 }
    return { near: camera.near, far: camera.far }
  }

  useEffect(() => {
    if (!camera) return
    if (cameraSettings.projectionType.value === ProjectionType.Orthographic) {
      removeComponent(viewerEntity, PerspectiveCameraComponent)
      setComponent(viewerEntity, OrthographicCameraComponent, {
        width: 10,
        height: 10 / getCameraAspect(),
        ...getCameraNearFar()
      })
    } else {
      removeComponent(viewerEntity, OrthographicCameraComponent)
      setComponent(viewerEntity, PerspectiveCameraComponent, {
        fov: cameraSettings.fov.value,
        ...getCameraNearFar()
      })
    }
    camera.updateProjectionMatrix()
  }, [cameraSettings.projectionType])

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

const updateOrthographicCamera = (cameraEid: Entity, distance: number, aspect: number, fov: number) => {
  const heightVisible = 2 * Math.tan((DEG2RAD * fov) / 2) * distance
  const widthVisible = heightVisible * aspect
  setComponent(cameraEid, OrthographicCameraComponent, {
    width: widthVisible,
    height: heightVisible
  })
}

const updatePerspectiveCamera = (cameraEid: Entity, aspect: number) => {
  setComponent(cameraEid, PerspectiveCameraComponent, {
    aspect: aspect
  })
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

    if (hasComponent(cameraEid, OrthographicCameraComponent)) {
      const fov = getState(CameraSettingsState).fov
      const distance = transform.position.distanceTo(cameraOrbit.cameraOrbitCenter)
      updateOrthographicCamera(cameraEid, distance, aspect, fov)
    } else if (hasComponent(cameraEid, PerspectiveCameraComponent)) {
      updatePerspectiveCamera(cameraEid, aspect)
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
