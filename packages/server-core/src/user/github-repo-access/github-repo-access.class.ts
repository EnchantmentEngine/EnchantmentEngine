import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  GithubRepoAccessData,
  GithubRepoAccessPatch,
  GithubRepoAccessQuery,
  GithubRepoAccessType
} from '@ir-engine/common/src/schemas/user/github-repo-access.schema'

export interface GithubRepoAccessParams extends KnexAdapterParams<GithubRepoAccessQuery> {}

export class GithubRepoAccessService<
  T = GithubRepoAccessType,
  ServiceParams extends Params = GithubRepoAccessParams
> extends KnexService<GithubRepoAccessType, GithubRepoAccessData, GithubRepoAccessParams, GithubRepoAccessPatch> {}
