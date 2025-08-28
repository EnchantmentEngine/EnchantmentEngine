import { NullableId, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'

import { Application } from '../../../declarations'
import { pushProjectToGithub } from '../project/github-helper'

export class ProjectGithubPushService implements ServiceInterface<void> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async patch(id: NullableId, data: any, params?: KnexAdapterParams): Promise<void> {
    const project = await this.app.service(projectPath).get(id!)
    return pushProjectToGithub(this.app, project, params!.user!)
  }
}
