/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// import * as polyfill from 'credential-handler-polyfill'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import commonStyles from '@ir-engine/client-core/src/common/components/common.module.scss'
import { useFind } from '@ir-engine/common'
import { validateEmail, validatePhoneNumber } from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import {
  ScopeType,
  UserName,
  authenticationSettingPath,
  clientSettingPath,
  identityProviderPath,
  scopePath,
  userApiKeyPath,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import {
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

import { API } from '@ir-engine/common'
import { USERNAME_MAX_LENGTH } from '@ir-engine/common/src/constants/UserConstants'
import { INVALID_USER_NAME_REGEX } from '@ir-engine/common/src/regex'
import { Input } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import {
  CheckLg,
  CogLg,
  Copy03Lg,
  Edit01Lg,
  HelpIconLg,
  LogIn01Lg,
  Refresh1Lg,
  ReportWebsiteDefaullg,
  Trash04Lg
} from '@ir-engine/ui/src/icons'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { initialAuthState, initialOAuthConnectedState } from '../../../../common/initialAuthState'
import { NotificationService } from '../../../../common/services/NotificationService'
import { PopoverState } from '../../../../common/services/PopoverState'
import { useZendesk } from '../../../../hooks/useZendesk'
import { clientContextParams } from '../../../../util/ClientContextState'
import { UserMenus } from '../../../UserUISystem'
import { useUserAvatarThumbnail } from '../../../functions/useUserAvatarThumbnail'
import { AuthService, AuthState } from '../../../services/AuthService'
import { AvatarService } from '../../../services/AvatarService'
import { PopupMenuServices } from '../PopupMenuService'

const logger = multiLogger.child({ component: 'engine:ecs:ProfileMenu', modifier: clientContextParams })
interface Props {
  className?: string
  hideLogin?: boolean
  isPopover?: boolean
  onClose?: () => void
}

export const TermsOfServiceState = defineState({
  name: 'ir.client.TermsOfServiceState',
  initial: {
    accepted: false
  },
  extension: syncStateWithLocalStorage(['accepted'])
})

const ProfileMenu = ({ hideLogin, onClose, isPopover }: Props): JSX.Element => {
  const { t } = useTranslation()
  const location = useLocation()

  const selfUser = useHookstate(getMutableState(AuthState).user)

  const username = useHookstate(selfUser?.name.value)
  const emailPhone = useHookstate('')
  const error = useHookstate(false)
  const errorUsername = useHookstate('')
  const showUserId = useHookstate(false)
  const showApiKey = useHookstate(false)
  const showDeleteAccount = useHookstate(false)
  const oauthConnectedState = useHookstate(Object.assign({}, initialOAuthConnectedState))
  const authState = useHookstate(initialAuthState)
  /** Login Link feature that was needed for multi cam mocap that is not currently necessary. Keeping code around for now if we return to it*/
  //const loginLink = useHookstate('')

  const authSetting = useFind(authenticationSettingPath).data.at(0)
  const clientSetting = useFind(clientSettingPath).data.at(0)
  const loading = useHookstate(getMutableState(AuthState).isProcessing)
  const userId = selfUser.id.value
  const apiKey = useFind(userApiKeyPath).data[0]
  const isGuest = selfUser.isGuest.value
  const acceptedTOS = useMutableState(TermsOfServiceState).accepted.value

  const checkedTOS = useHookstate(!isGuest || acceptedTOS)
  const checked13OrOver = useHookstate(!isGuest || acceptedTOS)
  const checked18OrOver = selfUser.ageVerified.value

  const originallyAgeVerified = useHookstate(checked18OrOver)
  const originallyAcceptedTOS = useHookstate(acceptedTOS).value

  useEffect(() => {
    console.log('acceptedTOS: ', acceptedTOS, apiKey)
  }, [acceptedTOS, apiKey])

  const submitAgeVerified = () => {
    if (!originallyAgeVerified.value && !checked18OrOver) {
      API.instance
        .service(userPath)
        .patch(userId, { ageVerified: true })
        .then(() => {
          selfUser.ageVerified.set(true)
          logger.info({
            event_name: 'accept_tos'
          })
        })
        .catch((e) => {
          console.error(e, 'Error updating user')
        })
    }
  }

  useEffect(() => {
    if (checked13OrOver.value && checkedTOS.value) {
      getMutableState(TermsOfServiceState).accepted.set(true)
    }
  }, [checked13OrOver, checkedTOS])

  const adminScopeQuery = useFind(scopePath, {
    query: {
      userId: selfUser.id.value,
      type: 'admin:admin' as ScopeType
    }
  })

  const hasAdminAccess = adminScopeQuery.data.length > 0
  const avatarThumbnail = useUserAvatarThumbnail(userId)

  const { initialized, openChat } = useZendesk()

  useEffect(() => {
    if (authSetting) {
      const temp = { ...initialAuthState }
      authSetting?.authStrategies?.forEach((el) => {
        Object.entries(el).forEach(([strategyName, strategy]) => {
          temp[strategyName] = strategy
        })
      })
      authState.set(temp)
    }
  }, [authSetting])

  let type = ''
  const addMoreSocial =
    (authState?.value?.apple && !oauthConnectedState.apple.value) ||
    (authState?.value?.discord && !oauthConnectedState.discord.value) ||
    (authState?.value?.facebook && !oauthConnectedState.facebook.value) ||
    (authState?.value?.github && !oauthConnectedState.github.value) ||
    (authState?.value?.google && !oauthConnectedState.google.value) ||
    (authState?.value?.linkedin && !oauthConnectedState.linkedin.value) ||
    (authState?.value?.twitter && !oauthConnectedState.twitter.value)

  const removeSocial = Object.values(oauthConnectedState.value).filter((value) => value).length >= 1

  // const loadCredentialHandler = async () => {
  //   try {
  //     const mediator = config.client.mediatorServer + `/mediator?origin=${encodeURIComponent(window.location.origin)}`

  //     await polyfill.loadOnce(mediator)
  //     console.log('Ready to work with credentials!')
  //   } catch (e) {
  //     logger.error(e, 'Error loading polyfill')
  //   }
  // }

  // useEffect(() => {
  //   loadCredentialHandler()
  // }, []) // Only run once

  useEffect(() => {
    selfUser && username.set(selfUser.name.value)
  }, [selfUser.name.value])

  useEffect(() => {
    if (!loading.value) logger.info({ event_name: 'view_profile' })
  }, [loading.value])

  const identityProvidersQuery = useFind(identityProviderPath)

  useEffect(() => {
    oauthConnectedState.set(Object.assign({}, initialOAuthConnectedState))
    for (const ip of identityProvidersQuery.data) {
      switch (ip.type) {
        case 'apple':
          oauthConnectedState.merge({ apple: true })
          break
        case 'discord':
          oauthConnectedState.merge({ discord: true })
          break
        case 'facebook':
          oauthConnectedState.merge({ facebook: true })
          break
        case 'linkedin':
          oauthConnectedState.merge({ linkedin: true })
          break
        case 'google':
          oauthConnectedState.merge({ google: true })
          break
        case 'twitter':
          oauthConnectedState.merge({ twitter: true })
          break
        case 'github':
          oauthConnectedState.merge({ github: true })
          break
      }
    }
  }, [identityProvidersQuery.data])

  const updateUserName = (e) => {
    e.preventDefault()
    handleUpdateUsername()
  }

  const handleUsernameChange = (e) => {
    const validInput = e.target.value.replace(INVALID_USER_NAME_REGEX, '')
    username.set(validInput)
    if (!e.target.value) errorUsername.set(t('user:usermenu.profile.usernameError'))
    else if (e.target.value.length > USERNAME_MAX_LENGTH)
      errorUsername.set(
        t('user:usermenu.profile.usernameLengthError', {
          maxCharacters: USERNAME_MAX_LENGTH
        })
      )
    else errorUsername.set('')
  }

  const handleUpdateUsername = () => {
    const name = username.value.trim() as UserName
    if (!name) return
    if (errorUsername.value.length > 0) return
    if (selfUser.name.value.trim() !== name) {
      // @ts-ignore
      AvatarService.updateUsername(userId, name).then(() =>
        logger.info({
          event_name: 'rename_user'
        })
      )
    }
  }
  const handleInputChange = (e) => emailPhone.set(e.target.value)

  const validate = () => {
    if (emailPhone.value === '') return false
    if (validateEmail(emailPhone.value.trim()) && authState?.value?.emailMagicLink) type = 'email'
    else if (validatePhoneNumber(emailPhone.value.trim()) && authState?.value?.smsMagicLink) type = 'sms'
    else {
      error.set(true)
      return false
    }

    error.set(false)
    return true
  }

  const handleGuestSubmit = (e: any): any => {
    e.preventDefault()
    if (!validate()) return

    // Get the url without query parameters.
    const redirectUrl = window.location.toString().replace(window.location.search, '')
    if (type === 'email')
      AuthService.createMagicLink(emailPhone.value, authState?.value, 'email', redirectUrl).then(() =>
        logger.info({
          event_name: 'connect_email',
          event_value: e.currentTarget.id
        })
      )
    else if (type === 'sms')
      AuthService.createMagicLink(emailPhone.value, authState?.value, 'sms', redirectUrl).then(() =>
        logger.info({
          event_name: 'connect_sms',
          event_value: e.currentTarget.id
        })
      )
    return
  }

  const handleOAuthServiceClick = (e) => {
    logger.info({
      event_name: 'connect_social_login',
      event_value: e.currentTarget.id
    })
    AuthService.loginUserByOAuth(e.currentTarget.id, location, true)
  }

  const handleRemoveOAuthServiceClick = (e) => {
    logger.info({
      event_name: 'disconnect_social_login',
      event_value: e.currentTarget.id
    })
    AuthService.removeUserOAuth(e.currentTarget.id)
  }

  const handleLogout = async () => {
    PopupMenuServices.showPopupMenu(UserMenus.Profile)
    if (onClose) onClose()
    showUserId.set(false)
    showApiKey.set(false)
    await AuthService.logoutUser()
    // window.location.reload()
    oauthConnectedState.set(Object.assign({}, initialOAuthConnectedState))
  }

  /**
   * Example function, issues a Verifiable Credential, and uses the Credential
   * Handler API (CHAPI) to request to store this VC in the user's wallet.
   *
   * This is here in the ProfileMenu just for convenience -- it can be invoked
   * by the client (browser) whenever appropriate (whenever a user performs
   * some in-engine action, makes a payment, etc).
   */
  async function handleIssueCredentialClick() {
    /** @todo temporarily disabled for vite upgrade #6453 */
    // const signedVp = await requestVcForEvent('EnteredVolumeEvent')
    // console.log('Issued VC:', JSON.stringify(signedVp, null, 2))
    // const webCredentialType = 'VerifiablePresentation'
    // // @ts-ignore
    // const webCredentialWrapper = new window.WebCredential(webCredentialType, signedVp, {
    //   recommendedHandlerOrigins: ['https://uniwallet.cloud']
    // })
    // // Use Credential Handler API to store
    // const result = await navigator.credentials.store(webCredentialWrapper)
    // console.log('Result of receiving via store() request:', result)
  }

  /**
   * Example function, requests a Verifiable Credential from the user's wallet.
   */
  async function handleRequestCredentialClick() {
    // const result = await navigator.credentials.get(vpRequestQuery)
    // console.log('VC Request query result:', result)
  }

  // async function handleWalletLoginClick() {
  //   const domain = window.location.origin
  //   const challenge = '99612b24-63d9-11ea-b99f-4f66f3e4f81a' // TODO: generate

  //   console.log('Sending DIDAuth query...')

  //   const didAuthQuery: any = {
  //     web: {
  //       VerifiablePresentation: {
  //         query: [
  //           {
  //             type: 'DIDAuth' // request the controller's DID
  //           },
  //           {
  //             type: 'QueryByExample',
  //             credentialQuery: [
  //               {
  //                 example: {
  //                   '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/xr/v1'],
  //                   // contains username and avatar icon
  //                   type: 'LoginDisplayCredential'
  //                 }
  //               },
  //               {
  //                 example: {
  //                   '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/xr/v1'],
  //                   // various Infinite Reality Engine user preferences
  //                   type: 'UserPreferencesCredential'
  //                 }
  //               }
  //             ]
  //           }
  //         ],
  //         challenge,
  //         domain // e.g.: requestingparty.example.com
  //       }
  //     }
  //   }

  //   // Use Credential Handler API to authenticate and receive basic login display credentials
  //   const vprResult: any = await navigator.credentials.get(didAuthQuery)
  //   console.log(vprResult)

  //   AuthService.loginUserByXRWallet(vprResult)
  // }

  const refreshApiKey = () => {
    AuthService.updateApiKey()
  }
  /** Feature that was needed for multi cam mocap that is not currently necessary*/
  /*   const createLoginLink = () => {
    AuthService.createLoginToken().then((token) => loginLink.set(`${config.client.serverUrl}/login/${token.token}`))
  } */

  const getConnectText = () => {
    if (authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.connectPhoneEmail')
    } else if (authState?.value?.emailMagicLink && !authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.connectEmail')
    } else if (!authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.connectPhone')
    } else {
      return ''
    }
  }

  const getErrorText = () => {
    if (authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.phoneEmailError')
    } else if (authState?.value?.emailMagicLink && !authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.emailError')
    } else if (!authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.phoneError')
    } else {
      return ''
    }
  }

  const getConnectPlaceholder = () => {
    if (authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.ph-phoneEmail')
    } else if (authState?.value?.emailMagicLink && !authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.ph-email')
    } else if (!authState?.value?.emailMagicLink && authState?.value?.smsMagicLink) {
      return t('user:usermenu.profile.ph-phone')
    } else {
      return ''
    }
  }

  const enableWalletLogin = false // authState?.didWallet

  const enableSocial =
    authState?.value?.apple ||
    authState?.value?.discord ||
    authState?.value?.facebook ||
    authState?.value?.github ||
    authState?.value?.google ||
    authState?.value?.linkedin ||
    authState?.value?.twitter

  const enableConnect = authState?.value?.emailMagicLink || authState?.value?.smsMagicLink

  return (
    <Modal
      onClose={PopoverState.hidePopupover}
      className="pointer-events-auto w-[50vw] min-w-[720px] max-w-2xl"
      hideFooter
    >
      <div className="grid w-full grid-cols-2 gap-x-2">
        <div className="grid grid-cols-3 gap-x-2">
          <div className="relative col-span-1 h-20 w-20">
            <AvatarImage size="fill" src={avatarThumbnail} />
            <button className="absolute -bottom-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#DDE1E5] p-2">
              <Edit01Lg className="place-items-center text-black" />
            </button>
          </div>

          <div className="col-span-2 grid grid-cols-1 gap-y-1">
            <Text fontSize="xl" fontWeight="semibold">
              {hasAdminAccess ? t('user:usermenu.profile.youAreAn') : t('user:usermenu.profile.youAreA')}
              <span className={commonStyles.bold}>{hasAdminAccess ? ' Admin' : isGuest ? ' Guest' : ' User'}</span>.
            </Text>

            {acceptedTOS && selfUser?.inviteCode.value && (
              <Text fontSize="sm">
                {t('user:usermenu.profile.inviteCode')}: {selfUser.inviteCode.value}
              </Text>
            )}

            {acceptedTOS && (
              <button className="w-fit" onClick={() => showUserId.set(!showUserId.value)}>
                <Text fontSize="sm">
                  {showUserId.value ? t('user:usermenu.profile.hideUserId') : t('user:usermenu.profile.showUserId')}
                </Text>
              </button>
            )}

            {acceptedTOS && apiKey?.id && (
              <button onClick={() => showApiKey.set(!showApiKey.value)} className="w-fit">
                <Text fontSize="sm">
                  {showApiKey.value ? t('user:usermenu.profile.hideApiKey') : t('user:usermenu.profile.showApiKey')}
                </Text>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-2">
          <button className="col-span-1 flex h-20 w-20 items-center justify-center rounded-full bg-[#616161] p-2">
            <CogLg className="h-10 w-10 text-white" />
          </button>

          <div className="col-span-2 grid grid-cols-1 gap-y-2">
            <button
              className="flex w-full items-center justify-center gap-x-2 rounded-md bg-[#616161] p-1"
              onClick={openChat}
            >
              <HelpIconLg />
              {t('user:usermenu.profile.helpChat')}
            </button>

            <button
              className="flex w-full items-center justify-center gap-x-2 rounded-md bg-[#C3324B] p-1"
              onClick={openChat}
            >
              <ReportWebsiteDefaullg />
              {t('user:usermenu.profile.reportWorld')}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid w-full grid-cols-1 gap-y-4">
        <Input
          value={username.value || ('' as UserName)}
          state={errorUsername.value ? 'error' : undefined}
          helperText={errorUsername.value}
          onChange={handleUsernameChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateUserName(e)
          }}
          labelProps={{
            text: t('user:usermenu.profile.lbl-username'),
            position: 'top'
          }}
          endComponent={
            <button className="h-4 w-4" onMouseDown={updateUserName}>
              <CheckLg />
            </button>
          }
          fullWidth
        />

        {showUserId.value && (
          <Input
            labelProps={{
              text: t('user:usermenu.profile.userIcon.userId'),
              position: 'top'
            }}
            value={userId}
            endComponent={
              <button
                className="h-4 w-4"
                onMouseDown={() => {
                  navigator.clipboard.writeText(userId)
                  NotificationService.dispatchNotify(t('user:usermenu.profile.userIdCopied'), {
                    variant: 'success'
                  })
                }}
              >
                <Copy03Lg />
              </button>
            }
            fullWidth
          />
        )}

        {showApiKey.value && (
          <Input
            labelProps={{
              text: t('user:usermenu.profile.apiKey'),
              position: 'top'
            }}
            value={apiKey?.token}
            startComponent={
              <button className="h-4 w-4" onMouseDown={refreshApiKey}>
                <Refresh1Lg />
              </button>
            }
            endComponent={
              <button
                className="h-4 w-4"
                onMouseDown={() => {
                  navigator.clipboard.writeText(apiKey?.token)
                  NotificationService.dispatchNotify(t('user:usermenu.profile.apiKeyCopied'), {
                    variant: 'success'
                  })
                }}
              >
                <Copy03Lg />
              </button>
            }
            fullWidth
          />
        )}
      </div>

      {!isGuest && (
        <div className="mt-5 grid w-1/2 grid-cols-1 gap-y-2 px-5">
          <button className="flex w-full items-center justify-start gap-x-2 p-2" onClick={handleLogout}>
            <LogIn01Lg />
            {t('user:usermenu.profile.logout')}
          </button>

          <button
            className="flex w-full items-center justify-start gap-x-2 p-2"
            onClick={() => {
              PopoverState.showPopupover(
                <ConfirmDialog
                  title={t('user:usermenu.profile.delete.finalDeleteConfirm')}
                  text={t('user:usermenu.profile.delete.finalDeleteText')}
                  onSubmit={async () => {
                    AuthService.removeUser(userId)
                    AuthService.logoutUser()
                    showDeleteAccount.set(false)
                  }}
                />
              )
            }}
          >
            <Trash04Lg />
            {t('user:usermenu.profile.delete.deleteAccount')}
          </button>
        </div>
      )}

      <hr className="mt-5 border-[#616161]" />
    </Modal>
  )
}

export default ProfileMenu
