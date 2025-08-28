import { Paginated, Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  ProjectPermissionData,
  ProjectPermissionPatch,
  ProjectPermissionQuery,
  ProjectPermissionType
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'

export interface ProjectPermissionParams extends KnexAdapterParams<ProjectPermissionQuery> {}

/**
 * A class for ProjectPermission service
 */

export class ProjectPermissionService<
  T = ProjectPermissionType,
  ServiceParams extends Params = ProjectPermissionParams
> extends KnexService<ProjectPermissionType, ProjectPermissionData, ProjectPermissionParams, ProjectPermissionPatch> {
  async makeRandomProjectOwnerIfNone(projectId) {
    const projectOwners = (await super.find({
      query: {
        projectId: projectId,
        type: 'owner'
      },
      paginate: false
    })) as any as ProjectPermissionType[]

    if (projectOwners.length === 0) {
      const newOwner = (await super.find({
        query: {
          projectId: projectId,
          $limit: 1
        }
      })) as Paginated<ProjectPermissionType>
      if (newOwner.data.length > 0)
        await super.patch(newOwner.data[0].id, {
          type: 'owner'
        })
    }
  }
}
