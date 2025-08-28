import '../../patchEngineNode'

import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { moderationPath, ModerationType } from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { ABUSE_REASONS } from '@ir-engine/common/src/constants/ModerationConstants'
import { locationPath, LocationType, UserName, userPath, UserType } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'
import { createTestLocation } from '../../../tests/util/createTestLocation'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

const moderations: ModerationType[] = []
const params = { isInternal: true } as any

describe('moderation.test', () => {
  let app: Application
  let user1: UserType
  let user2: UserType
  let testLocation: LocationType
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
    const isGuest = false

    user1 = await app.service(userPath).create({
      name: `Test User 1` as UserName,
      isGuest
    })
    user2 = await app.service(userPath).create({
      name: `Test User 2` as UserName,
      isGuest
    })

    testLocation = await createTestLocation(app, params)
  })
  afterAll(async () => {
    await app.service(userPath).remove(user1.id)
    await app.service(userPath).remove(user2.id)
    await app.service(locationPath).remove(testLocation.id)
    await tearDownAPI()
    destroyEngine()
  })

  it('should create a moderation entry', async () => {
    const moderationData = {
      type: 'user',
      abuseReason: ABUSE_REASONS[1],
      reportedUserId: user2.id,
      reportedLocationId: testLocation.id,
      reportDetails: 'Test details'
    } as ModerationType

    const moderation = await app.service(moderationPath).create(moderationData)
    moderations.push(moderation)

    assert.ok(moderation.id)
    assert.equal(moderation.reportedUserId, moderationData.reportedUserId)
    assert.equal(moderation.reportedLocationId, moderationData.reportedLocationId)
    assert.equal(moderation.reportDetails, moderationData.reportDetails)
    assert.equal(moderation.type, moderationData.type)
    assert.equal(moderation.status, 'open')
  })

  it('should find moderation entries', async () => {
    for (const moderation of moderations) {
      const item = await app.service(moderationPath).find({
        query: {
          id: moderation.id
        },
        isInternal: true
      })

      assert.ok(item, 'moderation item is found')
    }
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(moderationPath).find({
      isInternal: true
    })

    assert.ok('total' in item)
  })

  it('should patch moderation entries', async () => {
    for (const moderation of moderations) {
      await app.service(moderationPath).patch(
        moderation.id,
        {
          status: 'resolved'
        } as ModerationType,
        {
          isInternal: true
        }
      )
      const { status } = await app.service(moderationPath).get(moderation.id)
      assert.equal(status, 'resolved')
    }
  })

  it('should remove moderation entries', async () => {
    for (const moderation of moderations) {
      const item = await app.service(moderationPath).remove(moderation.id)
      assert.ok(item, 'moderation item is removed')
    }
  })
})
