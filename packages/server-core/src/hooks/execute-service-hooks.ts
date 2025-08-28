import { Application, HookContext } from '../../declarations'

/**
 * A hook used to execute service hooks
 */
export default (hooks: any, servicePath?: string | string[]) => {
  return async (context: HookContext<Application>) => {
    if (servicePath) {
      servicePath = Array.isArray(servicePath) ? servicePath : [servicePath]
    }

    if (!servicePath || servicePath.includes(context.path)) {
      // First we need to call before hook so that
      for (const hook of hooks[context.type][context.method]) {
        context = await hook(context)
      }

      context.params.skipServiceHooks = true
    }
  }
}
