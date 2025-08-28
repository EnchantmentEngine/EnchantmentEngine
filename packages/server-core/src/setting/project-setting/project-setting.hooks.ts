import { hooks as schemaHooks } from '@feathersjs/schema'
import setLoggedInUserInData from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import { discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  projectSettingDataValidator,
  projectSettingPatchValidator,
  projectSettingPath,
  projectSettingQueryValidator
} from '@ir-engine/common/src/schemas/setting/project-setting.schema'

import { projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { HookContext } from '../../../declarations'
import checkProjectPermission from '../../hooks/check-project-permission'
import checkScope from '../../hooks/check-scope'
import enableClientPagination from '../../hooks/enable-client-pagination'
import makeQueryJoinable from '../../hooks/make-query-joinable'
import setInContext from '../../hooks/set-in-context'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import {
  projectSettingDataResolver,
  projectSettingExternalResolver,
  projectSettingPatchResolver,
  projectSettingQueryResolver,
  projectSettingResolver
} from './project-setting.resolvers'

/**
 * Hook used to handle project name in find query.
 * @param context
 * @returns
 */
export const handleProjectName = async (context: HookContext) => {
  const projectName = context.params.query?.projectName

  if (!projectName) return context

  discardQuery('projectName')(context)

  await makeQueryJoinable(projectSettingPath)(context)

  const query = context.service.createQuery(context.params)

  query.join(projectPath, `${projectPath}.id`, '=', `${projectSettingPath}.projectId`)
  query.where(`${projectPath}.name`, '=', projectName)

  context.params.knex = query
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectSettingExternalResolver),
      schemaHooks.resolveResult(projectSettingResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(projectSettingQueryValidator),
      schemaHooks.resolveQuery(projectSettingQueryResolver)
    ],
    find: [
      iff(isProvider('external'), enableClientPagination()),
      iff(
        isProvider('external'),
        iffElse(
          checkScope('projects', 'read'),
          [],
          [iffElse(checkProjectPermission(['owner', 'editor']), [], setInContext('type', 'public')) as any]
        )
      ),
      handleProjectName
    ],
    get: [],
    create: [
      setLoggedInUserInData('userId'),
      schemaHooks.validateData(projectSettingDataValidator),
      schemaHooks.resolveData(projectSettingDataResolver),
      iff(
        isProvider('external'),
        iffElse(checkScope('projects', 'write'), [], [verifyProjectPermission(['owner', 'editor'])])
      )
    ],
    patch: [
      setLoggedInUserInData('userId'),
      schemaHooks.validateData(projectSettingPatchValidator),
      schemaHooks.resolveData(projectSettingPatchResolver),
      iff(
        isProvider('external'),
        iffElse(checkScope('projects', 'write'), [], [verifyProjectPermission(['owner', 'editor'])])
      )
    ],
    update: [],
    remove: [
      iff(
        isProvider('external'),
        iffElse(checkScope('projects', 'write'), [], [verifyProjectPermission(['owner', 'editor'])])
      )
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
