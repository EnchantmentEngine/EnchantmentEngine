import { EngineState } from '@ir-engine/ecs'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { PauseSquareMd, PlayMd, ScreenshotMenuMd } from '@ir-engine/ui/src/icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { downloadScreenshot } from '../../../functions/takeScreenshot'

const ScenePlaybackTool: React.FC = () => {
  const { t } = useTranslation()

  const engineState = useHookstate(getMutableState(EngineState))

  const onTogglePlayMode = () => {
    engineState.isEditing.set(!engineState.isEditing.value)
  }

  return (
    <div id="preview" className="flex items-center gap-x-3">
      <Tooltip
        title={t('editor:toolbar.sceneScreenshot.lbl')}
        content={t('editor:toolbar.sceneScreenshot.info')}
        position="bottom"
      >
        <ViewportButton lean={true} onClick={downloadScreenshot} icon={ScreenshotMenuMd} />
      </Tooltip>
      <Tooltip
        title={
          engineState.isEditing.value
            ? t('editor:toolbar.command.lbl-playPreview')
            : t('editor:toolbar.command.lbl-stopPreview')
        }
        content={
          engineState.isEditing.value
            ? t('editor:toolbar.command.info-playPreview')
            : t('editor:toolbar.command.info-stopPreview')
        }
        position="bottom"
      >
        <ViewportButton
          lean={true}
          onClick={onTogglePlayMode}
          icon={engineState.isEditing.value ? PlayMd : PauseSquareMd}
        />
      </Tooltip>
    </div>
  )
}

export default ScenePlaybackTool
