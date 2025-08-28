import { API, useFind } from '@ir-engine/common'
import { IceServer } from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
import {
  ChannelID,
  InstanceAttendanceType,
  InstanceID,
  LocationID,
  instanceAttendancePath,
  instanceSignalingPath
} from '@ir-engine/common/src/schema.type.module'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { EngineState } from '@ir-engine/ecs'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import {
  ErrorBoundary,
  HyperFlux,
  MediaStreamState,
  MessageTypes,
  NetworkActions,
  NetworkState,
  NetworkTopics,
  PeerID,
  SendMessageType,
  StunServerState,
  Topic,
  UserID,
  WebRTCPeerConnection,
  WebRTCTransportFunctions,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  joinNetwork,
  leaveNetwork,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import React, { Suspense, useEffect } from 'react'

type InstanceType = {
  id: InstanceID
  locationId?: LocationID
  channelId?: ChannelID
}

export const PeerToPeerNetworkState = defineState({
  name: 'ir.client.transport.p2p.PeerToPeerNetworkState',
  initial: {} as { [id: InstanceID]: InstanceType },
  connectToP2PInstance: (instance: InstanceType) => {
    getMutableState(PeerToPeerNetworkState)[instance.id].set(instance)

    return () => {
      getMutableState(PeerToPeerNetworkState)[instance.id].set(none)
    }
  },

  reactor: () => {
    const state = useMutableState(PeerToPeerNetworkState)

    return (
      <>
        {Object.values(state.value).map((instance) => (
          <ErrorBoundary key={instance.id}>
            <Suspense>
              <ConnectionReactor
                key={instance.id}
                instanceID={instance.id}
                topic={instance.locationId ? NetworkTopics.world : NetworkTopics.media}
              />
            </Suspense>
          </ErrorBoundary>
        ))}
      </>
    )
  }
})

const ConnectionReactor = (props: { instanceID: InstanceID; topic: Topic }) => {
  const instanceID = props.instanceID
  const joinResponse = useHookstate<null | { index: number; iceServers: IceServer[] }>(null)

  useEffect(() => {
    const abortController = new AbortController()

    API.instance
      .service(instanceSignalingPath)
      .create({ instanceID })
      .then((response) => {
        if (abortController.signal.aborted) return

        /** @todo it's probably fine that we override this every time we connect to a new server, but we should maybe handle this smarter */
        getMutableState(StunServerState).set(response.iceServers)

        joinResponse.set(response)
      })

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    if (!joinResponse.value) return

    const topic = props.topic

    getMutableState(NetworkState).hostIds[topic].set(instanceID)

    const network = joinNetwork(instanceID, null, topic, {})

    network.ready = true

    /** heartbeat */
    const heartbeat = setInterval(() => {
      API.instance.service(instanceSignalingPath).get({ instanceID })
    }, 5000)

    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        $topic: network.topic,
        $to: HyperFlux.store.peerID,
        peerID: HyperFlux.store.peerID,
        peerIndex: joinResponse.value.index,
        userID: getState(EngineState).userID
      })
    )

    return () => {
      clearInterval(heartbeat)
      dispatchAction(
        NetworkActions.peerLeft({
          $network: network.id,
          $topic: network.topic,
          $to: HyperFlux.store.peerID,
          peerID: HyperFlux.store.peerID,
          userID: getState(EngineState).userID
        })
      )
      leaveNetwork(network)
      getMutableState(NetworkState).hostIds[topic].set(none)
    }
  }, [joinResponse])

  if (!joinResponse.value) return null

  return <PeersReactor instanceID={props.instanceID} />
}

const PeersReactor = (props: { instanceID: InstanceID }) => {
  const lastPoll = useHookstate(new Date(new Date().getTime() - 10000))

  const instanceAttendanceQuery = useFind(instanceAttendancePath, {
    query: {
      instanceId: props.instanceID,
      ended: false,
      updatedAt: {
        // Only consider instances that have been updated in the last 10 seconds
        $gt: toDateTimeSql(lastPoll.value)
      }
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      lastPoll.set(new Date(new Date().getTime() - 10000))
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  const otherPeers = useHookstate<InstanceAttendanceType[]>([])

  useEffect(() => {
    if (instanceAttendanceQuery.status === 'success') {
      otherPeers.set(instanceAttendanceQuery.data.filter((peer) => peer.peerId !== HyperFlux.store.peerID))
    }
  }, [instanceAttendanceQuery.status])

  return (
    <>
      {otherPeers.value.map((peer) => (
        <ErrorBoundary key={peer.id}>
          <Suspense>
            <PeerReactor
              key={peer.peerId}
              peerID={peer.peerId}
              peerIndex={peer.peerIndex}
              userID={peer.userId}
              instanceID={props.instanceID}
            />
          </Suspense>
        </ErrorBoundary>
      ))}
    </>
  )
}

const sendMessage: SendMessageType = (instanceID: InstanceID, toPeerID: PeerID, message: MessageTypes) => {
  API.instance.service(instanceSignalingPath).patch(null, {
    instanceID,
    targetPeerID: toPeerID,
    message
  })
}

const PeerReactor = (props: { peerID: PeerID; peerIndex: number; userID: UserID; instanceID: InstanceID }) => {
  const network = getState(NetworkState).networks[props.instanceID]

  useEffect(() => {
    API.instance.service(instanceSignalingPath).on('patched', (data) => {
      // need to ignore messages from self
      if (data.fromPeerID !== props.peerID) return
      if (data.targetPeerID !== HyperFlux.store.peerID) return
      if (data.instanceID !== network.id) return

      WebRTCTransportFunctions.onMessage(sendMessage, data.instanceID, props.peerID, data.message)
    })
  }, [])

  const immersiveMedia = useMutableState(MediaSettingsState).immersiveMedia.value
  const maxResolution = useMutableState(MediaStreamState).maxResolution.value

  return (
    <WebRTCPeerConnection
      network={network}
      peerID={props.peerID}
      peerIndex={props.peerIndex}
      userID={props.userID}
      sendMessage={sendMessage}
      maxResolution={maxResolution}
      isPiP={immersiveMedia}
    />
  )
}
