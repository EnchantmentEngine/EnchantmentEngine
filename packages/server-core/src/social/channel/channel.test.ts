import '../../patchEngineNode'

import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { channelUserPath, ChannelUserType } from '@ir-engine/common/src/schemas/social/channel-user.schema'
import { channelPath, ChannelType } from '@ir-engine/common/src/schemas/social/channel.schema'
import { RoomCode } from '@ir-engine/common/src/schemas/social/location.schema'
import { userRelationshipPath } from '@ir-engine/common/src/schemas/user/user-relationship.schema'
import { InviteCode, UserID, UserName, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('channel service', () => {
  let app: Application
  beforeEach(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterEach(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('registered the service', () => {
    const service = app.service(channelPath)
    assert.ok(service, 'Registered the service')
  })

  it('creates a channel without userId or instanceId', async () => {
    const channel = await app.service(channelPath).create({})
    assert.ok(channel.id)
  })

  it('creates and finds channel with userId', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })

    const channel = await app.service(channelPath).create({}, { user })

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service(channelPath).find({
      query: {
        id: channel.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelUserByID = (await app.service(channelUserPath).find({
      query: {
        channelId: channel.id
      }
    })) as Paginated<ChannelUserType>

    assert.ok('total' in channelUserByID, 'find result should contain "total"')
    assert.equal(channelUserByID.data.length, 1)
    assert.equal(channelUserByID.data[0].channelId, channel.id)
    assert.equal(channelUserByID.data[0].userId, user.id)

    const channelUserByUser = (await app.service(channelUserPath).find({
      query: {
        userId: user.id
      }
    })) as Paginated<ChannelUserType>

    assert.equal(channelUserByUser.data.length, 1)
    assert.equal(channelUserByUser.data[0].channelId, channel.id)
    assert.equal(channelUserByUser.data[0].userId, user.id)
  })

  it('can remove and finds channel with instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })

    const instance = (await app.service(instancePath).create(
      { roomCode: '' as RoomCode },
      {
        // @ts-ignore
        isInternal: true
      }
    )) as InstanceType

    const channel = await app.service(channelPath).create(
      {
        instanceId: instance.id
      },
      { user }
    )

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service(channelPath).find({
      query: {
        id: channel.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelFindAsUser = (await app.service(channelPath).find({
      query: {
        instanceId: instance.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsUser.length, 1)
    assert.equal(channelFindAsUser[0].id, channel.id)
  })

  it('will not create a channel with both userId and instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })

    const instance = (await app.service(instancePath).create(
      { roomCode: '' as RoomCode },
      {
        // @ts-ignore
        isInternal: true
      }
    )) as InstanceType

    try {
      await app.service(channelPath).create(
        {
          instanceId: instance.id
        },
        { user }
      )
    } catch (e) {
      assert.ok(e)
    }
  })

  it('creates and finds channel with instanceId', async () => {
    const user = await app.service(userPath).create({
      name: 'user' as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })

    const instance = (await app.service(instancePath).create(
      { roomCode: '' as RoomCode },
      {
        // @ts-ignore
        isInternal: true
      }
    )) as InstanceType

    const channel = await app.service(channelPath).create(
      {
        instanceId: instance.id
      },
      { user }
    )

    assert.ok(channel.id)

    const channelFindAsLoggedInUser = (await app.service(channelPath).find({
      query: {
        id: channel.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsLoggedInUser.length, 1)
    assert.equal(channelFindAsLoggedInUser[0].id, channel.id)

    const channelFindAsUser = (await app.service(channelPath).find({
      query: {
        instanceId: instance.id
      },
      paginate: false,
      user
    })) as ChannelType[]

    assert.equal(channelFindAsUser.length, 1)
    assert.equal(channelFindAsUser[0].id, channel.id)
  })

  it('should find exact channel match with specific users only', async () => {
    // Create three users
    const user1 = await app.service(userPath).create({
      name: 'user1' as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })

    const user2 = await app.service(userPath).create({
      name: 'user2' as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })

    const user3 = await app.service(userPath).create({
      name: 'user3' as UserName,
      isGuest: false,
      inviteCode: '' as InviteCode
    })

    // Create friend relationships between users
    await app.service(userRelationshipPath).create({
      userId: user1.id,
      relatedUserId: user2.id,
      userRelationshipType: 'friend'
    })

    await app.service(userRelationshipPath).create({
      userId: user1.id,
      relatedUserId: user3.id,
      userRelationshipType: 'friend'
    })

    await app.service(userRelationshipPath).create({
      userId: user2.id,
      relatedUserId: user1.id,
      userRelationshipType: 'friend'
    })

    await app.service(userRelationshipPath).create({
      userId: user3.id,
      relatedUserId: user1.id,
      userRelationshipType: 'friend'
    })

    await app.service(userRelationshipPath).create({
      userId: user2.id,
      relatedUserId: user3.id,
      userRelationshipType: 'friend'
    })

    await app.service(userRelationshipPath).create({
      userId: user3.id,
      relatedUserId: user2.id,
      userRelationshipType: 'friend'
    })

    // Create a channel with user1 and user2
    const channel1 = await app.service(channelPath).create(
      {
        users: [user2.id as UserID]
      },
      { user: user1 }
    )

    assert.ok(channel1.id)

    // Create a channel with user1, user2, and user3
    const channel2 = await app.service(channelPath).create(
      {
        users: [user2.id as UserID, user3.id as UserID]
      },
      { user: user1 }
    )

    assert.ok(channel2.id)
    assert.notEqual(channel1.id, channel2.id, 'Channels should have different IDs')

    // Try to create a channel with user1 and user2 again - should return the existing channel1
    const channel1Again = await app.service(channelPath).create(
      {
        users: [user2.id as UserID]
      },
      { user: user1 }
    )

    assert.equal(channel1Again.id, channel1.id, 'Should return the existing channel with exactly the same users')

    // Try to create a channel with user1, user2, and user3 again - should return the existing channel2
    const channel2Again = await app.service(channelPath).create(
      {
        users: [user2.id as UserID, user3.id as UserID]
      },
      { user: user1 }
    )

    assert.equal(channel2Again.id, channel2.id, 'Should return the existing channel with exactly the same users')
  })
})
