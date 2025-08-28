import React from 'react'
import { useTranslation } from 'react-i18next'

import { useMutableState } from '@ir-engine/hyperflux'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

export const XRLoading = () => {
  const { t } = useTranslation()
  const xrState = useMutableState(XRState)
  return xrState.requestingSession.value ? (
    <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingXRSystems')} />
  ) : (
    <></>
  )
}
