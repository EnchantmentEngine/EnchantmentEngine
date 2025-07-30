import { disallow } from 'feathers-hooks-common'

import { createSkippableHooks } from '../../hooks/createSkippableHooks'

import logRequest from '@ir-engine/server-core/src/hooks/log-request'
import { HookContext } from '../../../declarations'
import appConfig from '../../appconfig'
import { AllowedDomainsService } from './allowed-domains.class'

// Don't remove this comment. It's needed to format import lines nicely.

const checkDomain = async (context: HookContext<AllowedDomainsService>) => {
  const { params } = context
  const domainToCheck = (params?.query?.domainToCheck as string) || ''
  const additionalDomains = params.additionalDomains
  const isAllowed = params.isAllowed
  let allowedDomains = [`https://${appConfig.server.clientHost}`]

  if (additionalDomains && Array.isArray(additionalDomains)) allowedDomains = allowedDomains.concat(additionalDomains)

  context.result = isAllowed || allowedDomains.indexOf(domainToCheck) > -1
}

export default createSkippableHooks({
  before: {
    all: [logRequest()],
    find: [checkDomain],
    get: [disallow()],
    create: [disallow()],
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
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})
