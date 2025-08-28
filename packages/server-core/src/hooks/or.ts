import { Application, HookContext } from '../../declarations'
/**
 * @function or
 * @argument HookFunction
 * @description This operand hook will evaluate every hook function passed as argument,
 * if at least 1 hook result in true, will provide a truthy response
 *
 * If not a single hook resulted in true, then will return false
 */
export default (...hooks: ((context: HookContext<Application>) => Promise<boolean> | boolean)[]) => {
  return async (context: HookContext<Application>) => {
    try {
      // Execute all hook arguments and consolidate evaluation
      return (await Promise.all(hooks.map((hook) => hook(context)))).reduce(
        (acc, current) => (acc ? acc : current),
        false
      )
    } catch (e) {
      return false
    }
  }
}
