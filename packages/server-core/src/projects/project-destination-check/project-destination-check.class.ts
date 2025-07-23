import { ServiceInterface } from '@feathersjs/feathers'

import { ProjectDestinationCheckType } from '@ir-engine/common/src/schemas/projects/project-destination-check.schema'

import { Application } from '../../../declarations'
import { checkDestination } from '../project/project-helper'
import { ProjectParams, ProjectParamsClient } from '../project/project.class'

export class ProjectDestinationCheckService implements ServiceInterface<ProjectDestinationCheckType> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get(url: string, params?: ProjectParamsClient) {
    return checkDestination(this.app, url, params as ProjectParams)
  }
}
