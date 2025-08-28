// spawnPose is temporary - just so portals work for now - will be removed in favor of instanceserver-instanceserver communication
import { Quaternion, Vector3 } from 'three'

import { EngineState, EntityID, EntityUUID, SourceID } from '@ir-engine/ecs'
import { Action, PeerID, dispatchAction, getState } from '@ir-engine/hyperflux'
import { CameraActions } from '@ir-engine/spatial/src/camera/CameraState'

import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import { AvatarComponent } from '../components/AvatarComponent'

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
  dispatchAction(
    AvatarNetworkAction.spawn({
      ...avatarSpawnPose,
      parentUUID,
      avatarURL,
      entityID: AvatarComponent.entityID,
      entitySourceID,
      name: props.name
    })
  )
  dispatchAction(CameraActions.spawnCamera({ parentUUID, entityID: 'camera' as EntityID, entitySourceID }))
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityID: 'head' as EntityID,
      entitySourceID,
      name: 'head',
      blendWeight: 0
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityID: 'leftHand' as EntityID,
      entitySourceID,
      name: 'leftHand',
      blendWeight: 0
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityID: 'rightHand' as EntityID,
      entitySourceID,
      name: 'rightHand',
      blendWeight: 0
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityID: 'leftFoot' as EntityID,
      entitySourceID,
      name: 'leftFoot',
      blendWeight: 0
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityID: 'rightFoot' as EntityID,
      entitySourceID,
      name: 'rightFoot',
      blendWeight: 0
    })
  )
}
