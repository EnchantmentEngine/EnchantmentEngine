import { Paginated, Params } from '@feathersjs/feathers'
import { ScopeTypeType, scopeTypePath } from '@ir-engine/common/src/schemas/scope/scope-type.schema'
import { ScopeType, scopePath } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { AvatarType, avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { UserApiKeyType, userApiKeyPath } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { InviteCode, UserName, UserType, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '@ir-engine/server-core/declarations'
import crypto from 'crypto'
import { random } from 'lodash-es'
import { v1 } from 'uuid'

/**
 * Method to get random avatar id
 * @param app
 * @returns
 */
const getAvatarId = async (app: Application) => {
  const avatars = (await app
    .service(avatarPath)
    .find({ isInternal: true, query: { isPublic: true, $limit: 10 } })) as Paginated<AvatarType>

  return avatars.data[random(avatars.data.length - 1)].id
}

/**
 * Method to get client params with user api key in headers
 * @param app
 * @returns
 */
export const getAuthParams = (userApiKey: UserApiKeyType) => {
  const params = {
    provider: 'rest',
    headers: {
      authorization: `Bearer ${userApiKey.token}`
    }
  } as Params

  return params
}

/**
 * Method to create user api key
 * @param app
 * @param user
 * @returns
 */
export const createUserApiKey = async (app: Application, user: UserType) => {
  const userApiKey = await app.service(userApiKeyPath).create({ userId: user.id })
  return userApiKey
}

/**
 * Method to create user
 * @param app
 * @returns
 */
export const createUser = async (app: Application) => {
  const code = crypto.randomBytes(4).toString('hex') as InviteCode

  const user = await app.service(userPath).create({
    name: `User ${v1()}` as UserName,
    inviteCode: code
  })

  return user
}

/**
 * Method to create an admin user with all scopes
 * @param app
 * @returns
 */
export const createAdmin = async (app: Application) => {
  const user = await createUser(app)
  const scopeType = (await app.service(scopeTypePath).find({
    paginate: false
  })) as any as ScopeTypeType[]

  await app.service(scopePath).create(
    scopeType.map((scope) => ({
      type: scope.type,
      userId: user.id
    }))
  )
  return user
}

/**
 * Method to create an admin user with all scopes
 * @param app
 * @param scope
 * @param user
 * @returns
 */
export const createUserScope = async (app: Application, scope: ScopeType, user: UserType) => {
  await app.service(scopePath).create({
    type: scope,
    userId: user.id
  })
}

/**
 * Method used to get user from id
 * @param app
 * @param userId
 * @returns
 */
export const getUser = async (app: Application, userId: string) => {
  const user = await app.service(userPath).get(userId)
  return user
}
