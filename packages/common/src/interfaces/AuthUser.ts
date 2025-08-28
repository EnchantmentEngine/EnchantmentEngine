import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schema.type.module'
import { UserID } from '@ir-engine/hyperflux'

export interface AuthUser {
  accessToken: string
  authentication: {
    strategy: string
  }
  identityProvider: IdentityProviderType
}

export const IdentityProviderSeed: IdentityProviderType = {
  id: '',
  token: '',
  accountIdentifier: '',
  oauthToken: '',
  oauthRefreshToken: '',
  type: 'guest',
  userId: '' as UserID,
  createdAt: '',
  updatedAt: ''
}

export const AuthUserSeed: AuthUser = {
  accessToken: '',
  authentication: {
    strategy: ''
  },
  identityProvider: IdentityProviderSeed
}

export function resolveAuthUser(res: any): AuthUser {
  return {
    accessToken: res.accessToken,
    authentication: res.authentication,
    identityProvider: res[identityProviderPath]
  }
}
