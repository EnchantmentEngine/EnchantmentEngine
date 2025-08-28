import { HookContext } from '@feathersjs/feathers'

import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

// This will attach the owner ID in the contact while creating/updating list item
export default (propertyName: string) => {
  return (context: HookContext): HookContext => {
    // Getting logged in user and attaching owner of user
    if (!context.params.user) return context

    const loggedInUser = context.params.user as UserType
    if (Array.isArray(context.data)) {
      context.data = context.data.map((item) => {
        return {
          ...item,
          [propertyName]: loggedInUser.id
        }
      })
    } else {
      context.data = {
        ...context.data,
        [propertyName]: loggedInUser.id
      }
      context.params.body = {
        ...context.params.body,
        [propertyName]: loggedInUser.id
      }
    }

    return context
  }
}
