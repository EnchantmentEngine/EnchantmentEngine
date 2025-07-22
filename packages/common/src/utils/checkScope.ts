import { API } from '../API'
import { scopePath, ScopeTypeInterface, UserType } from '../schema.type.module'

export const checkScope = async (user: UserType, currentType: string, scopeToVerify: string) => {
  const scopes = (await API.instance.service(scopePath).find({
    query: {
      userId: user.id,
      paginate: false
    }
  })) as any as ScopeTypeInterface[]

  if (!scopes || scopes.length === 0) {
    return false
  }

  const currentScopes = scopes.reduce<string[]>((result, sc) => {
    if (sc.type.split(':')[0] === currentType) result.push(sc.type.split(':')[1])
    return result
  }, [])
  if (!currentScopes.includes(scopeToVerify)) {
    return false
  }
  return true
}
