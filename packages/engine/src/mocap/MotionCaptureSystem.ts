import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { decode, encode } from 'msgpackr'
import { useEffect } from 'react'
import { Quaternion } from 'three'

import { ECSState, RingBuffer } from '@ir-engine/ecs'
import { getComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import {
  DataChannelType,
  Network,
  NetworkState,
  PeerID,
  addDataChannelHandler,
  getState,
  isClient,
  removeDataChannelHandler
} from '@ir-engine/hyperflux'

import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { VRMHumanBoneList } from '../avatar/maps/VRMHumanBoneList'
import { AvatarAnimationSystem } from '../avatar/systems/AvatarAnimationSystem'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'
import { solveMotionCapturePose } from './solveMotionCapturePose'

export type MotionCaptureResults = {
  worldLandmarks: NormalizedLandmark[]
  landmarks: NormalizedLandmark[]
}

export const sendResults = (results: MotionCaptureResults) => {
  return encode({
    timestamp: Date.now(),
    results
  })
}

export const receiveResults = (buff: ArrayBuffer) => {
  return decode(new Uint8Array(buff)) as {
    timestamp: number
    results: MotionCaptureResults
  }
}

export const MotionCaptureFunctions = {
  sendResults,
  receiveResults
}

export const mocapDataChannelType = 'ee.core.mocap.dataChannel' as DataChannelType

const handleMocapData = (
  network: Network,
  dataChannel: DataChannelType,
  fromPeerID: PeerID,
  message: ArrayBufferLike
) => {
  if (network.isHosting) {
    network.bufferToAll(dataChannel, fromPeerID, message)
  }
  const results = MotionCaptureFunctions.receiveResults(message as ArrayBuffer)
  if (!timeSeriesMocapData.has(fromPeerID)) {
    timeSeriesMocapData.set(fromPeerID, new RingBuffer(10))
  }
  timeSeriesMocapData.get(fromPeerID)!.add(results)
}

const motionCaptureQuery = defineQuery([MotionCaptureRigComponent, AvatarRigComponent])

export const timeSeriesMocapData = new Map<
  PeerID,
  RingBuffer<{
    timestamp: number
    results: MotionCaptureResults
  }>
>()
const timeSeriesMocapLastSeen = new Map<PeerID, number>()
/**@todo this will be determined by the average delta of incoming landmark data */
const slerpAlphaMultiplier = 25
const execute = () => {
  // for now, it is unnecessary to compute anything on the server
  if (!isClient) return
  const network = NetworkState.worldNetwork
  if (!network) return

  for (const [peerID, mocapData] of timeSeriesMocapData) {
    if (!network.peers[peerID] || timeSeriesMocapLastSeen.get(peerID)! < Date.now() - 1000) {
      timeSeriesMocapData.delete(peerID)
      timeSeriesMocapLastSeen.delete(peerID)
    }
  }
  for (const [peerID, mocapData] of timeSeriesMocapData) {
    const data = mocapData.getFirst()
    const userID = network.peers[peerID]!.userId
    const entity = AvatarComponent.getUserAvatarEntity(userID)
    if (!entity) continue

    timeSeriesMocapLastSeen.set(peerID, Date.now())
    setComponent(entity, MotionCaptureRigComponent)
    solveMotionCapturePose(entity, data?.results.worldLandmarks, data?.results.landmarks)
    mocapData.clear() // TODO: add a predictive filter and remove this
  }

  for (const entity of motionCaptureQuery()) {
    const peers = Object.keys(network.peers).find((peerID: PeerID) => timeSeriesMocapData.has(peerID))
    const rigComponent = getComponent(entity, AvatarRigComponent)
    if (!rigComponent.bonesToEntities.hips) continue
    const worldHipsParent = getComponent(rigComponent.bonesToEntities.hips, BoneComponent).parent
    if (!peers) {
      removeComponent(entity, MotionCaptureRigComponent)
      worldHipsParent?.position.setY(0)
      continue
    }
    for (const boneName of VRMHumanBoneList) {
      const normalizedBone = getComponent(rigComponent.bonesToEntities[boneName], BoneComponent)
      if (!normalizedBone) continue
      if (
        MotionCaptureRigComponent.rig[boneName].x[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].y[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].z[entity] === 0 &&
        MotionCaptureRigComponent.rig[boneName].w[entity] === 0
      ) {
        continue
      }

      const slerpedQuat = new Quaternion()
        .set(
          MotionCaptureRigComponent.slerpedRig[boneName].x[entity],
          MotionCaptureRigComponent.slerpedRig[boneName].y[entity],
          MotionCaptureRigComponent.slerpedRig[boneName].z[entity],
          MotionCaptureRigComponent.slerpedRig[boneName].w[entity]
        )
        .normalize()
        .fastSlerp(
          new Quaternion()
            .set(
              MotionCaptureRigComponent.rig[boneName].x[entity],
              MotionCaptureRigComponent.rig[boneName].y[entity],
              MotionCaptureRigComponent.rig[boneName].z[entity],
              MotionCaptureRigComponent.rig[boneName].w[entity]
            )
            .normalize(),
          getState(ECSState).deltaSeconds * slerpAlphaMultiplier
        )

      normalizedBone.quaternion.copy(slerpedQuat)

      MotionCaptureRigComponent.slerpedRig[boneName].x[entity] = slerpedQuat.x
      MotionCaptureRigComponent.slerpedRig[boneName].y[entity] = slerpedQuat.y
      MotionCaptureRigComponent.slerpedRig[boneName].z[entity] = slerpedQuat.z
      MotionCaptureRigComponent.slerpedRig[boneName].w[entity] = slerpedQuat.w
    }

    const hipBone = getComponent(rigComponent.bonesToEntities.hips, BoneComponent)
    hipBone.position.set(
      MotionCaptureRigComponent.hipPosition.x[entity],
      MotionCaptureRigComponent.hipPosition.y[entity],
      MotionCaptureRigComponent.hipPosition.z[entity]
    )

    // if (worldHipsParent)
    //   if (MotionCaptureRigComponent.solvingLowerBody[entity])
    //     worldHipsParent.position.setY(
    //       lerp(
    //         worldHipsParent.position.y,
    //         MotionCaptureRigComponent.footOffset[entity],
    //         getState(ECSState).deltaSeconds * 5
    //       )
    //     )
    //   else worldHipsParent.position.setY(0)
  }
}

const reactor = () => {
  useEffect(() => {
    addDataChannelHandler(mocapDataChannelType, handleMocapData)
    return () => {
      removeDataChannelHandler(mocapDataChannelType, handleMocapData)
    }
  }, [])
  return null
}

export const MotionCaptureSystem = defineSystem({
  uuid: 'ee.engine.MotionCaptureSystem',
  insert: { before: AvatarAnimationSystem },
  execute,
  reactor
})
