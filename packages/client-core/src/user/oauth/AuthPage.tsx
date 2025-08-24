import React, { useEffect, useState } from 'react'

import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { config } from '@ir-engine/common/src/config'
import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import { Button } from '@ir-engine/ui'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { BsFillExclamationTriangleFill } from 'react-icons/bs'
import { useLocation } from 'react-router-dom'
import { AuthService, AuthState } from '../services/AuthService'

interface AuthPageProps {
  name: string
}

export default function AuthPage({ name }: AuthPageProps) {
  const { t } = useTranslation()
  const initialState = { error: '', token: '', email: '', promptForConnection: 'false', loginToken: '', loginId: '' }
  const [state, setState] = useState(initialState)
  const search = new URLSearchParams(useLocation().search)
  const showError = useHookstate(false)

  useEffect(() => {
    const error = search.get('error') as string
    const token = search.get('token') as string
    const type = search.get('type') as string
    const path = search.get('path') as string
    const promptForConnection = search.get('promptForConnection') as string
    const loginId = search.get('loginId') as string
    const loginToken = search.get('loginToken') as string
    const email = search.get('associateEmail') as string
    const instanceId = search.get('instanceId') as InstanceID

    if (!error) {
      if (type === 'connection') {
        const user = useHookstate(getMutableState(AuthState)).user
        AuthService.refreshConnections(user.id.value!)
      } else if (type === 'login') {
        let redirectSuccess = `${path}`
        if (instanceId != null) redirectSuccess += `?instanceId=${instanceId}`
        AuthService.loginUserByJwt(token, redirectSuccess || '/', '/')
      }
    }

    setState({ ...state, error, token, promptForConnection, email, loginToken, loginId })
  }, [])

  function redirectToRoot() {
    window.location.href = '/'
  }

  function doRedirect(connect = false) {
    const path = search.get('path') as string
    const loginId = search.get('loginId') as string
    const loginToken = search.get('loginToken') as string
    const instanceId = search.get('instanceId') as InstanceID
    let redirect
    if (/https:\/\//.test(path)) redirect = path
    else {
      redirect = config.client.clientUrl
      if (path != null) redirect += path
    }
    if (instanceId != null) redirect += `?instanceId=${instanceId}`
    window.location.href = `${
      config.client.serverUrl
    }/login/${loginId}?token=${loginToken}&redirectUrl=${redirect}&associate=${connect.toString()}`
  }

  return (
    <div className="pointer-events-auto flex h-full w-full items-center justify-center bg-[#080808] p-2">
      {state.error && state.error !== '' ? (
        <div className="grid w-full gap-y-3 rounded-xl bg-[#0E0F11] p-3 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <div className="flex flex-col items-center py-6 text-white">
            <div className="mb-8 h-14 w-14 rounded-full bg-[#191B1F]">
              <BsFillExclamationTriangleFill className="mx-auto my-3 h-6 w-6 text-white" />
            </div>

            <Text fontWeight="medium" fontSize="xl">
              {t('user:oauth.error', { name })}
            </Text>

            <Text className="py-2 text-center opacity-50" fontWeight="medium" fontSize="sm">
              {state.error}
            </Text>

            <Button className="mt-8 bg-[#375DAF]" onClick={redirectToRoot}>
              {t('user:oauth.redirectToRoot')}
            </Button>
          </div>
        </div>
      ) : state.promptForConnection === 'true' ? (
        <div className="grid w-full gap-y-3 rounded-xl bg-[#0E0F11] p-3 sm:w-2/3 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <div className="flex flex-col items-center py-6 text-white">
            <div className="mb-8 h-14 w-14 rounded-full bg-[#191B1F]">
              <BsFillExclamationTriangleFill className="mx-auto my-3 h-6 w-6 text-white" />
            </div>

            <Text fontWeight="medium" fontSize="xl">
              {t('user:oauth.promptForConnection')}
            </Text>

            <Text className="py-2 opacity-50" fontWeight="medium" fontSize="sm">
              {t('user:oauth.askConnection', { service: name, email: state.email })}
            </Text>

            <div className="flex">
              <Button onClick={() => doRedirect(true)}>{t('user:oauth.acceptConnection')}</Button>

              <Button onClick={() => doRedirect(false)}>{t('user:oauth.declineConnection')}</Button>
            </div>
          </div>
        </div>
      ) : (
        <LoadingView
          fullScreen
          title={t('common:loader.authenticating')}
          titleClassname="text-white"
          className="block h-12 w-12"
        />
      )}
    </div>
  )
}
