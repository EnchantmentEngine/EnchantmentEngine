import '../../patchEngineNode'

import assert from 'assert'
import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { inviteTypes } from '@ir-engine/common/src/schemas/social/invite-type.schema'
import { invitePath, InviteType } from '@ir-engine/common/src/schemas/social/invite.schema'
import { LocationType } from '@ir-engine/common/src/schemas/social/location.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { UserName, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createTestLocation } from '../../../tests/util/createTestLocation'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('invite.service', () => {
  let app: Application
  let testUser: UserType
  let testLocation: LocationType
  const invites: InviteType[] = []

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()

    const name = ('test-invite-user-name-' + uuidv4()) as UserName
    const avatarName = 'test-invite-avatar-name-' + uuidv4()

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    testUser = await app.service(userPath).create({
      name,
      isGuest: false
    })

    testLocation = await createTestLocation(app)
  })

  afterAll(async () => {
    await app.service(userPath).remove(testUser.id)
    await tearDownAPI()
    destroyEngine()
  })

  inviteTypes.forEach((inviteType) => {
    it(`should create an invite with type ${inviteType}`, async () => {
      const inviteType = 'friend'
      const token = `${uuidv4()}@ir-engine.io`
      const identityProviderType = 'email'

      const createdInvite = await app.service(invitePath).create(
        {
          inviteType,
          token,
          targetObjectId: testLocation.id,
          identityProviderType,
          deleteOnUse: true,
          inviteeId: testUser.id
        },
        { user: testUser }
      )

      invites.push(createdInvite)

      assert.ok(createdInvite.id)
      assert.ok(createdInvite.passcode)
      assert.equal(createdInvite.inviteType, inviteType)
      assert.equal(createdInvite.token, token)
      assert.equal(createdInvite.targetObjectId, testLocation.id)
      assert.equal(createdInvite.inviteeId, testUser.id)
      assert.equal(createdInvite.identityProviderType, identityProviderType)
    })
  })

  it('should find invites by searching', async () => {
    const lastInvite = invites.at(-1)!
    const foundInvites = await app.service(invitePath).find({
      query: {
        $or: [
          {
            inviteType: {
              $like: '%' + lastInvite.passcode + '%'
            }
          },
          {
            passcode: {
              $like: '%' + lastInvite.passcode + '%'
            }
          }
        ]
      },
      isInternal: true
    })

    assert.equal(foundInvites.data[0].passcode, lastInvite?.passcode)
  })

  it('should find received invites', async () => {
    const receivedInvites = await app.service(invitePath).find({
      query: {
        action: 'received'
      },
      user: testUser
    })

    assert.ok(receivedInvites.total > 0)
  })

  it('should find sent invites', async () => {
    const sentInvites = await app.service(invitePath).find({
      query: {
        action: 'sent'
      },
      user: testUser
    })

    assert.ok(sentInvites.total > 0)
  })

  it('should find invites by searching and query action present', async () => {
    const secondLastInvite = invites.at(-2)!
    const foundInvites = await app.service(invitePath).find({
      query: {
        action: 'sent',
        $or: [
          {
            inviteType: {
              $like: '%' + secondLastInvite.passcode + '%'
            }
          },
          {
            passcode: {
              $like: '%' + secondLastInvite.passcode + '%'
            }
          }
        ]
      },
      user: testUser
    })

    assert.equal(foundInvites.data[0].passcode, secondLastInvite?.passcode)
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(invitePath).find({ isInternal: true })

    assert.ok('total' in item)
  })

  it('should remove invites', async () => {
    for (const invite of invites) {
      await app.service(invitePath).remove(invite.id)
      const foundInvites = await app.service(invitePath).find({ query: { id: invite.id }, isInternal: true })
      assert.equal(foundInvites.total, 0)
    }
  })
})
