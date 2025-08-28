import '../patchEngineNode'

import { NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { InviteCode, UserName, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../createApp'
import verifyScope from './verify-scope'

const mockUserHookContext = (user: UserType, app: Application) => {
  return {
    app,
    params: {
      user
    }
  } as unknown as HookContext<Application>
}

describe('verify-scope', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should fail if user does not have scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    user = await app.service(userPath).get(user.id, { user })

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    await assert.rejects(async () => await verifyLocationReadScope(hookContext), NotFound)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should verify guest has scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should verify user has scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should verify admin', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = false

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    await app.service(scopePath).create({
      type: 'location:read' as ScopeType,
      userId: user.id
    })

    await app.service(scopePath).create({
      type: 'admin:admin' as ScopeType,
      userId: user.id
    })

    user = await app.service(userPath).get(user.id, { user })

    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should verify if isInternal', () => {
    const verifyLocationReadScope = verifyScope('location', 'read')
    const hookContext = mockUserHookContext(null!, app)
    hookContext.params.isInternal = true

    assert.doesNotThrow(() => verifyLocationReadScope(hookContext))
  })
})
