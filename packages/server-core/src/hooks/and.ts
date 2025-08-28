import { Application, HookContext } from '../../declarations'
/**
 * @function and
 * @argument HookFunction
 * @description This operand hook will evaluate every hook function passed as argument,
 * if at least 1 hook result in false, will provide a falsy response
 *
 * If every single hook resulted in true, then will return true
 */
export default (...hooks: ((context: HookContext<Application>) => Promise<boolean> | boolean)[]) => {
  return async (context: HookContext<Application>) => {
    try {
      // Execute all hook arguments and consolidate evaluation
      return (await Promise.all(hooks.map((hook) => hook(context)))).reduce((acc, current) => acc && current, true)
    } catch (e) {
      return false
    }
  }
}
