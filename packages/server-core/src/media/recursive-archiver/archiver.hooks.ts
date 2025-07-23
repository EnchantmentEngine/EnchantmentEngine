import { disallow, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import logRequest from '@ir-engine/server-core/src/hooks/log-request'
import checkScope from '../../hooks/check-scope'
import resolveProjectId from '../../hooks/resolve-project-id'
import setLoggedinUserInBody from '../../hooks/set-loggedin-user-in-body'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import verifyScope from '../../hooks/verify-scope'
import { ArchiverService } from './archiver.class'

const ensureProject = async (context: HookContext<ArchiverService>) => {
  if (context.method !== 'get') throw new BadRequest(`${context.path} service only works for data in get`)

  if (!context.params.query.project) throw new BadRequest('Project is required')
}

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [
      ensureProject,
      iff(
        isProvider('external'),
        iffElse(
          checkScope('static_resource', 'write'),
          [],
          [verifyScope('editor', 'write'), resolveProjectId(), verifyProjectPermission(['owner', 'editor'])]
        )
      ),
      setLoggedinUserInBody('userId'),
      discardQuery('projectId')
    ],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
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
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
