import { useEffect } from 'react'

import { API } from '@ir-engine/common'
import multiLogger from '@ir-engine/common/src/logger'
import { ChannelID, InstanceID, instanceProvisionPath, RoomCode } from '@ir-engine/common/src/schema.type.module'
import {
  defineState,
  getMutableState,
  getState,
  Identifiable,
  NetworkState,
  State,
  useState
} from '@ir-engine/hyperflux'

import { SocketWebRTCClientNetwork } from '../../transports/mediasoup/MediasoupClientFunctions'
import { AuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:service:media-instance' })

type InstanceState = {
  ipAddress?: string
  port?: string
  p2p?: boolean
  channelId: ChannelID
  roomCode: RoomCode
}

//State
export const MediaInstanceState = defineState({
  name: 'MediaInstanceState',
  initial: () => ({
    instances: {} as { [id: InstanceID]: InstanceState }
  })
})

export function useMediaNetwork() {
  const mediaNetworkState = useState(getMutableState(NetworkState).networks)
  const mediaHostId = useState(getMutableState(NetworkState).hostIds.media)
  return mediaHostId.value
    ? (mediaNetworkState[mediaHostId.value] as State<SocketWebRTCClientNetwork, Identifiable>)
    : null
}

export function useMediaInstance() {
  const mediaInstanceState = useState(getMutableState(MediaInstanceState).instances)
  const mediaHostId = useState(getMutableState(NetworkState).hostIds.media)
  return mediaHostId.value ? mediaInstanceState[mediaHostId.value] : null
}

//Service
export const MediaInstanceConnectionService = {
  provisionServer: async (channelID: ChannelID, createPrivateRoom = false) => {
    logger.info(`Provision Media Server, channelId: "${channelID}".`)
    const token = getState(AuthState).authUser.accessToken
    const provisionResult = await API.instance.service(instanceProvisionPath).find({
      query: {
        channelId: channelID,
        token,
        createPrivateRoom
      }
    })
    if (provisionResult.p2p || (provisionResult.ipAddress && provisionResult.port)) {
      getMutableState(MediaInstanceState).instances[provisionResult.id].set({
        ipAddress: provisionResult.ipAddress,
        port: provisionResult.port,
        p2p: provisionResult.p2p,
        channelId: channelID,
        roomCode: provisionResult.roomCode
      })
    } else {
      logger.error('Failed to connect to expected instance')
      setTimeout(() => {
        MediaInstanceConnectionService.provisionServer(channelID, createPrivateRoom)
      }, 1000)
    }
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = (params) => {
        if (params.channelId != null) {
          getMutableState(MediaInstanceState).instances[params.instanceId].set({
            ipAddress: params.ipAddress,
            port: params.port,
            channelId: params.channelId,
            roomCode: params.roomCode
          })
        }
      }
      API.instance.service(instanceProvisionPath).on('created', listener)
      return () => {
        API.instance.service(instanceProvisionPath).off('created', listener)
      }
    }, [])
  }
}
