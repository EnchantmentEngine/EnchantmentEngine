import { HookContext } from '@feathersjs/feathers'

import { Application } from '../../declarations'

/**
 * This hook is useful to persist actual params.query as actualQuery.
 * There are scenarios where we want to remove properties from params.query,
 * to be passed to native knex call. Having params.actualQuery is useful if
 * we want to use actual query in after hook or around hook after next() call.
 */
export default async (context: HookContext<Application>) => {
  context.params.actualQuery = context.params.query ? JSON.parse(JSON.stringify(context.params.query)) : {}
}
