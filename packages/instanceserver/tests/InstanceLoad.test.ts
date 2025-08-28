import '../../server-core/src/patchEngineNode'

import getLocalServerIp from '@ir-engine/server-core/src/util/get-local-server-ip'
import appRootPath from 'app-root-path'
import assert from 'assert'
import { ChildProcess } from 'child_process'
import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { API } from '@ir-engine/common'
import {
  channelPath,
  channelUserPath,
  identityProviderPath,
  instanceAttendancePath,
  InstanceData,
  instancePath,
  locationPath,
  RoomCode,
  staticResourcePath,
  UserID,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { getState, HyperFlux, NetworkState, PeerID } from '@ir-engine/hyperflux'
import { Application } from '@ir-engine/server-core/declarations'

import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { EntityUUID, getComponent, UUIDComponent } from '@ir-engine/ecs'
import { AuthTask } from '@ir-engine/engine/src/avatar/functions/spawnLocalAvatarInWorld'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import config from '@ir-engine/server-core/src/appconfig'
import { Spark } from 'primus'
import { StartTestFileServer } from '../../server-core/src/createFileServer'
import { onConnection } from '../src/channels'
import { InstanceServerState } from '../src/InstanceServerState'
import { setupSocketFunctions } from '../src/SocketFunctions'
import { start } from '../src/start'

const p2pEnabled = config['instance-server'].p2pEnabled

describe('InstanceLoad', () => {
  beforeAll(async () => {
    config['instance-server'].p2pEnabled = false

    const child: ChildProcess = require('child_process').spawn('npm', ['run', 'dev-agones'], {
      cwd: appRootPath.path,
      stdio: 'inherit',
      detached: true
    })

    process.on('exit', async () => {
      process.kill(-child.pid!, 'SIGINT')
    })

    const app = await start()
    await app.setup()
    StartTestFileServer()
  })

  afterAll(() => {
    config['instance-server'].p2pEnabled = p2pEnabled
    return destroyEngine()
  })

  it('should load location', async () => {
    const app = API.instance as Application
    const loadLocation = onConnection(app)

    const type = 'guest'
    const token = uuidv4()

    const createdIdentityProvider = await app.service(identityProviderPath).create({
      type,
      token,
      userId: '' as UserID
    })

    const userID = createdIdentityProvider.userId
    const user = await app.service(userPath).get(userID)

    const peerID = uuidv4() as PeerID

    const testScene = await app.service(locationPath).find({
      query: {
        slugifiedName: 'test'
      }
    })

    const localIp = await getLocalServerIp()
    console.log('localIp', localIp)

    const instance = await app.service(instancePath).create({
      ipAddress: `${localIp}:3031`,
      locationId: testScene.data[0].id,
      assigned: false,
      assignedAt: toDateTimeSql(new Date()),
      roomCode: '' as RoomCode
    } as InstanceData)

    const query = {
      provider: 'test',
      headers: {},
      socketQuery: {
        peerID,
        token: createdIdentityProvider.accessToken,
        locationId: testScene.data[0].id,
        instanceID: '',
        channelId: '',
        roomCode: '',
        address: '',
        port: 0,
        EIO: '',
        transport: '',
        t: ''
      },
      instanceId: '',
      channelId: undefined
    } as any

    await loadLocation(query)

    const scene = await app.service(staticResourcePath).get(testScene.data[0].sceneId)

    const entity = UUIDComponent.getEntityByUUID(('root' + scene.id) as EntityUUID)
    assert(entity > 0)

    assert.equal(getComponent(entity, GLTFComponent).progress, 100)

    assert.equal(getState(InstanceServerState).instance.id, instance.id)
    assert.equal(NetworkState.worldNetwork.hostUserID, instance.id)

    assert.equal(NetworkState.worldNetwork.ready, true)
    assert.equal(getState(InstanceServerState).ready, true)

    const messages = [] as AuthTask[]
    let dataListenerOff = false
    let onData = (args: { peerID: PeerID; accessToken: string; inviteCode: string | null }) => {}

    const spark = {
      headers: { peerID },
      on: (label: string, cb) => {
        onData = cb
      },
      write: (data) => {
        messages.push(structuredClone(data))
      },
      off: () => {
        dataListenerOff = true
      }
    } as any as Spark

    await setupSocketFunctions(app, spark)

    assert.equal(messages.length, 0)

    await onData({ peerID, accessToken: createdIdentityProvider.accessToken!, inviteCode: null })

    assert.equal(messages.length, 2)
    assert.equal(messages[0].status, 'pending')
    assert.equal(messages[1].status, 'success')
    assert.equal(messages[1].hostPeerID, NetworkState.worldNetwork.hostPeerID)
    assert.equal(messages[1].hostPeerID, HyperFlux.store.peerID)

    const instanceAttendance = await app.service(instanceAttendancePath).find({
      query: {
        userId: user.id,
        instanceId: instance.id,
        peerId: peerID
      }
    })

    assert.equal(instanceAttendance.total, 1)
    assert.equal(messages[1].peerIndex, instanceAttendance.data[0].peerIndex)

    const channel = await app.service(channelPath).find({
      query: {
        instanceId: instance.id,
        $limit: 1
      }
    })

    const channelUser = await app.service(channelUserPath).find({
      query: {
        userId: user.id,
        channelId: channel.data[0].id
      }
    })

    assert.equal(channelUser.total, 1)
  })
})
