import '../../patchEngineNode'

import assert from 'assert'
import nock from 'nock'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { projectCommitsPath } from '@ir-engine/common/src/schemas/projects/project-commits.schema'
import { ScopeType, scopePath } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserApiKeyType, userApiKeyPath } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { UserName, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application, HookContext } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { identityProviderDataResolver } from '../../user/identity-provider/identity-provider.resolvers'
import { getRepoManifestJson1, getTestRepoCommits, getTestRepoData } from '../../util/mockOctokitResponses'

describe('project-commits.test', () => {
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

    const name = ('test-project-commits-user-name-' + Math.random().toString().slice(2, 12)) as UserName

    const avatar = await app.service(avatarPath).create({
      name: 'test-project-commits-avatar-name-' + Math.random().toString().slice(2, 12)
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

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should get commits of the project', async () => {
    nock('https://api.github.com')
      .get(/\/repos.*/)
      .reply(200, getTestRepoData())
      .get(/\/repos.*\/commits.*/)
      .reply(200, getTestRepoCommits())
      .get(/\/repos.*\/contents\/.*/)
      .times(3)
      .reply(200, getRepoManifestJson1())

    const result = await app.service(projectCommitsPath).get('https://github.com/MyOrg/my-test-project', getParams())

    assert.ok(result)
    assert.notEqual(result.commits[0], result.commits[1])
    assert.notEqual(result.commits[1], result.commits[2])
    assert.notEqual(result.commits[2], result.commits[0])
  })
})
