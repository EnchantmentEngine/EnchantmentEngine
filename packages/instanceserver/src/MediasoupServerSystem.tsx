import React, { useEffect } from 'react'

import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import {
  DataChannelRegistryState,
  DataChannelType,
  defineActionQueue,
  getMutableState,
  getState,
  NetworkState,
  NetworkTopics,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

import {
  MediasoupDataConsumerActions,
  MediasoupDataProducerActions
} from '@ir-engine/common/src/transports/mediasoup/MediasoupDataProducerConsumerState'
import {
  MediasoupMediaConsumerActions,
  MediasoupMediaProducerActions
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { MediasoupTransportActions } from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'
import {
  createOutgoingDataProducer,
  handleCloseConsumer,
  handleCloseProducer,
  handleConsumeData,
  handleConsumerSetLayers,
  handleProduceData,
  handleRequestConsumer,
  handleRequestProducer,
  handleWebRtcTransportConnect,
  handleWebRtcTransportCreate
} from './WebRTCFunctions'

/** We do not need event sourcing here, as these actions only exist for the lifetime of the peer's connection */
const requestConsumerActionQueue = defineActionQueue(MediasoupMediaConsumerActions.requestConsumer.matches)
const consumerLayersActionQueue = defineActionQueue(MediasoupMediaConsumerActions.consumerLayers.matches)
const requestProducerActionQueue = defineActionQueue(MediasoupMediaProducerActions.requestProducer.matches)
const closeProducerActionQueue = defineActionQueue(MediasoupMediaProducerActions.producerClosed.matches)
const closeConsumerActionQueue = defineActionQueue(MediasoupMediaConsumerActions.consumerClosed.matches)

const dataRequestProducerActionQueue = defineActionQueue(MediasoupDataProducerActions.requestProducer.matches)
const dataRequestConsumerActionQueue = defineActionQueue(MediasoupDataConsumerActions.requestConsumer.matches)

const requestTransportActionQueue = defineActionQueue(MediasoupTransportActions.requestTransport.matches)
const requestTransportConnectActionQueue = defineActionQueue(MediasoupTransportActions.requestTransportConnect.matches)

const execute = () => {
  for (const action of requestConsumerActionQueue()) {
    handleRequestConsumer(action)
  }
  for (const action of consumerLayersActionQueue()) {
    handleConsumerSetLayers(action)
  }
  for (const action of requestProducerActionQueue()) {
    handleRequestProducer(action)
  }
  for (const action of closeConsumerActionQueue()) {
    handleCloseConsumer(action)
  }
  for (const action of closeProducerActionQueue()) {
    handleCloseProducer(action)
  }

  for (const action of dataRequestProducerActionQueue()) {
    handleProduceData(action)
  }
  for (const action of dataRequestConsumerActionQueue()) {
    handleConsumeData(action)
  }

  for (const action of requestTransportActionQueue()) {
    handleWebRtcTransportCreate(action)
  }
  for (const action of requestTransportConnectActionQueue()) {
    handleWebRtcTransportConnect(action)
  }
}

export const DataChannel = (props: { networkID: InstanceID; dataChannelType: DataChannelType }) => {
  const { networkID, dataChannelType } = props

  useEffect(() => {
    const network = getState(NetworkState).networks[networkID] as SocketWebRTCServerNetwork
    createOutgoingDataProducer(network, dataChannelType)

    return () => {
      // todo - cleanup
    }
  }, [])

  return null
}

const NetworkReactor = (props: { networkID: InstanceID }) => {
  const { networkID } = props
  const dataChannelRegistry = useMutableState(DataChannelRegistryState)
  return (
    <>
      {dataChannelRegistry.keys.map((dataChannelType) => (
        <DataChannel key={dataChannelType} networkID={networkID} dataChannelType={dataChannelType as DataChannelType} />
      ))}
    </>
  )
}

export const reactor = () => {
  const networkIDs = Object.entries(useHookstate(getMutableState(NetworkState).networks).value)
    .filter(([networkID, network]) => network.topic === NetworkTopics.world)
    .map(([networkID, network]) => networkID)
  return (
    <>
      {networkIDs.map((id: InstanceID) => (
        <NetworkReactor key={id} networkID={id} />
      ))}
    </>
  )
}

export const MediasoupServerSystem = defineSystem({
  uuid: 'ee.instanceserver.MediasoupServerSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
