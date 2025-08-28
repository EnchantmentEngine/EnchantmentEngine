import { useEffect } from 'react'

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import {
  addDataChannelHandler,
  DataChannelType,
  defineState,
  getState,
  Network,
  NetworkState,
  PeerID,
  removeDataChannelHandler
} from '@ir-engine/hyperflux'
import { JitterBufferEntry, readDataPacket } from './DataReader'
import { RingBuffer } from './RingBuffer'

const toArrayBuffer = (buf) => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export const IncomingNetworkState = defineState({
  name: 'ee.core.network.IncomingNetworkState',
  initial: () => ({
    jitterBufferTaskList: [] as JitterBufferEntry[],
    jitterBufferDelay: 100,
    incomingMessageQueueUnreliableIDs: new RingBuffer<PeerID>(100),
    incomingMessageQueueUnreliable: new RingBuffer<any>(100)
  })
})

export const ecsDataChannelType = 'ee.core.ecs.dataChannel' as DataChannelType
const handleNetworkdata = (
  network: Network,
  dataChannel: DataChannelType,
  fromPeerID: PeerID,
  message: ArrayBufferLike
) => {
  const { incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } = getState(IncomingNetworkState)
  if (network.isHosting) {
    incomingMessageQueueUnreliable.add(toArrayBuffer(message))
    incomingMessageQueueUnreliableIDs.add(fromPeerID)
    // forward data to clients in world immediately
    // TODO: need to include the userId (or index), so consumers can validate
    network.bufferToAll(ecsDataChannelType, fromPeerID, message)
  } else {
    incomingMessageQueueUnreliable.add(message)
    incomingMessageQueueUnreliableIDs.add(fromPeerID)
  }
}

function oldestFirstComparator(a: JitterBufferEntry, b: JitterBufferEntry) {
  return b.simulationTime - a.simulationTime
}

const execute = () => {
  const ecsState = getState(ECSState)

  const { jitterBufferTaskList, jitterBufferDelay, incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } =
    getState(IncomingNetworkState)

  const network = NetworkState.worldNetwork
  if (!network) return

  while (incomingMessageQueueUnreliable.getBufferLength() > 0) {
    // we may need producer IDs at some point, likely for p2p netcode, for now just consume it
    incomingMessageQueueUnreliableIDs.pop()
    const packet = incomingMessageQueueUnreliable.pop()

    readDataPacket(network, packet, jitterBufferTaskList)
  }

  jitterBufferTaskList.sort(oldestFirstComparator)

  const targetFixedTime = ecsState.simulationTime + jitterBufferDelay

  while (jitterBufferTaskList.length > 0 && jitterBufferTaskList[0].simulationTime <= targetFixedTime) {
    const read = jitterBufferTaskList.shift()!.read
    read()
  }
}

const reactor = () => {
  useEffect(() => {
    addDataChannelHandler(ecsDataChannelType, handleNetworkdata)
    return () => {
      removeDataChannelHandler(ecsDataChannelType, handleNetworkdata)
    }
  }, [])
  return null
}

export const IncomingNetworkSystem = defineSystem({
  uuid: 'ee.engine.IncomingNetworkSystem',
  insert: { before: SimulationSystemGroup },
  execute,
  reactor
})
