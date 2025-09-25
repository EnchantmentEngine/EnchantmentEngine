import React, { useEffect } from 'react'

import { getSearchParamFromURL } from '@ir-engine/common/src/utils/getSearchParamFromURL'
import {
  defineSystem,
  Entity,
  EntityID,
  getOptionalComponent,
  PresentationSystemGroup,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useHasComponent,
  useOptionalComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import { AvatarComponent, AvatarPrefab } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint } from '@ir-engine/engine/src/avatar/functions/getSpawnPoint'
import { spawnLocalAvatarInWorld } from '@ir-engine/engine/src/avatar/functions/spawnLocalAvatarInWorld'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import {
  dispatchAction,
  getMutableState,
  getState,
  NetworkPeerState,
  NetworkState,
  useHookstate,
  useImmediateEffect,
  useMutableState
} from '@ir-engine/hyperflux'
import { SpectateActions } from '@ir-engine/spatial/src/camera/systems/SpectateSystem'

import { useFind, useMutation } from '@ir-engine/common'
import { config } from '@ir-engine/common/src/config'
import { avatarPath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import { EngineState, useChildrenWithComponents } from '@ir-engine/ecs'
import { CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { PoiCameraComponent } from '@ir-engine/spatial/src/camera/components/PoiCameraComponent'
import { CameraMode, CameraModeType } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { iOS } from '@ir-engine/spatial/src/common/functions/isMobile'
import { useLoadedSceneEntity } from '../hooks/useLoadedSceneEntity'
import { LocationState } from '../social/services/LocationService'
import { AuthState } from '../user/services/AuthService'

export const AvatarSpawnReactor = (props: { sceneEntity: Entity }) => {
  const userID = useMutableState(EngineState).userID.value
  const { sceneEntity } = props
  const searchParamSpectate = getSearchParamFromURL('spectate') as EntityID

  const spectateEntity = useHookstate(searchParamSpectate)

  const settingsQuery = useChildrenWithComponents(sceneEntity, [SceneSettingsComponent])

  useImmediateEffect(() => {
    const sceneSettingsSpectateEntity = getOptionalComponent(settingsQuery[0], SceneSettingsComponent)?.spectateEntity
    spectateEntity.set(sceneSettingsSpectateEntity || searchParamSpectate)
  }, [settingsQuery[0], searchParamSpectate])

  const isSpectating = typeof spectateEntity.value === 'string'

  useEffect(() => {
    if (!isSpectating) return
    dispatchAction(
      SpectateActions.spectateEntity({
        spectatorUserID: userID,
        spectatingEntity: spectateEntity.value
      })
    )

    return () => {
      dispatchAction(SpectateActions.exitSpectate({ spectatorUserID: userID }))
    }
  }, [isSpectating])

  const userAvatarQuery = useFind(userAvatarPath, {
    query: {
      userId: userID
    }
  })

  const userAvatar = userAvatarQuery.data[0]

  useEffect(() => {
    if (isSpectating || !userAvatar) return

    const rootUUID = UUIDComponent.get(sceneEntity)
    const avatarSpawnPose = getRandomSpawnPoint(userID)
    const user = getState(AuthState).user
    /**@todo force default avatars. Temporary solution for memory related crashing on iOS. */
    const avatarURL = iOS
      ? config.client.fileServer + '/projects/enchantmentengine/default-project/assets/avatars/irRobot.vrm'
      : userAvatar.avatar.modelResource!.url
    spawnLocalAvatarInWorld({
      parentUUID: rootUUID,
      avatarSpawnPose,
      avatarURL,
      name: user.name
    })

    return () => {
      const selfAvatarUUID = AvatarComponent.getSelfAvatarUUID()

      const currentNetwork = NetworkState.worldNetwork
      const networkPeerState = getState(NetworkPeerState)[currentNetwork?.id]
      const peersCountForUser = networkPeerState?.users?.[userID]?.length || 0

      if (peersCountForUser <= 1) {
        dispatchAction(
          WorldNetworkAction.destroyEntity({
            entityUUID: selfAvatarUUID
          })
        )
      }
    }
  }, [isSpectating, !!userAvatar])

  const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
  const errorWithAvatar = useHasComponent(selfAvatarEntity, ErrorComponent)
  const isMissingAvatar = userAvatarQuery.data.length === 0 && userAvatarQuery.status === 'success'
  const needsNewAvatar = errorWithAvatar || isMissingAvatar

  const userAvatarMutation = useMutation(userAvatarPath)

  const avatarsQuery = useFind(avatarPath)

  useEffect(() => {
    if (!needsNewAvatar || !avatarsQuery.data.length) return
    const randomAvatar = avatarsQuery.data[Math.floor(Math.random() * avatarsQuery.data.length)]
    userAvatarMutation.patch(null, { avatarId: randomAvatar.id }, { query: { userId: userID } })
  }, [needsNewAvatar])

  useEffect(() => {
    if (isSpectating || !userAvatar || !selfAvatarEntity) return
    /**@todo force default avatars. Temporary solution for memory related crashing on iOS. */
    const avatarURL = iOS
      ? config.client.fileServer + '/projects/enchantmentengine/default-project/assets/avatars/irRobot.vrm'
      : userAvatar.avatar.modelResource!.url
    AvatarPrefab.set(selfAvatarEntity, {
      [AvatarComponent.jsonID]: {
        avatarURL
      }
    })
  }, [isSpectating, userAvatar, selfAvatarEntity])

  return null
}

const CameraSettingsReactor = (props: {
  cameraSettingsEntity: Entity | null
  onCameraModeChange?: (cameraMode: CameraModeType) => void
}) => {
  const { cameraSettingsEntity, onCameraModeChange } = props

  const engineState = useMutableState(EngineState)
  const referenceSpaceState = useMutableState(ReferenceSpaceState)

  const cameraSettingsComponent = useOptionalComponent(cameraSettingsEntity ?? UndefinedEntity, CameraSettingsComponent)

  const cameraMode = cameraSettingsComponent?.cameraMode ?? CameraMode.FOLLOW

  useEffect(() => {
    onCameraModeChange?.(cameraMode)
  }, [cameraMode, onCameraModeChange])

  useEffect(() => {
    const cameraEntity = referenceSpaceState.viewerEntity.value

    if (engineState.isEditing.value || !cameraEntity || cameraMode !== CameraMode.GUIDED) return

    setComponent(cameraEntity, PoiCameraComponent)

    return () => {
      removeComponent(cameraEntity, PoiCameraComponent)
    }
  }, [cameraMode, referenceSpaceState.viewerEntity, engineState.isEditing])

  return null
}

const reactor = () => {
  const userID = useMutableState(EngineState).userID.value
  const locationSceneURL = useHookstate(getMutableState(LocationState).currentLocation.location.sceneURL).value
  const sceneEntity = useLoadedSceneEntity(locationSceneURL)
  const gltfLoaded = GLTFComponent.useSceneLoaded(sceneEntity)

  const cameraSettingsComponents = useChildrenWithComponents(sceneEntity, [CameraSettingsComponent])
  const cameraSettingsEntity = cameraSettingsComponents.length > 0 ? cameraSettingsComponents[0] : null
  const currentCameraMode = useHookstate<CameraModeType>(CameraMode.FOLLOW)

  const handleCameraModeChange = (cameraMode: CameraModeType) => {
    currentCameraMode.set(cameraMode)
  }

  if (!gltfLoaded || !userID) return null

  return (
    <>
      <CameraSettingsReactor cameraSettingsEntity={cameraSettingsEntity} onCameraModeChange={handleCameraModeChange} />
      {currentCameraMode.value === CameraMode.FOLLOW && (
        <AvatarSpawnReactor key={sceneEntity} sceneEntity={sceneEntity} />
      )}
    </>
  )
}

export const AvatarSpawnSystem = defineSystem({
  uuid: 'ee.client.AvatarSpawnSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
