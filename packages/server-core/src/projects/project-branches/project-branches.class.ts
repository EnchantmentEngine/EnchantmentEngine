import { ServiceInterface } from '@feathersjs/feathers'

import { ProjectBranchesType } from '@ir-engine/common/src/schemas/projects/project-branches.schema'

import { Application } from '../../../declarations'
import { getBranches } from '../project/project-helper'
import { ProjectParams, ProjectParamsClient } from '../project/project.class'

export class ProjectBranchesService implements ServiceInterface<ProjectBranchesType> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get(url: string, params?: ProjectParamsClient) {
    const branches = await getBranches(this.app, url, params as ProjectParams)

    const projectBranches: ProjectBranchesType = { branches: branches }
    return projectBranches
  }
}
