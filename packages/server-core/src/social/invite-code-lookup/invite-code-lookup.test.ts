import '../../patchEngineNode'

import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { inviteCodeLookupPath } from '@ir-engine/common/src/schemas/social/invite-code-lookup.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { UserName, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

let user: UserType

describe('invite-code-lookup service', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()

    const name = `Test #${Math.random()}` as UserName
    const avatarName = 'CyberbotGreen'
    const isGuest = true

    const avatar = await app.service(avatarPath).create({
      name: avatarName
    })

    user = await app.service(userPath).create({
      name,
      isGuest
    })
  })
  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('registered the service', async () => {
    const service = await app.service(inviteCodeLookupPath)
    assert.ok(service, 'Registered the service')
  })

  it('should find user', async () => {
    const inviteCodeLookups = await app.service(inviteCodeLookupPath).find({
      query: {
        inviteCode: user.inviteCode!
      },
      isInternal: true
    })

    assert.ok(inviteCodeLookups, 'user item is found')
  })
})
