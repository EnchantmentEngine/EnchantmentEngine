import { BadRequest } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, iffElse, isProvider } from 'feathers-hooks-common'

import { staticResourceTagQueryValidator } from '@ir-engine/common/src/schemas/media/static-resource-tag.schema'
import { HookContext } from '../../../declarations'
import allowNullQuery from '../../hooks/allow-null-query'
import checkScope from '../../hooks/check-scope'
import enableClientPagination from '../../hooks/enable-client-pagination'
import resolveProjectId from '../../hooks/resolve-project-id'
import resolveProjectsByPermission from '../../hooks/resolve-projects-by-permission'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import verifyScope from '../../hooks/verify-scope'
import { StaticResourceTagService } from './static-resource-tag.class'
const applyQueryTransform = async (context: any) => {
  // Translate q -> tag $like, set default sort
  const q = context.params?.query?.q
  if (q) {
    // inject LIKE behavior via knex in service._find, but here we set query.tag.$like
    context.params.query = {
      ...context.params.query,
      tag: { $like: `%${q}%` }
    }
  }
  // Default sort: count desc, tag asc if not provided
  context.params.query = context.params.query || {}
  ;(context.params.query as any).$sort = (context.params.query as any).$sort || { count: -1, tag: 1 }

  // Default $select and includeCount support
  const includeCount = context.params?.query?.includeCount
  const baseSelect = includeCount === false ? ['project', 'tag'] : ['project', 'tag', 'count']
  if (!(context.params.query as any).$select) {
    ;(context.params.query as any).$select = baseSelect
  }
  return context
}

const requireProjectForExternal = async (context: HookContext<StaticResourceTagService>) => {
  if (context.params?.provider && !context.params.query?.project) {
    throw new BadRequest('project is required')
  }
  return context
}

export default {
  around: {
    all: [schemaHooks.validateQuery(staticResourceTagQueryValidator)]
  },
  before: {
    all: [],
    find: [
      iff(
        isProvider('external'),
        iffElse(
          (ctx: HookContext) => checkScope('static_resource', 'read')(ctx),
          [],
          [
            verifyScope('editor', 'write'),
            iffElse(
              (ctx: HookContext) => !!ctx.params?.query?.project,
              [resolveProjectId(), verifyProjectPermission(['owner', 'editor'])],
              [resolveProjectsByPermission()]
            ) as any
          ]
        )
      ),
      enableClientPagination(),
      allowNullQuery('q', 'includeCount'),
      requireProjectForExternal,
      applyQueryTransform
    ]
  },
  after: {
    all: []
  },
  error: {
    all: []
  }
} as any
