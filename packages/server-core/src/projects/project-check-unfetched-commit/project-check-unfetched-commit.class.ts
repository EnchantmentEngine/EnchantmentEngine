import { ServiceInterface } from '@feathersjs/feathers'

import { ProjectCheckUnfetchedCommitType } from '@ir-engine/common/src/schemas/projects/project-check-unfetched-commit.schema'

import { Application } from '../../../declarations'
import { checkUnfetchedSourceCommit } from '../project/project-helper'
import { ProjectParams, ProjectParamsClient } from '../project/project.class'

export class ProjectCheckUnfetchedCommitService implements ServiceInterface<ProjectCheckUnfetchedCommitType> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get(url: string, params?: ProjectParamsClient) {
    return await checkUnfetchedSourceCommit(this.app, url, params as ProjectParams)
  }
}
