import { HookContext } from '@feathersjs/feathers'

import { scopePath, ScopeTypeInterface } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'

export default (currentType: string, scopeToVerify: string) => {
  return async (context: HookContext<Application>) => {
    if (context.params.isInternal) return true
    const loggedInUser = context.params.user as UserType
    if (!loggedInUser || !loggedInUser.id) return false
    const scopes = (await context.app.service(scopePath).find({
      query: {
        userId: loggedInUser.id
      },
      paginate: false
    })) as ScopeTypeInterface[]
    if (!scopes || scopes.length === 0) return false

    const currentScopes = scopes.reduce<string[]>((result, sc) => {
      if (sc.type.split(':')[0] === currentType) result.push(sc.type.split(':')[1])
      return result
    }, [])
    return currentScopes.includes(scopeToVerify)
  }
}
