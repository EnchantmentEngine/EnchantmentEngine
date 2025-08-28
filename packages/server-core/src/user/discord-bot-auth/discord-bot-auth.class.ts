import { errors } from '@feathersjs/errors'
import { Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import fetch from 'node-fetch'

import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserID, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'

export class DiscordBotAuthService implements ServiceInterface<UserType, KnexAdapterParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: KnexAdapterParams) {
    const url = `https://discord.com/api/users/@me`
    try {
      const authResponse = await fetch(url, {
        headers: {
          Authorization: `Bot ${params!.query!.bot_token}`
        }
      })
      const resData = JSON.parse(Buffer.from(await authResponse.arrayBuffer()).toString())
      if (!resData?.bot) throw new Error('The authenticated Discord user is not a bot')
      const token = `discord:::${resData.id}`
      const ipResult = (await this.app.service(identityProviderPath).find({
        query: {
          token: token,
          type: 'discord'
        }
      })) as Paginated<IdentityProviderType>
      if (ipResult.total > 0) {
        return this.app.service(userPath).get(ipResult.data[0].userId)
      } else {
        const ipCreation = await this.app.service(identityProviderPath).create({
          token: token,
          type: 'discord',
          userId: '' as UserID
        })
        return this.app.service(userPath).get(ipCreation.userId)
      }
    } catch (err) {
      logger.error(err)
      if (errors[err.response.status]) {
        throw new errors[err.response.status]()
      } else {
        throw new Error(err)
      }
    }
  }
}
