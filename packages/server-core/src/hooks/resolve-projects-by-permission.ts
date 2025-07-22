import { Forbidden } from '@feathersjs/errors'
import { ProjectType, UserType, projectPath, projectPermissionPath } from '@ir-engine/common/src/schema.type.module'
import { Application, HookContext } from '../../declarations'
/**
 * if project is not provided query the project permission table for all projects the user has permissions for.
 * Then add the projects to the $in of the query
 * @param context
 * @returns
 */
export default () => {
  return async (context: HookContext<Application>) => {
    if (!context.params.query?.project) {
      const loggedInUser = context.params.user as UserType
      const data = await context.app.service(projectPermissionPath).find({
        query: {
          userId: loggedInUser.id
        },
        paginate: false
      })

      const allowedProjects = (await context.app.service(projectPath).find({
        query: {
          $or: [{ visibility: 'public' }, { id: { $in: data.map((projectPermission) => projectPermission.projectId) } }]
        },
        paginate: false
      })) as any as ProjectType[]

      if (allowedProjects.length === 0) {
        console.error(`No Project permissions found. UserId: ${loggedInUser.id}`)
        throw new Forbidden(`Project permissions not found`)
      }

      context.params.query.project = { $in: allowedProjects.map((project) => project.name) }

      return context
    }
    return context
  }
}
