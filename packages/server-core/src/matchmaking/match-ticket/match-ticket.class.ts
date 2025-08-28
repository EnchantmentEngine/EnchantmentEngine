import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import { KnexService } from '@feathersjs/knex/lib'

import { MatchTicketData, MatchTicketQuery, MatchTicketType } from '@ir-engine/matchmaking/src/match-ticket.schema'

export interface MatchTicketParams extends KnexAdapterParams<MatchTicketQuery> {}

/**
 * A class for MatchTicket service
 */
export class MatchTicketService<
  T = MatchTicketType,
  ServiceParams extends Params = MatchTicketParams
> extends KnexService<MatchTicketType, MatchTicketData, MatchTicketParams> {}
