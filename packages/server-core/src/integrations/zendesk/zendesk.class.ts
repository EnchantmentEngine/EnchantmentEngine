import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import { BaseService } from '../../BaseService'

export interface ZendeskAuthenticationParams extends KnexAdapterParams {}

/**
 * A class for ZendeskAuthentication service
 */
export class ZendeskAuthenticationService<
  T = string,
  ServiceParams extends Params = ZendeskAuthenticationParams
> extends BaseService<string, void, ZendeskAuthenticationParams> {}
