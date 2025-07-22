import { BadRequest, NotFound } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import { createTicket, deleteTicket, getTicket } from '@ir-engine/matchmaking/src/functions'
import {
  MatchTicketData,
  MatchTicketType,
  matchTicketDataValidator,
  matchTicketQueryValidator
} from '@ir-engine/matchmaking/src/match-ticket.schema'
import matchmakingRemoveTicket from '@ir-engine/server-core/src/hooks/matchmaking-remove-ticket'
import matchmakingRestrictMultipleQueueing from '@ir-engine/server-core/src/hooks/matchmaking-restrict-multiple-queueing'
import matchmakingSaveTicket from '@ir-engine/server-core/src/hooks/matchmaking-save-ticket'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'

import { HookContext } from '../../../declarations'
import config from '../../appconfig'
import disallowNonId from '../../hooks/disallow-non-id'
import { emulate_createTicket, emulate_getTicket } from '../emulate'
import { MatchTicketService } from './match-ticket.class'
import {
  matchTicketDataResolver,
  matchTicketExternalResolver,
  matchTicketQueryResolver,
  matchTicketResolver
} from './match-ticket.resolvers'

const getEmulationTicket = async (context: HookContext<MatchTicketService>) => {
  let ticket
  if (config.server.matchmakerEmulationMode) {
    // emulate response from open-match-api
    ticket = await emulate_getTicket(context.service, context.id, context.params.user!.id)
  } else {
    ticket = getTicket(String(context.id!))
  }

  if (!ticket) {
    throw new NotFound()
  }
  context.result = ticket as MatchTicketType
}

const createInEmulation = async (context: HookContext<MatchTicketService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: MatchTicketData[] = Array.isArray(context.data) ? context.data : [context.data]
  const result: MatchTicketType[] = []

  for (const item of data) {
    if (config.server.matchmakerEmulationMode) {
      // emulate response from open-match-api
      return emulate_createTicket(item.gameMode)
    }

    result.push(await createTicket(item.gameMode, item.attributes))
  }
  context.result = result
}

const skipDeleteInEmulation = async (context: HookContext<MatchTicketService>) => {
  if (!config.server.matchmakerEmulationMode) {
    await deleteTicket(String(context.id))
  }

  context.result = undefined
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(matchTicketExternalResolver), schemaHooks.resolveResult(matchTicketResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(matchTicketQueryValidator), schemaHooks.resolveQuery(matchTicketQueryResolver)],
    find: [],
    get: [iff(isProvider('external'), setLoggedInUser('userId') as any), disallowNonId, getEmulationTicket],
    create: [
      iff(isProvider('external'), setLoggedInUser('userId') as any),
      matchmakingRestrictMultipleQueueing(),
      // addUUID(),
      schemaHooks.validateData(matchTicketDataValidator),
      schemaHooks.resolveData(matchTicketDataResolver),
      createInEmulation
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external')), skipDeleteInEmulation]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [matchmakingSaveTicket()],
    update: [],
    patch: [],
    remove: [matchmakingRemoveTicket()]
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
