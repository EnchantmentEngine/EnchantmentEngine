import { ServiceInterface } from '@feathersjs/feathers'

import { ProjectBuilderTagsType } from '@ir-engine/common/src/schemas/projects/project-builder-tags.schema'

import { Application } from '../../../declarations'
import { findBuilderTags } from '../project/project-helper'

export class ProjectBuilderTagsService implements ServiceInterface<ProjectBuilderTagsType> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find() {
    return findBuilderTags()
  }
}
