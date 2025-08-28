import { NullableId, ServiceInterface } from '@feathersjs/feathers'

import { isDev } from '@ir-engine/common/src/config'
import { invalidationPath } from '@ir-engine/common/src/schemas/media/invalidation.schema'
import { ProjectInvalidatePatch } from '@ir-engine/common/src/schemas/projects/project-invalidate.schema'

import { Application } from '../../../declarations'

//export interface ProjectInvalidateParams extends KnexAdapterParams<ProjectInvalidateQuery> {}

export class ProjectInvalidateService implements ServiceInterface<void, ProjectInvalidatePatch> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async patch(id: NullableId, data: ProjectInvalidatePatch) {
    if (data.projectName && !isDev)
      await this.app.service(invalidationPath).create({
        path: `projects/${data.projectName}*`
      })
  }
}
