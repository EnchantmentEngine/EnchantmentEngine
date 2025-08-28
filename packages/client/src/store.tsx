import React, { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { API as ClientAPI } from '@ir-engine/client-core/src/API'
import { BrowserRouter, history } from '@ir-engine/client-core/src/common/services/RouterService'
import waitForClientAuthenticated from '@ir-engine/client-core/src/util/wait-for-client-authenticated'
import { API } from '@ir-engine/common'
import { pipeLogs } from '@ir-engine/common/src/logger'
import { createHyperStore, getMutableState } from '@ir-engine/hyperflux'

import MetaTags from '@ir-engine/client-core/src/common/components/MetaTags'
import config from '@ir-engine/common/src/config'
import { isURL } from '@ir-engine/spatial/src/resources/AssetType'
import { DomainConfigState } from '@ir-engine/spatial/src/resources/DomainConfigState'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { initializei18n } from './util'

const authenticate = async () => {
  await waitForClientAuthenticated()
}

const initializeLogs = async () => {
  pipeLogs(API.instance)
}

//@ts-ignore
const publicDomain = import.meta.env.BASE_URL === '/client/' ? location.origin : import.meta.env.BASE_URL!.slice(0, -1) // remove trailing '/'
createHyperStore()
initializei18n()
ClientAPI.createAPI()

getMutableState(DomainConfigState).merge({
  publicDomain,
  cloudDomain: config.client.fileServer,
  proxyDomain: config.client.cors.proxyUrl
})

export default function ({ children }): JSX.Element {
  const { t } = useTranslation()
  const isLocation = window.location.pathname.includes('/location')

  useEffect(() => {
    authenticate().then(() => {
      initializeLogs()
    })

    const urlSearchParams = new URLSearchParams(window.location.search)
    const redirectUrl = urlSearchParams.get('redirectUrl')

    // The isUrl check below is to prevent xss. Ref: IR-7215
    if (redirectUrl && isURL(redirectUrl)) {
      history.push(redirectUrl)
    }
  }, [])

  return (
    <>
      <MetaTags>
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;800&display=swap"
          rel="stylesheet"
        />
      </MetaTags>
      <BrowserRouter history={history}>
        <Suspense
          fallback={
            !isLocation && (
              <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingClient')} />
            )
          }
        >
          {children}
        </Suspense>
      </BrowserRouter>
    </>
  )
}
