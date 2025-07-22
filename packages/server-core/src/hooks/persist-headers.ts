import { HookContext, NextFunction } from '@feathersjs/feathers'
import { AsyncLocalStorage } from 'async_hooks'

import { Application } from '../../declarations'

export const asyncLocalStorage = new AsyncLocalStorage<{ headers: object }>()

/**
 * https://github.com/feathersjs-ecosystem/dataloader/blob/main/docs/guide.md
 */
export default async (context: HookContext<Application>, next: NextFunction) => {
  const store = asyncLocalStorage.getStore()

  if (store && store.headers && !context.params.headers) {
    context.params.headers = store.headers
  } else {
    const headers = context.params.headers || {}
    asyncLocalStorage.enterWith({ headers })
  }

  return next()
}
