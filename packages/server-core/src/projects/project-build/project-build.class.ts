import { ServiceInterface } from '@feathersjs/feathers'

import { ProjectBuildPatch, ProjectBuildType } from '@ir-engine/common/src/schemas/projects/project-build.schema'

import { Application } from '../../../declarations'
import { checkBuilderService, updateBuilder } from '../project/project-helper'
import { ProjectParams, ProjectParamsClient } from '../project/project.class'

export class ProjectBuildService implements ServiceInterface<ProjectBuildType, ProjectBuildPatch> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find() {
    return await checkBuilderService(this.app)
  }

  async patch(tag: string, data: ProjectBuildPatch, params?: ProjectParamsClient) {
    await updateBuilder(this.app, tag, data, params as ProjectParams)
    return {} as ProjectBuildType
  }
}
