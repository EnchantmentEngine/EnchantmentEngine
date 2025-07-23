import { useEffect } from 'react'

import { API } from '@ir-engine/common'
import { RecordingAPIState } from '@ir-engine/common/src/recording/ECSRecordingSystem'
import { RecordingID, recordingResourceUploadPath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import {
  NetworkActions,
  NetworkPeer,
  NetworkState,
  PeerID,
  dispatchAction,
  getMutableState,
  none
} from '@ir-engine/hyperflux'

import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'

export const lastSeen = new Map<PeerID, number>()

export async function checkPeerHeartbeat(network: SocketWebRTCServerNetwork): Promise<void> {
  for (const [peerID, client] of Object.entries(network.peers) as [PeerID, NetworkPeer][]) {
    if (client.userId === Engine.instance.userID) continue
    if (!lastSeen.has(peerID)) lastSeen.set(peerID, Date.now())
    if (Date.now() - lastSeen.get(peerID)! > 10000) {
      if (network.transports[peerID]) network.transports[peerID]!.end!()
      dispatchAction(
        NetworkActions.peerLeft({
          $cache: true,
          $network: network.id,
          $topic: network.topic,
          peerID,
          userID: client.userId
        })
      )
    }
  }
}

const execute = () => {
  const worldNetwork = NetworkState.worldNetwork as SocketWebRTCServerNetwork
  if (worldNetwork) {
    if (worldNetwork.isHosting) checkPeerHeartbeat(worldNetwork)
  }
}

export const uploadRecordingStaticResource = async (props: {
  recordingID: RecordingID
  key: string
  body: Buffer
  mimeType: string
}) => {
  const api = API.instance

  await api.service(recordingResourceUploadPath).create({
    recordingID: props.recordingID,
    key: props.key,
    body: props.body,
    mimeType: props.mimeType
  })
}

const reactor = () => {
  useEffect(() => {
    getMutableState(RecordingAPIState).merge({ uploadRecordingChunk: uploadRecordingStaticResource })
    return () => {
      getMutableState(RecordingAPIState).merge({ uploadRecordingChunk: none })
    }
  }, [])

  return null
}

export const ServerHostNetworkSystem = defineSystem({
  uuid: 'ee.instanceserver.ServerHostNetworkSystem',
  insert: { with: SimulationSystemGroup },
  execute,
  reactor
})
