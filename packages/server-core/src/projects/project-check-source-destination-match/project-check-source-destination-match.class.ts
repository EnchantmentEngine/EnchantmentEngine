import { ServiceInterface } from '@feathersjs/feathers'

import { ProjectCheckSourceDestinationMatchType } from '@ir-engine/common/src/schemas/projects/project-check-source-destination-match.schema'

import { Application } from '../../../declarations'
import { checkProjectDestinationMatch } from '../project/project-helper'
import { ProjectParams, ProjectParamsClient } from '../project/project.class'

export class ProjectCheckSourceDestinationMatchService
  implements ServiceInterface<ProjectCheckSourceDestinationMatchType>
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: ProjectParamsClient) {
    return checkProjectDestinationMatch(this.app, params as ProjectParams)
  }
}
