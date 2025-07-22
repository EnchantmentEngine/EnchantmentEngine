import { NotFound } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { getTicketsAssignment } from '@ir-engine/matchmaking/src/functions'
import {
  matchTicketAssignmentQueryValidator,
  MatchTicketAssignmentType
} from '@ir-engine/matchmaking/src/match-ticket-assignment.schema'
import linkMatchUserToMatch from '@ir-engine/server-core/src/hooks/matchmaking-link-match-user-to-match'

import { HookContext } from '../../../declarations'
import config from '../../appconfig'
import { emulate_getTicketsAssignment } from '../emulate'
import { MatchTicketAssignmentService } from './match-ticket-assignment.class'
import {
  matchTicketAssignmentExternalResolver,
  matchTicketAssignmentQueryResolver,
  matchTicketAssignmentResolver
} from './match-ticket-assignment.resolvers'

const getTicketAssigment = async (context: HookContext<MatchTicketAssignmentService>) => {
  let assignment: MatchTicketAssignmentType
  try {
    if (config.server.matchmakerEmulationMode) {
      assignment = await emulate_getTicketsAssignment(
        context.service,
        context.id,
        context.params[identityProviderPath].userId
      )
    } else {
      assignment = await getTicketsAssignment(String(context.id))
    }
  } catch (e) {
    // todo: handle other errors. like no connection, etc....
    throw new NotFound(e.message, e)
  }

  context.result = assignment
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(matchTicketAssignmentExternalResolver),
      schemaHooks.resolveResult(matchTicketAssignmentResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(matchTicketAssignmentQueryValidator),
      schemaHooks.resolveQuery(matchTicketAssignmentQueryResolver)
    ],
    find: [],
    get: [getTicketAssigment],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [linkMatchUserToMatch()], // createLocationIfNotExists - is side effect...
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
