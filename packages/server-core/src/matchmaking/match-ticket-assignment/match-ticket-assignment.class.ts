import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import { KnexService } from '@feathersjs/knex/lib'

import {
  MatchTicketAssignmentQuery,
  MatchTicketAssignmentType
} from '@ir-engine/matchmaking/src/match-ticket-assignment.schema'

export interface MatchTicketAssignmentParams extends KnexAdapterParams<MatchTicketAssignmentQuery> {}

/**
 * A class for MatchTicketAssignment service
 */
export class MatchTicketAssignmentService<
  T = MatchTicketAssignmentType,
  ServiceParams extends Params = MatchTicketAssignmentParams
> extends KnexService<MatchTicketAssignmentType, MatchTicketAssignmentParams> {}
