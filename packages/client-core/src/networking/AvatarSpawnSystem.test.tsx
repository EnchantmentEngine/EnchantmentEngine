import sinon from 'sinon'
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'

import '@ir-engine/engine'

import { Cache } from 'three'

import { API } from '@ir-engine/common'
import { avatarPath, staticResourcePath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import {
  EngineState,
  Entity,
  EntityID,
  EntityTreeComponent,
  SystemDefinitions,
  createEntity,
  destroyEngine,
  setComponent
} from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'
import '@ir-engine/engine/src/avatar/state/AvatarNetworkState'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { startEngineReactor } from '@ir-engine/engine/tests/startEngineReactor'
import {
  EventDispatcher,
  HyperFlux,
  NetworkActions,
  NetworkState,
  NetworkTopics,
  UserID,
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState,
  startReactor
} from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { SpectateActions } from '@ir-engine/spatial/src/camera/systems/SpectateSystem'
import { initializeSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { act, render } from '@testing-library/react'
import { v4 } from 'uuid'
import { LocationState } from '../social/services/LocationService'
import { AvatarSpawnSystem } from './AvatarSpawnSystem'

const system = SystemDefinitions.get(AvatarSpawnSystem)!

const waitForScene = (entity: Entity) => vi.waitUntil(() => GLTFComponent.isSceneLoaded(entity), { timeout: 5000 })

const emptyGltf = {
  asset: {
    version: '2.0'
  },
  scenes: [{ nodes: [] }],
  scene: 0,
  nodes: []
}

let eventDispatcher: EventDispatcher
let db: Record<string, Record<string, any>>
const userID = 'user id' as UserID

const sceneID = 'scene id'
const sceneURL = '/empty.gltf'

describe('AvatarSpawnSystem', async () => {
  beforeEach(async () => {
    Cache.enabled = true
    createEngine()
    initializeSpatialEngine()
    startEngineReactor()

    Cache.add(sceneURL, emptyGltf)

    await Physics.load()

    db = {
      [staticResourcePath]: [
        {
          id: sceneID,
          url: sceneURL
        }
      ],
      [userAvatarPath]: [
        {
          id: v4(),
          userId: userID,
          avatarId: v4(),
          avatar: {
            modelResource: {
              url: '/avatar.gltf'
            }
          }
        }
      ],
      [avatarPath]: []
    }

    const createService = (path: string) => {
      return {
        find: () => {
          return new Promise((resolve) => {
            resolve(
              JSON.parse(
                JSON.stringify({
                  data: db[path],
                  limit: 10,
                  skip: 0,
                  total: db[path].length
                })
              )
            )
          })
        },
        get: (id) => {
          return new Promise((resolve) => {
            const data = db[path].find((entry) => entry.id === id)
            resolve(data ? JSON.parse(JSON.stringify(data)) : null)
          })
        },
        on: (serviceName, cb) => {
          eventDispatcher.addEventListener(serviceName, cb)
        },
        off: (serviceName, cb) => {
          eventDispatcher.removeEventListener(serviceName, cb)
        }
      }
    }

    const apis = {
      [staticResourcePath]: createService(staticResourcePath),
      [userAvatarPath]: createService(userAvatarPath),
      [avatarPath]: createService(avatarPath)
    }
    eventDispatcher = new EventDispatcher()
    ;(API.instance as any) = {
      service: (path: string) => apis[path]
    }

    getMutableState(LocationState).currentLocation.location.sceneURL.set(sceneURL)
    SceneState.loadScene(sceneURL, sceneID)

    const sceneEntity = getState(SceneState)[sceneURL]
    await waitForScene(sceneEntity)

    createMockNetwork(NetworkTopics.world)

    const peerID = HyperFlux.store.peerID
    getMutableState(EngineState).userID.set(userID)

    const network = NetworkState.worldNetwork

    dispatchAction(
      NetworkActions.peerJoined({
        $network: network.id,
        peerID: peerID,
        peerIndex: 1,
        userID: userID
      })
    )

    applyIncomingActions()
  })

  afterEach(() => {
    // clear search
    const url = new URL(location.href)
    url.search = ''
    history.replaceState(history.state, null!, url.href)
    Cache.enabled = false
    return destroyEngine()
  })

  it.only('should spawn an avatar when there is no spectate data', async () => {
    startReactor(system.reactor!)

    await act(async () => render(null))

    applyIncomingActions()

    // should have spawn action
    const spawnAction = HyperFlux.store.actions.history.findLast((action) =>
      AvatarNetworkAction.spawn.test(action)
    ) as typeof AvatarNetworkAction.spawn._TYPE
    assert.ok(spawnAction)
    assert.deepEqual(spawnAction.type, AvatarNetworkAction.spawn.type)
    assert.ok(spawnAction.position)
    assert.ok(spawnAction.rotation)
    assert.ok(spawnAction.parentUUID)
    assert.equal(spawnAction.avatarURL, '/avatar.gltf')
    assert.equal(spawnAction.entityID, 'avatar')
    assert.equal(spawnAction.entitySourceID, userID as string)

    const avatarURLAction = HyperFlux.store.actions.history.findLast((action) =>
      AvatarNetworkAction.setAvatarURL.test(action)
    ) as typeof AvatarNetworkAction.setAvatarURL._TYPE
    assert.ok(avatarURLAction)
    assert.deepEqual(avatarURLAction.type, AvatarNetworkAction.setAvatarURL.type)
    assert.equal(avatarURLAction.avatarURL, '/avatar.gltf')
    assert.equal(avatarURLAction.entityUUID, userID + 'avatar')
  })

  it('should enter spectate mode with freecam when empty spectate is in search state', async () => {
    // add spectate to search
    const url = new URL(location.href)
    url.searchParams.set('spectate', '')
    history.replaceState(history.state, null!, url.href)

    startReactor(system.reactor!)

    await act(async () => render(null))

    applyIncomingActions()

    // should have spectate action
    const spectateAction = HyperFlux.store.actions.history.findLast((action) =>
      SpectateActions.spectateEntity.test(action)
    ) as typeof SpectateActions.spectateEntity._TYPE
    assert.ok(spectateAction)
    assert.equal(spectateAction.spectatorUserID, getState(EngineState).userID)
    assert.equal(spectateAction.spectatingEntity, '')
  })

  it('should enter spectate mode when spectate specified user is in search state', async () => {
    const otherUserID = 'other user id' as EntityID

    // add spectate to search
    const url = new URL(location.href)
    url.searchParams.set('spectate', otherUserID)
    history.replaceState(history.state, null!, url.href)

    startReactor(system.reactor!)

    await vi.waitFor(() => {
      applyIncomingActions()

      // should have spectate action
      const spectateAction = HyperFlux.store.actions.history.findLast((action) =>
        SpectateActions.spectateEntity.test(action)
      ) as typeof SpectateActions.spectateEntity._TYPE
      assert.ok(spectateAction)
      assert.equal(spectateAction.spectatorUserID, getState(EngineState).userID)
      assert.equal(spectateAction.spectatingEntity, otherUserID)
    })
  })

  it('should spectate entity specified in scene settings', async () => {
    const spectateUUID = 'spectate entity uuid' as EntityID
    const entity = createEntity()

    const sceneEntity = getState(SceneState)[sceneURL]
    setComponent(entity, EntityTreeComponent, { parentEntity: sceneEntity })
    setComponent(entity, SceneSettingsComponent, { spectateEntity: spectateUUID })

    startReactor(system.reactor!)

    await vi.waitFor(() => {
      applyIncomingActions()

      // should have spectate action
      const spectateAction = HyperFlux.store.actions.history.findLast((action) =>
        SpectateActions.spectateEntity.test(action)
      ) as typeof SpectateActions.spectateEntity._TYPE
      assert.ok(spectateAction)
      assert.equal(spectateAction.spectatorUserID, getState(EngineState).userID)
      assert.equal(spectateAction.spectatingEntity, spectateUUID)
    })
  })

  it('should select a new avatar if none is found', async () => {
    db[userAvatarPath] = []
    db[avatarPath] = [
      {
        id: v4(),
        modelResource: {
          url: '/avatar2.gltf'
        }
      }
    ]

    const patchCallSpy = sinon.spy()
    API.instance.service(userAvatarPath).patch = patchCallSpy

    startReactor(system.reactor!)

    await vi.waitFor(() => {
      expect(patchCallSpy.calledOnce).toBe(true)
    })
  })
})
