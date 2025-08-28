import AcceptInvite from '../user/accept-invite/accept-invite'
import Avatar from './avatar/avatar'
import DiscordBotAuth from './discord-bot-auth/discord-bot-auth'
import Email from './email/email'
import GenerateToken from './generate-token/generate-token'
import GithubRepoAccessRefresh from './github-repo-access-refresh/github-repo-access-refresh'
import GithubRepoAccessWebhook from './github-repo-access-webhook/github-repo-access-webhook'
import GithubRepoAccess from './github-repo-access/github-repo-access'
import IdentityProvider from './identity-provider/identity-provider'
import JwtPublicKey from './jwt-public-key/jwt-public-key'
import LoginToken from './login-token/login-token'
import Login from './login/login'
import MagicLink from './magic-link/magic-link'
import SMS from './sms/sms'
import UserApiKey from './user-api-key/user-api-key'
import UserAvatar from './user-avatar/user-avatar'
import UserKick from './user-kick/user-kick'
import UserLogin from './user-login/user-login'
import UserRelationshipType from './user-relationship-type/user-relationship-type'
import UserRelationship from './user-relationship/user-relationship'
import UserSettings from './user-setting/user-setting'
import User from './user/user'

export default [
  UserApiKey,
  User,
  UserAvatar,
  UserSettings,
  UserKick,
  UserLogin,
  IdentityProvider,
  UserRelationshipType,
  UserRelationship,
  AcceptInvite,
  Avatar,
  Login,
  LoginToken,
  MagicLink,
  Email,
  SMS,
  DiscordBotAuth,
  GithubRepoAccess,
  GithubRepoAccessRefresh,
  GithubRepoAccessWebhook,
  GenerateToken,
  JwtPublicKey
]
