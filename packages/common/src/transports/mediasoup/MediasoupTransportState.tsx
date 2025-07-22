import React, { useLayoutEffect } from 'react'

import {
  defineAction,
  defineState,
  getMutableState,
  getState,
  isClient,
  matches,
  matchesPeerID,
  Network,
  NetworkActions,
  NetworkID,
  NetworkState,
  none,
  PeerID,
  useHookstate,
  useMutableState,
  Validator
} from '@ir-engine/hyperflux'

export class MediasoupTransportActions {
  static requestTransport = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_CREATE',
    peerID: matchesPeerID,
    direction: matches.literals('send', 'recv'),
    sctpCapabilities: matches.object
  })

  static requestTransportError = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_ERROR_CREATE',
    error: matches.string,
    direction: matches.literals('send', 'recv')
  })

  static transportCreated = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_CREATED',
    peerID: matchesPeerID,
    transportID: matches.string,
    direction: matches.literals('send', 'recv'),
    sctpParameters: matches.object,
    iceParameters: matches.object,
    iceCandidates: matches.arrayOf(matches.object),
    iceServers: matches.arrayOf(matches.object),
    dtlsParameters: matches.object as Validator<
      unknown,
      {
        role?: 'client' | 'server' | 'auto'
        fingerprints: { algorithm: string; value: string }[]
      }
    >
  })

  static requestTransportConnect = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_CONNECT',
    requestID: matches.string,
    transportID: matches.string,
    dtlsParameters: matches.object
  })

  static requestTransportConnectError = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_ERROR_CONNECT',
    requestID: matches.string,
    error: matches.string
  })

  static transportConnected = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_CONNECTED',
    requestID: matches.string,
    transportID: matches.string
  })

  static transportClosed = defineAction({
    type: 'ee.engine.network.mediasoup.TRANSPORT_CLOSED',
    transportID: matches.string
  })
}

export const MediasoupTransportObjectsState = defineState({
  name: 'ee.engine.network.mediasoup.MediasoupTransportObjectsState',
  initial: {} as Record<string, any>
})

export type TransportType = {
  transportID: string
  peerID: PeerID
  direction: 'send' | 'recv'
  connected: boolean
  sctpParameters: any
  iceParameters: any
  iceCandidates: any
  iceServers: any
  dtlsParameters: any
}

export const MediasoupTransportState = defineState({
  name: 'ee.engine.network.mediasoup.MediasoupTransportState',

  initial: {} as Record<
    NetworkID,
    {
      [transportID: string]: TransportType
    }
  >,

  receptors: {
    onTransportCreated: MediasoupTransportActions.transportCreated.receive((action) => {
      const state = getMutableState(MediasoupTransportState)
      const networkID = action.$network
      const network = getState(NetworkState).networks[networkID] as Network
      if (!network) return console.warn('Network not found:', networkID)
      if (!state.value[networkID]) {
        state.merge({ [networkID]: {} })
      }
      state[networkID].merge({
        [action.transportID]: {
          /** Mediasoup is always client-server, so the peerID is always the host for clients */
          peerID: isClient ? network.hostPeerID! : action.peerID,
          transportID: action.transportID,
          direction: action.direction,
          connected: false,
          sctpParameters: action.sctpParameters,
          iceParameters: action.iceParameters,
          iceCandidates: action.iceCandidates,
          iceServers: action.iceServers,
          dtlsParameters: action.dtlsParameters
        }
      })
    }),

    onTransportConnected: MediasoupTransportActions.transportConnected.receive((action) => {
      const state = getMutableState(MediasoupTransportState)
      const networkID = action.$network
      if (!state.value[networkID]) return
      state[networkID][action.transportID].connected.set(true)
    }),

    onTransportClosed: MediasoupTransportActions.transportClosed.receive((action) => {
      const network = action.$network
      const state = getMutableState(MediasoupTransportState)
      state[network][action.transportID].set(none)
      if (!state[network].keys.length) state[network].set(none)
    }),

    onUpdatePeers: NetworkActions.peerLeft.receive((action) => {
      const state = getState(MediasoupTransportState)
      const transports = state[action.$network]
      if (!transports) return
      for (const transport of Object.values(transports)) {
        if (action.peerID === transport.peerID) {
          getMutableState(MediasoupTransportState)[action.$network][transport.transportID].set(none)
        }
      }
    })
  },

  getTransport: (
    networkID: NetworkID,
    direction: 'send' | 'recv',
    peerID = getState(NetworkState).networks[networkID].hostPeerID
  ) => {
    const state = getState(MediasoupTransportState)[networkID]
    if (!state) return

    const transport = Object.values(state).find(
      (transport) => transport.direction === direction && transport.peerID === peerID
    )
    if (!transport) return

    return getState(MediasoupTransportObjectsState)[transport.transportID]
  },

  reactor: () => {
    const networkIDs = useMutableState(MediasoupTransportState)
    return (
      <>
        {networkIDs.keys.map((id: NetworkID) => (
          <NetworkReactor key={id} networkID={id} />
        ))}
      </>
    )
  }
})

const TransportReactor = (props: { networkID: NetworkID; transportID: string }) => {
  const { transportID } = props

  useLayoutEffect(() => {
    return () => {
      if (!getState(MediasoupTransportObjectsState)[transportID]) return
      console.log('Closing transport:', transportID)
      getState(MediasoupTransportObjectsState)[transportID].close()
      getMutableState(MediasoupTransportObjectsState)[transportID].set(none)
    }
  }, [])

  return null
}

const NetworkReactor = (props: { networkID: NetworkID }) => {
  const { networkID } = props
  const transports = useHookstate(getMutableState(MediasoupTransportState)[networkID])
  const network = useHookstate(getMutableState(NetworkState).networks[networkID])

  if (!network.value) return null

  return (
    <>
      {transports.keys.map((transportID) => (
        <TransportReactor key={transportID} networkID={networkID} transportID={transportID} />
      ))}
    </>
  )
}
