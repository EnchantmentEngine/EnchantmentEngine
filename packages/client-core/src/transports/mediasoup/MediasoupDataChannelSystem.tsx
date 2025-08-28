import type { DataProducer, DataProducerOptions } from 'mediasoup-client/lib/DataProducer'
import { decode } from 'msgpackr'
import React, { useEffect } from 'react'

import logger from '@ir-engine/common/src/logger'
import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import {
  DataChannelRegistryState,
  DataChannelType,
  NetworkID,
  NetworkState,
  NetworkTopics,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

import {
  DataConsumerType,
  MediasoupDataConsumerActions,
  MediasoupDataProducerConsumerState,
  MediasoupDataProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupDataProducerConsumerState'
import { MediasoupTransportState } from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { PresentationSystemGroup } from '@ir-engine/ecs'
import { SocketWebRTCClientNetwork, WebRTCTransportExtension } from './MediasoupClientFunctions'

function createDataConsumer(network: SocketWebRTCClientNetwork, dataChannel: DataChannelType) {
  dispatchAction(
    MediasoupDataConsumerActions.requestConsumer({
      dataChannel,
      $network: network.id,
      $topic: network.topic,
      $to: network.hostPeerID
    })
  )
}

async function createDataProducer(
  network: SocketWebRTCClientNetwork,
  args = {
    ordered: false,
    maxRetransmits: 1,
    maxPacketLifeTime: undefined,
    protocol: 'raw',
    appData: {}
  } as DataProducerOptions & {
    label: DataChannelType
  }
): Promise<void> {
  const producer = MediasoupDataProducerConsumerState.getProducerByDataChannel(network.id, args.label) as DataProducer
  if (producer) return

  const sendTransport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

  const dataProducer = await sendTransport.produceData({
    label: args.label,
    ordered: args.ordered,
    appData: args.appData,
    maxPacketLifeTime: args.maxPacketLifeTime,
    maxRetransmits: args.maxRetransmits,
    protocol: args.protocol // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
  })

  dataProducer.on('transportclose', () => {
    dataProducer.close()
  })

  dataProducer.observer.on('close', () => {
    getMutableState(MediasoupDataProducersConsumersObjectsState).producers[dataProducer.id].set(none)
  })

  getMutableState(MediasoupDataProducersConsumersObjectsState).producers[dataProducer.id].set(dataProducer)

  logger.info(`DataProducer created for ${args.label} on network ${network.id}`)
}

const consumerData = async (networkID: NetworkID, consumer: DataConsumerType) => {
  const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork

  const recvTransport = MediasoupTransportState.getTransport(network.id, 'recv') as WebRTCTransportExtension

  const dataConsumer = await recvTransport.consumeData({
    id: consumer.consumerID,
    sctpStreamParameters: consumer.sctpStreamParameters,
    label: consumer.dataChannel,
    protocol: consumer.protocol,
    appData: consumer.appData,
    // this is unused, but for whatever reason mediasoup will throw an error if it's not defined
    dataProducerId: ''
  })

  // Firefox uses blob as by default hence have to convert binary type of data consumer to 'arraybuffer' explicitly.
  dataConsumer.binaryType = 'arraybuffer'
  dataConsumer.on('message', (message: any) => {
    const [fromPeerIndex, data] = decode(message)
    const fromPeerID = network.peerIndexToPeerID[fromPeerIndex]
    const dataBuffer = new Uint8Array(data).buffer
    network.onBuffer(dataConsumer.label as DataChannelType, fromPeerID, dataBuffer)
  }) // Handle message received

  dataConsumer.on('transportclose', () => {
    dataConsumer.close()
  })

  dataConsumer.observer.on('close', () => {
    getMutableState(MediasoupDataProducersConsumersObjectsState).consumers[dataConsumer.id].set(none)
  })

  getMutableState(MediasoupDataProducersConsumersObjectsState).consumers[dataConsumer.id].set(dataConsumer)

  logger.info(`DataConsumer created for ${consumer.dataChannel} on network ${network.id}`)
}

const DataChannel = (props: { networkID: InstanceID; dataChannelType: DataChannelType }) => {
  const { networkID, dataChannelType } = props
  const networkState = useHookstate(getMutableState(NetworkState).networks[networkID])

  useEffect(() => {
    if (!networkState.ready?.value) return

    const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork
    createDataProducer(network, { label: dataChannelType })
    createDataConsumer(network, dataChannelType)

    return () => {
      // todo - cleanup
    }
  }, [networkState.ready?.value])

  return null
}

const ConsumerReactor = (props: { consumerID: string; networkID: InstanceID }) => {
  const { consumerID, networkID } = props

  useEffect(() => {
    const consumer = getState(MediasoupDataProducerConsumerState)[networkID].consumers[consumerID]
    consumerData(networkID, consumer)
  }, [])

  return null
}

const NetworkReactor = (props: { networkID: InstanceID }) => {
  const { networkID } = props
  const dataChannelRegistry = useMutableState(DataChannelRegistryState)
  const dataProducerConsumerState = useMutableState(MediasoupDataProducerConsumerState)[props.networkID]

  useMutableState(MediasoupTransportState).value[props.networkID]
  const sendTransport = MediasoupTransportState.getTransport(props.networkID, 'send') as WebRTCTransportExtension
  const recvTransport = MediasoupTransportState.getTransport(props.networkID, 'recv') as WebRTCTransportExtension

  const ready = !!recvTransport && !!sendTransport
  if (!ready) return null

  return (
    <>
      {dataChannelRegistry.keys.map((dataChannelType) => (
        <DataChannel key={dataChannelType} networkID={networkID} dataChannelType={dataChannelType as DataChannelType} />
      ))}
      {dataProducerConsumerState?.consumers?.keys.map((consumerID) => (
        <ConsumerReactor key={consumerID} consumerID={consumerID} networkID={props.networkID} />
      ))}
    </>
  )
}

const reactor = () => {
  const networkIDs = Object.entries(useHookstate(getMutableState(NetworkState).networks).value)
    .filter(([networkID, network]) => network.topic === NetworkTopics.world)
    .map(([networkID, network]) => networkID)

  const networkConfig = useHookstate(getMutableState(NetworkState).config)
  const isOnline = networkConfig.world.value || networkConfig.media.value

  /** @todo - instead of checking for network config, we should filter NetworkConnectionReactor by networks with a "real" transport */
  if (!isOnline) return null

  return (
    <>
      {networkIDs
        .filter((networkID: InstanceID) => getState(NetworkState).networks[networkID].hostPeerID)

        .map((id: InstanceID) => (
          <NetworkReactor key={id} networkID={id} />
        ))}
    </>
  )
}

export const MediasoupDataChannelSystem = defineSystem({
  uuid: 'ee.client.MediasoupDataChannelSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
