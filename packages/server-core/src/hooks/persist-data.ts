import { HookContext } from '@feathersjs/feathers'

import { Application } from '../../declarations'

/**
 * This hook is useful to persist actual params.data as actualData.
 * There are scenarios where we want to remove properties from params.data,
 * to be passed to native knex call. Having params.actualData is useful if
 * we want to use actual data in after hook or around hook after next() call.
 */
export default async (context: HookContext<Application>) => {
  context.actualData = context.data ? JSON.parse(JSON.stringify(context.data)) : {}
}
