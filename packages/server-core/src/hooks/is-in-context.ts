import { HookContext } from '../../declarations'

/**
 * This hook is used to check a value in the context.
 * If propertyValue is not provided then it will just
 * check if that property exists.
 * If searchIn is not provided then it will search for
 * it in the query.
 */
export default (propertyName: string, propertyValue?: any, searchIn?: 'query' | 'params' | 'data') => {
  return (context: HookContext): boolean => {
    if (searchIn === 'data') {
      if (Array.isArray(context.data)) {
        return context.data.find(
          (item) => item[propertyName] && (!propertyValue || item[propertyName] === propertyValue)
        )
      } else {
        return context.data[propertyName] && (!propertyValue || context.data[propertyName] === propertyValue)
      }
    } else if (searchIn === 'params') {
      return context.params[propertyName] && (!propertyValue || context.params[propertyName] === propertyValue)
    } else {
      return (
        context.params.query[propertyName] && (!propertyValue || context.params.query[propertyName] === propertyValue)
      )
    }
  }
}
