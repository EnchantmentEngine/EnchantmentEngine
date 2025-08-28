import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { HookContext } from '../../declarations'

// TODO: Make one hook by combine this with "set-loggedin-user-in-body"
// This will attach the loggedIn user id in the query property
export default (propertyName: string) => {
  return (context: HookContext): HookContext => {
    // Getting logged in user and attaching owner of user
    const loggedInUser = context.params.user as UserType
    context.params.query = {
      ...context.params.query,
      [propertyName]: loggedInUser?.id || null
    }
    return context
  }
}
