import { NextFunction } from '@feathersjs/feathers'

import multiLogger from '@ir-engine/common/src/logger'

import type { HookContext } from '../../declarations'

const logger = multiLogger.child({ component: 'server-core:log-error' })

/**
 * A logger to log errors in hooks to server logger
 * Reference: https://github.com/feathersjs/feathers-chat/blob/dove/feathers-chat-ts/src/hooks/log-error.ts
 * @param context
 * @param next
 */
export const logError = async (context: HookContext, next: NextFunction) => {
  try {
    await next()
  } catch (error) {
    logger.error(
      `Error in ${context.path} service, ${context.type} hook, ${context.method} method. ${structuredClone(
        error
      )}, stacktrace: ${error.stack}`,
      error
    )

    throw error
  }
}
