import { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import {
  InviteCodeLookupQuery,
  InviteCodeLookupType
} from '@ir-engine/common/src/schemas/social/invite-code-lookup.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'

export interface InviteCodeLookupParams extends KnexAdapterParams<InviteCodeLookupQuery> {}

export class InviteCodeLookupService implements ServiceInterface<InviteCodeLookupType, InviteCodeLookupParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: InviteCodeLookupParams) {
    const inviteCode = params?.query?.inviteCode

    if (inviteCode) {
      const users = await this.app.service(userPath).find({
        query: {
          inviteCode
        },
        paginate: false
      })

      return users.map((user) => ({ id: user.id }) as InviteCodeLookupType)
    }

    return []
  }
}
