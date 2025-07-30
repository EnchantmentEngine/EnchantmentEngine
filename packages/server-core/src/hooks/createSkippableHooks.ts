import { iff } from 'feathers-hooks-common'

/**
 * This can create a skippable hook that will not be executed if `context.params.skipServiceHooks` is set to true.
 * @param hooks Service hook object
 * @param typesMethods If its undefined then the check will be performs for all hook types and methods, for string or array, it can be for hook type, service method type or a [Hook_Type].[Service_Method] notation
 */
export const createSkippableHooks = (hooks: any, typesMethods?: string | string[]) => {
  if (typesMethods) {
    typesMethods = Array.isArray(typesMethods) ? typesMethods : [typesMethods]
  }

  for (const hookType in hooks) {
    for (const serviceMethod in hooks[hookType]) {
      if (
        !typesMethods || // apply for all if nothing is specified in typesMethods
        typesMethods.includes(hookType) || // apply if hook type is specified in typesMethods
        typesMethods.includes(serviceMethod) || // apply if service method is specified in typesMethods
        typesMethods.includes(`${hookType}.${serviceMethod}`) // apply if `[Hook_Type].[Service_Method]` is specified in typesMethods
      ) {
        hooks[hookType][serviceMethod] = [
          iff((context) => context.params.skipServiceHooks !== true, ...hooks[hookType][serviceMethod])
        ]
      }
    }
  }

  return hooks
}
