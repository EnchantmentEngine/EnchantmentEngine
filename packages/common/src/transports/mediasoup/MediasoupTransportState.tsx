import React, { useLayoutEffect } from 'react'

import {
  defineAction,
  defineState,
  getMutableState,
  getState,
  isClient,
  Network,
  NetworkActions,
  NetworkID,
  NetworkState,
  none,
  PeerID,
  Schema,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

export class MediasoupTransportActions {
  static requestTransport = defineAction(
    Schema.Object(
      {
        peerID: Schema.PeerID(),
        direction: Schema.LiteralUnion(['send', 'recv'] as const),
        sctpCapabilities: Schema.Any()
      },
      {
        $id: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_CREATE'
      }
    )
  )

  static requestTransportError = defineAction(
    Schema.Object(
      {
        error: Schema.String(),
        direction: Schema.LiteralUnion(['send', 'recv'] as const)
      },
      {
        $id: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_ERROR_CREATE'
      }
    )
  )

  static transportCreated = defineAction(
    Schema.Object(
      {
        peerID: Schema.PeerID(),
        transportID: Schema.String(),
        direction: Schema.LiteralUnion(['send', 'recv'] as const),
        sctpParameters: Schema.Any(),
        iceParameters: Schema.Any(),
        iceCandidates: Schema.Array(Schema.Any()),
        iceServers: Schema.Array(Schema.Any()),
        dtlsParameters: Schema.Any()
      },
      {
        $id: 'ee.engine.network.mediasoup.TRANSPORT_CREATED'
      }
    )
  )

  static requestTransportConnect = defineAction(
    Schema.Object(
      {
        requestID: Schema.String(),
        transportID: Schema.String(),
        dtlsParameters: Schema.Any()
      },
      {
        $id: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_CONNECT'
      }
    )
  )

  static requestTransportConnectError = defineAction(
    Schema.Object(
      {
        requestID: Schema.String(),
        error: Schema.String()
      },
      {
        $id: 'ee.engine.network.mediasoup.TRANSPORT_REQUEST_ERROR_CONNECT'
      }
    )
  )

  static transportConnected = defineAction(
    Schema.Object(
      {
        requestID: Schema.String(),
        transportID: Schema.String()
      },
      {
        $id: 'ee.engine.network.mediasoup.TRANSPORT_CONNECTED'
      }
    )
  )

  static transportClosed = defineAction(
    Schema.Object(
      {
        transportID: Schema.String()
      },
      {
        $id: 'ee.engine.network.mediasoup.TRANSPORT_CLOSED'
      }
    )
  )
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
