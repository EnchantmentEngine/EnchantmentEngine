import { DataConsumer } from 'mediasoup/node/lib/DataConsumer'

import { DataChannelType, defineState, PeerID } from '@ir-engine/hyperflux'

export const MediasoupInternalWebRTCDataChannelState = defineState({
  name: 'ee.instanceserver.mediasoup.MediasoupInternalWebRTCDataChannelState',

  initial: {} as Record<
    PeerID,
    {
      incomingDataConsumers: Record<DataChannelType, DataConsumer>
      outgoingDataConsumers: Record<DataChannelType, DataConsumer>
    }
  >
})
