import { HookContext } from '@feathersjs/feathers'

import { Application } from '../../declarations'

/**
 * https://github.com/feathersjs/feathers/issues/382#issuecomment-288125825
 */
export default () => {
  return async (context: HookContext<Application>) => {
    if (
      context.params.query &&
      (context.params.query.$paginate === 'false' || context.params.query.$paginate === false)
    ) {
      context.params.paginate = false
      delete context.params.query.$paginate
    } else if (
      context.params.query &&
      (context.params.query.paginate === 'false' || context.params.query.paginate === false)
    ) {
      context.params.paginate = false
      delete context.params.query.paginate
    }

    return context
  }
}
