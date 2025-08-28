import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

/**
 * A method that disallows the use of id in request.
 */
export default async (context: HookContext) => {
  if (context.id) {
    throw new BadRequest(`Can only ${context.method} via query`)
  }
}
