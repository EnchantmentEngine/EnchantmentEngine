import { Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import { GenerateTokenData, GenerateTokenQuery } from '@ir-engine/common/src/schemas/user/generate-token.schema'
import { IdentityProviderType, identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'

import { Application } from '../../../declarations'

export interface GenerateTokenParams extends KnexAdapterParams<GenerateTokenQuery> {
  authentication?: any
}

/**
 * A class for GenerateToken service
 */

export class GenerateTokenService
  implements ServiceInterface<GenerateTokenData | null, GenerateTokenData, GenerateTokenParams>
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async create(data: GenerateTokenData, params?: GenerateTokenParams) {
    const userId = params?.user?.id
    if (!data.token || !data.type) throw new Error('Must pass service and identity-provider token to generate JWT')
    const ipResult = (await this.app.service(identityProviderPath).find({
      query: {
        userId: userId,
        type: data.type,
        token: data.token
      }
    })) as Paginated<IdentityProviderType>
    if (ipResult.total > 0) {
      const ip = ipResult.data[0]

      const newToken = await this.app.service('authentication').createAccessToken({}, { subject: ip.id.toString() })
      return {
        token: newToken,
        type: data.type
      }
    } else return null
  }
}
