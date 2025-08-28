import { Application, HookContext } from '../../declarations'

/**
 * A hook to make context.params.query joinable, such that if
 * a column is specified without table name, then table name will
 * be appended to it.
 */
export default (tableName: string) => {
  return async (context: HookContext<Application>) => {
    const allowedDollarProps = ['$and', '$or', '$select', '$sort']

    for (const queryItem in context.params.query) {
      if (queryItem.startsWith('$') && !allowedDollarProps.includes(queryItem)) {
        continue
      }

      // If property name already contains a dot, then it contains table name.
      if (queryItem.includes('.')) {
        return
      }

      if (allowedDollarProps.includes(queryItem)) {
        if (Array.isArray(context.params.query[queryItem])) {
          for (const index in context.params.query[queryItem]) {
            for (const subQueryItem in context.params.query[queryItem][index]) {
              context.params.query[queryItem][index][`${tableName}.${subQueryItem}`] =
                context.params.query[queryItem][index][subQueryItem]
              delete context.params.query[queryItem][index][subQueryItem]
            }
          }
        } else {
          for (const subQueryItem in context.params.query[queryItem]) {
            context.params.query[queryItem][`${tableName}.${subQueryItem}`] =
              context.params.query[queryItem][subQueryItem]
            delete context.params.query[queryItem][subQueryItem]
          }
        }
      } else {
        context.params.query[`${tableName}.${queryItem}`] = context.params.query[queryItem]
        delete context.params.query[queryItem]
      }
    }
  }
}
