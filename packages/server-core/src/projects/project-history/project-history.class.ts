import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ProjectHistoryData,
  ProjectHistoryQuery,
  ProjectHistoryType
} from '@ir-engine/common/src/schemas/projects/project-history.schema'
import { Application } from '@ir-engine/server-core/declarations'

export interface ProjectHistoryParams extends KnexAdapterParams<ProjectHistoryQuery> {}

export class ProjectHistoryService<
  T = ProjectHistoryType,
  ServiceParams extends Params = ProjectHistoryParams
> extends KnexService<ProjectHistoryType, ProjectHistoryData, ProjectHistoryParams> {
  app: Application
}
