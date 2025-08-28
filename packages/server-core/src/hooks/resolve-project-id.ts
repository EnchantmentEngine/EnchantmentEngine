import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { ProjectType, projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { Application, HookContext } from '../../declarations'
/**
 * resolve project id from name in query
 * @param context
 * @returns
 */
export default () => {
  return async (context: HookContext<Application>) => {
    if (!context.params.query?.project && !context.data?.project) {
      return context
    }

    const projectName: string = context.params.query.project || context.data.project

    const projectResult = (await context.app.service(projectPath).find({
      query: { name: projectName, $limit: 1 }
    })) as Paginated<ProjectType>

    if (projectResult.data.length === 0) {
      throw new BadRequest(`No project named ${projectName} exists`)
    }
    context.params.query.projectId = projectResult.data[0].id
    return context
  }
}
