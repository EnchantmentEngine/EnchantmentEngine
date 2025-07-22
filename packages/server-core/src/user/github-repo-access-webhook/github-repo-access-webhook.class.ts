import { NotAuthenticated } from '@feathersjs/errors'
import { Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import crypto from 'crypto'

import { githubRepoAccessRefreshPath } from '@ir-engine/common/src/schemas/user/github-repo-access-refresh.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'

export interface GithubRepoAccessWebhookParams extends KnexAdapterParams {}

/**
 * A class for Github Repo Access Webhook service
 */
export class GithubRepoAccessWebhookService implements ServiceInterface<string, GithubRepoAccessWebhookParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data, params) {
    const SIG_HEADER_NAME = 'x-hub-signature-256'
    const SIG_HASH_ALGORITHM = 'sha256'
    try {
      const secret = (
        (await this.app.service(engineSettingPath).find({
          query: {
            category: 'server',
            key: EngineSettings.Server.GithubWebhookSecret,
            $limit: 1
          }
        })) as Paginated<EngineSettingType>
      ).data[0].value
      const sig = Buffer.from(params.headers[SIG_HEADER_NAME] || '', 'utf8')
      const hmac = crypto.createHmac(SIG_HASH_ALGORITHM, secret)
      const digest = Buffer.from(SIG_HASH_ALGORITHM + '=' + hmac.update(JSON.stringify(data)).digest('hex'), 'utf8')
      if (sig.length !== digest.length || !crypto.timingSafeEqual(new Uint8Array(digest), new Uint8Array(sig))) {
        throw new NotAuthenticated('Invalid secret')
      }
      const { blocked_user, member, membership } = data
      const ghUser = member
        ? member.login
        : membership
        ? membership.user.login
        : blocked_user
        ? blocked_user.login
        : null
      if (!ghUser) return ''

      const githubIdentityProvider = (await this.app.service(identityProviderPath).find({
        query: {
          type: 'github',
          accountIdentifier: ghUser,
          $limit: 1
        }
      })) as Paginated<IdentityProviderType>

      if (githubIdentityProvider.data.length === 0) return ''
      const user = await this.app.service(userPath).get(githubIdentityProvider.data[0].userId)
      // GitHub's API doesn't always reflect changes to user repo permissions right when a webhook is sent.
      // 10 seconds should be more than enough time for the changes to propagate.
      setTimeout(() => {
        this.app.service(githubRepoAccessRefreshPath).find({ user })
      }, 10000)
      return ''
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
