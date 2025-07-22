import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import multiLogger from '@ir-engine/common/src/logger'
import { Expand06Lg } from '@ir-engine/ui/src/icons'
import LocationIconButton from '../../user/components/LocationIconButton'
import { clientContextParams } from '../../util/ClientContextState'

const logger = multiLogger.child({ component: 'client-core:FullScreen', modifier: clientContextParams })

export const Fullscreen = () => {
  const { t } = useTranslation()
  const [fullScreenActive, setFullScreenActive] = useState(false)

  useEffect(() => {
    const onFullScreenChange = () => {
      if (document.fullscreenElement) {
        setFullScreenActive(true)
        logger.analytics({ event_name: 'view_fullscreen', event_value: true })
      } else {
        setFullScreenActive(false)
        logger.analytics({ event_name: 'view_fullscreen', event_value: false })
      }
    }

    document.addEventListener('fullscreenchange', onFullScreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange)
    }
  }, [])

  const setFullscreen = (input: boolean) => {
    if (input) document.body.requestFullscreen()
    else document.exitFullscreen()
  }

  return (
    <LocationIconButton
      tooltip={{
        title: fullScreenActive ? t('user:menu.exitFullScreen') : t('user:menu.enterFullScreen'),
        position: 'top'
      }}
      icon={Expand06Lg}
      data-testid={`${fullScreenActive ? 'exit' : 'enter'}-fullscreen-button`}
      onClick={() => setFullscreen(!fullScreenActive)}
    />
  )
}
