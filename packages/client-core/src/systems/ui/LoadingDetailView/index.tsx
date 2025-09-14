import React from 'react'
import { useTranslation } from 'react-i18next'

import { hookstate, State } from '@ir-engine/hyperflux'
import { createXRUI } from '@ir-engine/spatial/src/xrui/createXRUI'
import { useXRUIState } from '@ir-engine/spatial/src/xrui/useXRUIState'

import ProgressBar from './SimpleProgressBar'
import LoadingDetailViewStyle from './style'

export function createLoaderDetailView() {
  const xrui = createXRUI(LoadingDetailView, hookstate({ progress: 0 }))
  return xrui
}

const LoadingDetailView = () => {
  const { t } = useTranslation()
  const state = useXRUIState() as State<{ progress: number }>

  const sceneLoaded = state.progress.value === 100
  const loadingDetails = sceneLoaded ? t('common:loader.loadingComplete') : t('common:loader.loadingObjects')

  return (
    <>
      <LoadingDetailViewStyle />
      <div id="loading-container" xr-layer="true">
        {/* <div id="thumbnail">
          <img xr-layer="true" xr-pixel-ratio="1" src={thumbnailUrl} crossOrigin="anonymous" />
        </div> */}
        <div id="loading-ui" xr-layer="true">
          <div id="loading-text" xr-layer="true" xr-pixel-ratio="3">
            {t('common:loader.loading')}
          </div>
          <div id="progress-text" xr-layer="true" xr-pixel-ratio="2" xr-prerasterized="0-9">
            {`${state.progress.value}%`}
          </div>
          <div id="progress-container" xr-layer="true" xr-scalable="true">
            <ProgressBar
              bgColor={'#ffffff'}
              completed={100}
              height="2px"
              baseBgColor="#000000"
              isLabelVisible={false}
            />
          </div>
          <div id="loading-details" xr-layer="true" xr-pixel-ratio="3">
            {loadingDetails}
          </div>
        </div>
      </div>
    </>
  )
}
