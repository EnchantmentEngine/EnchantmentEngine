import '../../patchEngineNode'

import assert from 'assert'
import nock from 'nock'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { projectBuilderTagsPath } from '@ir-engine/common/src/schemas/projects/project-builder-tags.schema'
import { ScopeType, scopePath } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserApiKeyType, userApiKeyPath } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { UserName, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application, HookContext } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { identityProviderDataResolver } from '../../user/identity-provider/identity-provider.resolvers'

describe('project-builder-tags.test', () => {
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

    const name = ('test-project-builder-tags-user-name-' + Math.random().toString().slice(2, 12)) as UserName

    const avatar = await app.service(avatarPath).create({
      name: 'test-project-builder-tags-avatar-name-' + Math.random().toString().slice(2, 12)
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

  it('should get the project branches', async () => {
    nock('https://registry.hub.docker.com')
      .get(/\/v2\/repositories.*/)
      .reply(200, getDockerhubTags())

    const result = await app.service(projectBuilderTagsPath).find({ ...getParams() }, undefined as any)

    assert.ok(result)
    assert.equal(result[0].tag, 'test-tag-name')
  })
})

const getDockerhubTags = () => ({
  count: 2,
  next: 'https://registry.hub.docker.com/v2/repositories/test-repo/test-image/tags?page=2\u0026page_size=100',
  previous: null,
  results: [
    {
      creator: 342683,
      id: 39529844,
      images: [
        {
          architecture: 'amd64',
          features: '',
          variant: null,
          digest: 'sha256:39d28161f5e5a04e8d5e4af6b719c52b950dae518b60c039d36edd5e95ea2a1d',
          os: 'linux',
          os_features: '',
          os_version: null,
          size: 80783288,
          status: 'active',
          last_pulled: '2023-12-15T11:50:11.184723Z',
          last_pushed: '2023-12-06T21:48:54.294135Z'
        },
        {
          architecture: 'arm64',
          features: '',
          variant: null,
          digest: 'sha256:ff97a4e996113cc4dd2dab2b2624f2b9f5325c46f771534f6bc6846f8515bfb2',
          os: 'linux',
          os_features: '',
          os_version: null,
          size: 77925682,
          status: 'active',
          last_pulled: '2023-12-15T12:23:01.948654Z',
          last_pushed: '2023-12-06T21:48:54.649074Z'
        }
      ],
      last_updated: '2023-12-06T21:48:55.380857Z',
      last_updater: 342683,
      last_updater_username: 'test-user',
      name: 'test-tag-name',
      repository: 6264175,
      full_size: 80783288,
      v2: true,
      tag_status: 'active',
      tag_last_pulled: '2023-12-15T12:23:01.948654Z',
      tag_last_pushed: '2023-12-06T21:48:55.380857Z',
      media_type: 'application/vnd.docker.distribution.manifest.list.v2+json',
      content_type: 'image',
      digest: 'sha256:6485a923f6f4ff3d42d871ce5bd45ee8f25a303c44972a4ad31ddd895082fc22'
    },
    {
      creator: 342683,
      id: 563189424,
      images: [
        {
          architecture: 'amd64',
          features: '',
          variant: null,
          digest: 'sha256:8ab252a4c5ccc514be246828a18479deb729dbf8d26d5e53e20426d7fa856733',
          os: 'linux',
          os_features: '',
          os_version: null,
          size: 80469332,
          status: 'active',
          last_pulled: '2023-12-15T12:26:08.510205Z',
          last_pushed: '2023-12-06T22:11:22.709586Z'
        },
        {
          architecture: 'arm64',
          features: '',
          variant: null,
          digest: 'sha256:4e7873ecfb03721362b4fe84fd68a70cb77904bf1c28fa0c26cce0e63fcef486',
          os: 'linux',
          os_features: '',
          os_version: null,
          size: 77654255,
          status: 'active',
          last_pulled: '2023-12-15T12:26:12.42531Z',
          last_pushed: '2023-12-06T22:11:22.842866Z'
        }
      ],
      last_updated: '2023-12-06T22:11:23.646208Z',
      last_updater: 342683,
      last_updater_username: 'test-user',
      name: '1.26.11-debian-11-r2',
      repository: 6264175,
      full_size: 80469332,
      v2: true,
      tag_status: 'active',
      tag_last_pulled: '2023-12-15T12:26:12.42531Z',
      tag_last_pushed: '2023-12-06T22:11:23.646208Z',
      media_type: 'application/vnd.docker.distribution.manifest.list.v2+json',
      content_type: 'image',
      digest: 'sha256:ef0a02442f270011b60e06c6da9c129e5e9edbef61720019f9d19f9239564698'
    }
  ]
})
