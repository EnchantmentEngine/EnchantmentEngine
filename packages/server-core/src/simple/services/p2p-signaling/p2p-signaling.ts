import { BadRequest } from '@feathersjs/errors'
import { Application, Params } from '@feathersjs/feathers'
import { InstanceID, instanceSignalingPath } from '@ir-engine/common/src/schema.type.module'
import { MessageTypes, PeerID, UserID } from '@ir-engine/hyperflux'

let peerIndex = 0

type PeerInfo = {
  peerID: PeerID
  peerIndex: number
  userID: UserID
}

// since we don't have a database, we'll store the peers in memory
const peers = {} as Record<InstanceID, PeerInfo[]>

type JoinSignalingDataType = {
  instanceID: InstanceID
}

type SignalData = {
  instanceID: InstanceID
  targetPeerID: PeerID
  fromPeerID: PeerID
  message: MessageTypes
}

const peerJoin = async (app: Application, data: JoinSignalingDataType, params: Params) => {
  const peerID = params.socketQuery!.peerID
  /**
   * @todo a simple user service to persist userids across refreshes - not secure
   */
  // @ts-ignore
  const userID = params.socketQuery!.userID

  if (!peerID) throw new BadRequest('PeerID required')

  if (!data?.instanceID) throw new BadRequest('instanceID required')

  app.channel(`peerIds/${peerID}`).join(params.connection!)

  const newPeerIndex = peerIndex++

  if (!peers[data.instanceID]) peers[data.instanceID] = [] as PeerInfo[]
  peers[data.instanceID].push({
    peerID,
    peerIndex: newPeerIndex,
    /** @todo - figure out user service somehow */
    userID
  })

  console.info(`Peer ${peerID} joined instance ${data.instanceID}`)

  return {
    index: newPeerIndex,
    iceServers: null! // todo
  }
}

export default function (app: Application) {
  app.use(instanceSignalingPath, {
    // get is heartbeat
    find: async (params?: Params) => {
      const instanceID = params?.query?.instanceID as InstanceID
      if (!instanceID) return [] as PeerInfo[]
      return peers[instanceID] || ([] as PeerInfo[])
    },
    get: async () => {},
    create: async (data: JoinSignalingDataType, params) => peerJoin(app, data, params!),
    patch: async (id: null, data: SignalData, params) => {
      const peerID = params!.socketQuery!.peerID
      const instanceID = data.instanceID
      const targetPeerID = data.targetPeerID

      if (!peerID) throw new BadRequest('peerID required')
      if (!targetPeerID) throw new BadRequest('targetPeerID required')
      if (!instanceID) throw new BadRequest('instanceID required')

      // from here, we can leverage feathers-sync to send the message to the target peer
      data.fromPeerID = peerID
      return data
    }
  })

  app.service(instanceSignalingPath)

  app.on('disconnect', async (connection) => {
    const peerID = connection.socketQuery.peerID
    if (!peerID) return
    app.channel(`peerIds/${peerID}`).leave(connection)
    for (const instanceID in peers) {
      const peerIndex = peers[instanceID].findIndex((peer) => peer.peerID === peerID)
      if (peerIndex !== -1) {
        peers[instanceID].splice(peerIndex, 1)
        console.info(`Peer ${peerID} left instance ${instanceID}`)
      }
      if (peers[instanceID].length === 0) delete peers[instanceID]
    }
  })

  app.service(instanceSignalingPath).publish('patched', async (data: SignalData, context) => {
    return app.channel(`peerIds/${data.targetPeerID}`).send(data)
  })
}
