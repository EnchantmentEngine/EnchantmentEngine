import { HookContext } from '../../declarations'

/**
 * This hook is used to set a string value in the context.
 * If you want a value to be based on another value then use
 * following setField hook.
 * https://hooks-common.feathersjs.com/hooks.html#setfield
 */

export const ContextScope = {
  Query: 0,
  Data: 1,
  Root: 2
} as const

export type ContextScopeType = (typeof ContextScope)[keyof typeof ContextScope]

export default (propertyName: string, propertyValue: string, scope?: ContextScopeType) => {
  return (context: HookContext): HookContext => {
    if (scope === ContextScope.Data) {
      if (Array.isArray(context.data)) {
        context.data = context.data.map((item) => {
          return {
            ...item,
            [propertyName]: propertyValue
          }
        })
      } else {
        context.data = {
          ...context.data,
          [propertyName]: propertyValue
        }
      }
    } else if (scope === ContextScope.Root) {
      context[propertyName] = propertyValue
    } else {
      context.params.query = {
        ...context.params.query,
        [propertyName]: propertyValue
      }
    }
    return context
  }
}
