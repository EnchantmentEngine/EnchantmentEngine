import { Forbidden, NotAuthenticated, NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { scopePath, ScopeTypeInterface } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'

export default (currentType: string, scopeToVerify: string) => {
  return async (context: HookContext<Application>) => {
    if (context.params.isInternal) return context
    const loggedInUser = context.params.user as UserType
    if (!loggedInUser || !loggedInUser.id) throw new NotAuthenticated('No logged in user')
    const scopes = (await context.app.service(scopePath).find({
      query: {
        userId: loggedInUser.id
      },
      user: loggedInUser,
      paginate: false
    })) as ScopeTypeInterface[]
    if (!scopes || scopes.length === 0) throw new NotFound('No scope available for the current user.')

    const currentScopes = scopes.reduce<string[]>((result, sc) => {
      if (sc.type.split(':')[0] === currentType) result.push(sc.type.split(':')[1])
      return result
    }, [])
    if (!currentScopes.includes(scopeToVerify)) {
      if (scopeToVerify === 'admin') throw new Forbidden('Must be admin to perform this action')
      else throw new Forbidden(`Unauthorized ${scopeToVerify} action on ${currentType}`)
    }
    return context
  }
}
