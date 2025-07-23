import { MediaChannelType, NetworkID, PeerID } from '@ir-engine/hyperflux'
import { ChannelID, LocationID, RoomCode } from '../schema.type.module'

export type NetworkConnectionParams = {
  token: string
  peerID: PeerID
  locationId?: LocationID
  instanceID?: NetworkID
  channelId?: ChannelID
  roomCode?: RoomCode
  /** Address and port are used by ingress to route traffic */
  address?: string
  port?: string
}

export type TransportDirection = 'send' | 'receive'

export type MediaStreamAppData = {
  mediaTag: MediaChannelType
  peerID: PeerID
  direction: TransportDirection
  channelId: ChannelID
  clientDirection?: 'recv' | 'send'
}
