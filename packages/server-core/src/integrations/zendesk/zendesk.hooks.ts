import { HookContext } from '@feathersjs/feathers/lib/declarations'
import { identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import appConfig from '@ir-engine/server-core/src/appconfig'
import { disallow } from 'feathers-hooks-common'
import { sign } from 'jsonwebtoken'
import { Application } from '../../../declarations'

const getZendeskToken = async (context: HookContext<Application>) => {
  const identityProviders = await context.app
    .service(identityProviderPath)
    .find({ query: { userId: context.params.user.id } })

  const { email } = identityProviders.data.find((ip) => ip.email!)!

  context.result = sign(
    {
      scope: 'user',
      external_id: context.params.user.id,
      name: context.params.user.name,
      email
    },
    appConfig.zendesk.secret!,
    {
      header: {
        alg: 'HS256',
        kid: appConfig.zendesk.kid
      }
    }
  )
  return context
}

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [getZendeskToken],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
