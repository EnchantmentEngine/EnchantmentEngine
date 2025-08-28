import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'

import { HyperFlux, Network, NetworkState } from '@ir-engine/hyperflux'
import { createDataWriter } from './DataWriter'
import { ecsDataChannelType } from './IncomingNetworkSystem'
import { NetworkObjectAuthorityTag, NetworkObjectComponent } from './NetworkObjectComponent'

/***********
 * QUERIES *
 **********/

export const networkQuery = defineQuery([NetworkObjectComponent, NetworkObjectAuthorityTag])

const serializeAndSend = (serialize: ReturnType<typeof createDataWriter>) => {
  const ents = networkQuery()
  if (ents.length > 0) {
    const network = NetworkState.worldNetwork as Network
    if (!network.peers) return
    const peerID = HyperFlux.store.peerID
    const data = serialize(network, peerID, ents)

    // todo: insert historian logic here

    if (data.byteLength > 0) {
      // side effect - network IO
      // delay until end of frame
      Promise.resolve().then(() => network.bufferToAll(ecsDataChannelType, peerID, data))
    }
  }
}

const serialize = createDataWriter()

const execute = () => {
  NetworkState.worldNetwork && serializeAndSend(serialize)
}

export const OutgoingNetworkSystem = defineSystem({
  uuid: 'ee.engine.OutgoingNetworkSystem',
  insert: { after: SimulationSystemGroup },
  execute
})
