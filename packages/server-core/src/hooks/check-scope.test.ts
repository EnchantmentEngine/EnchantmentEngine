import '../patchEngineNode'

import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { InviteCode, UserName, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../createApp'
import checkScope from './check-scope'

const mockUserHookContext = (user: UserType, app: Application) => {
  return {
    app,
    params: {
      user
    }
  } as unknown as HookContext<Application>
}

describe('check-scope', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should return false if user does not have scope', async () => {
    const name = `Test #${Math.random()}` as UserName
    const isGuest = true

    let user = await app.service(userPath).create({
      name,
      isGuest,
      inviteCode: '' as InviteCode
    })

    user = await app.service(userPath).get(user.id, { user })

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, false)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if guest has scope', async () => {
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

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if user has scope', async () => {
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

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if admin', async () => {
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

    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(user, app)

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)

    // cleanup
    await app.service(userPath).remove(user.id!)
  })

  it('should return true if isInternal', async () => {
    const checkLocationReadScope = checkScope('location', 'read')
    const hookContext = mockUserHookContext(null!, app)
    hookContext.params.isInternal = true

    const hasScope = await checkLocationReadScope(hookContext)
    assert.equal(hasScope, true)
  })
})
