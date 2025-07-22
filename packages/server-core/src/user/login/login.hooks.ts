import { BadRequest } from '@feathersjs/errors'
import { disallow } from 'feathers-hooks-common'
import { HookContext } from '../../../declarations'
import config from '../../appconfig'

/**
 * Here we need to validate that the redirect url is of same origin as of client.
 * @param context
 */
const validateRedirectUrl = (context: HookContext) => {
  if (context.params.query?.redirectUrl) {
    const origin = new URL(context.params.query.redirectUrl).origin

    // We only allow redirect to the same origin as of client
    if (origin !== config.client.url) {
      throw new BadRequest(
        `Invalid redirect URL: ${context.params.query.redirectUrl}. Only redirect URLs from the same origin are allowed.`
      )
    }
  }
}

export default {
  before: {
    all: [],
    find: [disallow('external')],
    get: [validateRedirectUrl],
    create: [disallow('external')],
    update: [disallow('external')],
    patch: [disallow('external')],
    remove: [disallow('external')]
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
