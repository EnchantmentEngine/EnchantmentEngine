import '../../patchEngineNode'

import nock from 'nock'
import { afterAll, afterEach, assert, beforeAll, describe, it } from 'vitest'

import {
  avatarPath,
  identityProviderPath,
  projectDestinationCheckPath,
  scopePath,
  ScopeType,
  userApiKeyPath,
  UserApiKeyType,
  UserName,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { destroyEngine } from '@ir-engine/ecs'

import { Application, HookContext } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { identityProviderDataResolver } from '../../user/identity-provider/identity-provider.resolvers'
import {
  getRepoManifestJson1,
  getRepoManifestJson2,
  getTestAuthenticatedUser,
  getTestUserRepos
} from '../../util/mockOctokitResponses'

describe('project-destination-check.test', () => {
  let app: Application
  let testUserApiKey: UserApiKeyType

  const getParams = () => ({
    provider: 'rest',
    headers: {
      authorization: `Bearer ${testUserApiKey.token}`
    }
  })

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()

    const name = ('test-project-destination-check-user-name-' + Math.random().toString().slice(2, 12)) as UserName

    const avatar = await app.service(avatarPath).create({
      name: 'test-project-destination-check-avatar-name-' + Math.random().toString().slice(2, 12)
    })

    const testUser = await app.service(userPath).create({
      name,
      isGuest: false
    })
    await app.service(scopePath).create({ userId: testUser.id, type: 'projects:read' as ScopeType })

    testUserApiKey = await app.service(userApiKeyPath).create({ userId: testUser.id })

    await app.service(identityProviderPath)._create(
      await identityProviderDataResolver.resolve(
        {
          type: 'github',
          token: `test-token-${Math.round(Math.random() * 1000)}`,
          userId: testUser.id
        },
        {} as HookContext
      ),
      getParams()
    )
  })

  afterEach(() => nock.cleanAll())

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should check for accessible repo', async () => {
    nock('https://api.github.com')
      .get(/\/user.*/)
      .reply(200, getTestAuthenticatedUser('test-non-owner'))
      .get(/\/user.*\/repos.*/)
      .reply(200, [])

    const result = await app
      .service(projectDestinationCheckPath)
      .get('https://github.com/MyOrg/my-first-project', getParams())

    assert.ok(result)
    assert.ok(result.error)
  })

  it('should check for empty project repository', async () => {
    nock('https://api.github.com')
      .get(/\/user.*/)
      .reply(200, getTestAuthenticatedUser('MyOrg'))
      .get(/\/user.*\/repos.*/)
      .reply(200, getTestUserRepos())
      .get(/\/repos.*\/contents\/*/)
      .reply(404)
      .get(/\/repos.*\/contents\/*/)
      .reply(404)

    const result = await app
      .service(projectDestinationCheckPath)
      .get('https://github.com/MyOrg/my-first-project', getParams())

    assert.ok(result)
    assert.equal(result.destinationValid, true)
    assert.equal(result.repoEmpty, true)
  })

  it('should check if the destination project and existing project are same', async () => {
    nock('https://api.github.com')
      .get(/\/user.*/)
      .reply(200, getTestAuthenticatedUser('MyOrg'))
      .get(/\/user.*\/repos.*/)
      .reply(200, getTestUserRepos())
      .get(/\/repos.*\/contents\/*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/*/)
      .reply(200, getRepoManifestJson2())

    const result = await app.service(projectDestinationCheckPath).get('https://github.com/MyOrg/my-first-project', {
      query: {
        inputProjectURL: 'https://github.com/MyOrg/ir-bot'
      },
      ...getParams()
    })

    assert.ok(result)
    assert.ok(result.error)
  })

  it('should check destination match', async () => {
    nock('https://api.github.com')
      .get(/\/user.*/)
      .reply(200, getTestAuthenticatedUser('MyOrg'))
      .get(/\/user.*\/repos.*/)
      .reply(200, getTestUserRepos())
      .get(/\/repos.*\/contents\/*/)
      .reply(200, getRepoManifestJson1())
      .get(/\/repos.*\/contents\/*/)
      .reply(200, getRepoManifestJson1())

    const result = await app.service(projectDestinationCheckPath).get('https://github.com/MyOrg/my-first-project', {
      query: {
        inputProjectURL: 'https://github.com/MyOrg/my-first-project'
      },
      ...getParams()
    })

    assert.ok(result)
    assert.equal(result.destinationValid, true)
  })
})
