import { Params } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import { AllowedDomainsType } from '@ir-engine/common/src/schemas/networking/allowed-domains.schema'
import { BaseService } from '../../BaseService'
export interface AllowedDomainParams extends KnexAdapterParams {
  additionalDomains?: string[]
  isAllowed?: boolean
}

export class AllowedDomainsService<
  T = AllowedDomainsType,
  ServiceParams extends Params = AllowedDomainParams
> extends BaseService<boolean, null, ServiceParams> {}
