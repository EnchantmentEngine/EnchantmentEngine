import { useDraggable } from '@ir-engine/client-core/src/hooks/useDraggable'
import { useMutableState } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { ProjectionType } from '@ir-engine/spatial/src/camera/types/ProjectionType'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { Grid3x3Sm, GridPerspectiveSm } from '@ir-engine/ui/src/icons'
import React from 'react'
import { useTranslation } from 'react-i18next'

function Placer({ id }: { id: string }) {
  return (
    <div id={id} className="z-[6] flex flex-col gap-0.5">
      <div className="h-0.5 w-6 bg-ui-outline" />
      <div className="h-0.5 w-6 bg-ui-outline" />
    </div>
  )
}

export default function SceneCameraTool() {
  const { t } = useTranslation()
  const cameraSettings = useMutableState(CameraSettingsState)

  useDraggable({
    targetId: 'scene-camera-tool',
    placerId: 'scene-camera-tool-placer',
    topOffset: 36,
    targetStartY: 60,
    targetStartX: 20,
    anchor: 'right'
  })

  const isOrtho = cameraSettings.projectionType.value === ProjectionType.Orthographic
  const tooltipText = isOrtho
    ? t('editor:toolbar.camera.orthographic', 'Orthographic Camera')
    : t('editor:toolbar.camera.perspective', 'Perspective Camera')

  const handleToggle = () => {
    cameraSettings.projectionType.set(isOrtho ? ProjectionType.Perspective : ProjectionType.Orthographic)
  }

  return (
    <div
      id="scene-camera-tool"
      className="absolute z-20 flex flex-col items-center rounded-lg bg-surface-0 px-1 pb-1 pt-2"
    >
      <Placer id="scene-camera-tool-placer" />
      <div className="mt-2 flex flex-col overflow-hidden rounded bg-surface-3">
        <Tooltip content={tooltipText} position="left">
          <ViewportButton onClick={handleToggle} selected={false} icon={isOrtho ? Grid3x3Sm : GridPerspectiveSm} />
        </Tooltip>
      </div>
    </div>
  )
}
