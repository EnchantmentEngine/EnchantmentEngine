import { HookContext } from '@feathersjs/feathers'

import { Application } from '../../declarations'

/**
 * https://feathersjs.com/help/faq#my-queries-with-null-values-aren-t-working
 */
export default (...fieldNames: string[]) => {
  return async (context: HookContext<Application>) => {
    const query = context?.params?.query
    if (!query) return context

    for (const field of fieldNames) {
      if (query[field] === 'null') {
        query[field] = null
      }
    }

    return context
  }
}
