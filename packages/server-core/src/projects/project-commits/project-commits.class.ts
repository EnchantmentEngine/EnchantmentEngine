import { ServiceInterface } from '@feathersjs/feathers'

import { ProjectCommitsType } from '@ir-engine/common/src/schemas/projects/project-commits.schema'

import { Application } from '../../../declarations'
import { getProjectCommits } from '../project/project-helper'
import { ProjectParams, ProjectParamsClient } from '../project/project.class'

export class ProjectCommitsService implements ServiceInterface<ProjectCommitsType> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get(url: string, params?: ProjectParamsClient) {
    const commits = await getProjectCommits(this.app, url, params as ProjectParams)

    const projectCommits: ProjectCommitsType = { commits: commits }
    return projectCommits
  }
}
