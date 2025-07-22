import { createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { PeerID, UserID } from '@ir-engine/hyperflux'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { NetworkId, NetworkObjectComponent } from './NetworkObjectComponent'

describe('NetworkObjectComponent', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Creates a NetworkObjectComponent', () => {
    const entity = createEntity()

    setComponent(entity, NetworkObjectComponent)
    const networkObjectComponent = getComponent(entity, NetworkObjectComponent)
    networkObjectComponent.networkId = 12 as NetworkId
    assert.equal(NetworkObjectComponent.networkId[entity], 12)
  })

  it('Sets a NetworkObjectComponent', () => {
    const entity = createEntity()

    setComponent(entity, NetworkObjectComponent, {
      ownerId: 'ownerID' as UserID,
      ownerPeer: 'ownerPeer' as PeerID,
      authorityPeerID: 'authPeerID' as PeerID,
      networkId: 32 as NetworkId
    })
    const networkObjectComponent = getComponent(entity, NetworkObjectComponent)
    assert.equal(networkObjectComponent.ownerId, 'ownerID')
    assert.equal(networkObjectComponent.ownerPeer, 'ownerPeer')
    assert.equal(networkObjectComponent.authorityPeerID, 'authPeerID')
    assert.equal(networkObjectComponent.networkId, 32)
    assert.equal(NetworkObjectComponent.networkId[entity], 32)

    const json = NetworkObjectComponent.toJSON(networkObjectComponent)

    assert.equal(json.ownerId, 'ownerID')
    assert.equal(json.ownerPeer, 'ownerPeer')
    assert.equal(json.authorityPeerID, 'authPeerID')
    assert.equal(json.networkId, 32)
  })
})
