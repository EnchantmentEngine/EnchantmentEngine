// spawnPose is temporary - just so portals work for now - will be removed in favor of instanceserver-instanceserver communication
import { Quaternion, Vector3 } from 'three'

import { EngineState, EntityID, EntityUUID, SourceID } from '@ir-engine/ecs'
import { Action, PeerID, getState } from '@ir-engine/hyperflux'
import { CameraPrefab } from '@ir-engine/spatial/src/camera/CameraState'

import { TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ikTargets } from '../animation/Util'
import { AvatarComponent, AvatarPrefab } from '../components/AvatarComponent'
import { AvatarIKPrefab } from '../components/AvatarIKComponents'

export const AuthError = {
  MISSING_ACCESS_TOKEN: 'MISSING_ACCESS_TOKEN',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_NOT_AUTHORIZED: 'USER_NOT_AUTHORIZED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const

export type AuthErrorType = (typeof AuthError)[keyof typeof AuthError]

export type AuthTask = {
  status: 'success' | 'fail' | 'pending'
  peerIndex?: number
  hostPeerID?: PeerID
  routerRtpCapabilities?: any
  cachedActions?: Required<Action>[]
  error?: AuthErrorType
}

export type ReadyTask = {
  instanceReady: boolean
}

export type SpawnInWorldProps = {
  parentUUID: EntityUUID
  avatarSpawnPose: { position: Vector3; rotation: Quaternion }
  avatarURL: string
  name: string
}

export const spawnLocalAvatarInWorld = (props: SpawnInWorldProps) => {
  const { avatarSpawnPose, avatarURL, parentUUID } = props
  const entitySourceID = getState(EngineState).userID as any as SourceID
  AvatarPrefab.spawn({
    entityID: AvatarComponent.entityID,
    entitySourceID,
    parentUUID,
    components: {
      [AvatarComponent.jsonID]: {
        avatarURL: avatarURL
      },
      [NameComponent.jsonID]: {
        value: props.name
      },
      [TransformComponent.jsonID]: {
        ...avatarSpawnPose
      }
    }
  })
  CameraPrefab.spawn({
    parentUUID,
    entityID: CameraComponent.entityID,
    entitySourceID,
    components: {
      [NameComponent.jsonID]: { value: `${entitySourceID}'s Camera` }
    }
  })
  for (const targetName of Object.values(ikTargets)) {
    AvatarIKPrefab.spawn({
      entityID: targetName as EntityID,
      entitySourceID,
      parentUUID,
      components: {
        [NameComponent.jsonID]: {
          value: `${entitySourceID}'s ${targetName}`
        }
      }
    })
  }
}
