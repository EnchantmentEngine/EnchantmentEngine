import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { EngineState } from '@ir-engine/ecs'
import { EditorHelperState, PlacementMode, PlacementModeType } from '@ir-engine/editor/src/services/EditorHelperState'
import { getMutableState, useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { CubeOutlineLg, Cursor03Lg, GridDotsMd, RulerUnitsMd, SunMd } from '@ir-engine/ui/src/icons'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LuMousePointerClick, LuMove3D } from 'react-icons/lu'
import { VolumeVisibility } from '../../../functions/gizmos/studioIconGizmoHelper'

const volumeVisbilityDescriptions = {
  On: 'On : Show all volumes in scene',
  Auto: 'Auto : Show volumes on hover in scene',
  Off: 'Off : Hide all volumes in scene'
}

export default function SceneHelpersTool() {
  const { t } = useTranslation()
  const engineState = useMutableState(EngineState)
  const editorHelperState = useMutableState(EditorHelperState)
  const rendererState = useMutableState(RendererState)
  const [pointClickEnabled] = useFeatureFlags([FeatureFlags.Studio.UI.PointClick])

  useEffect(() => {
    if (engineState.isEditing.value) {
      rendererState.gridVisibility.set(editorHelperState.gridVisibility.value)
      rendererState.gridHeight.set(editorHelperState.gridHeight.value)
    } else {
      rendererState.gridVisibility.set(false)
    }
  }, [editorHelperState.gridVisibility, editorHelperState.gridHeight, engineState.isEditing])

  useEffect(() => {
    getMutableState(RendererState).nodeHelperVisibility.set(
      editorHelperState.volumeVisibility.value !== VolumeVisibility.Off
    )
  }, [editorHelperState.volumeVisibility])

  const onVolumeVisibilityClick = () => {
    switch (editorHelperState.volumeVisibility.value) {
      case VolumeVisibility.Off:
        editorHelperState.volumeVisibility.set(VolumeVisibility.Auto)
        break
      case VolumeVisibility.Auto:
        editorHelperState.volumeVisibility.set(VolumeVisibility.On)
        break
      case VolumeVisibility.On:
        editorHelperState.volumeVisibility.set(VolumeVisibility.Off)
        break
    }
  }

  const isVolumeVisibilityAuto = editorHelperState.volumeVisibility.value === VolumeVisibility.Auto
  const isVolumeVisibilityOn = editorHelperState.volumeVisibility.value === VolumeVisibility.On

  const onToggleGridVisible = () => {
    editorHelperState.gridVisibility.set(!editorHelperState.gridVisibility.value)
  }

  return (
    <div className="flex items-center gap-x-3">
      <Tooltip position={'auto'} content={t('editor:toolbar.helpersToggle.info-helpers')}>
        <Text className={'dark:text-[#A3A3A3]'} fontSize={'sm'}>
          {t('editor:toolbar.helpersToggle.lbl-helpers')}
        </Text>
      </Tooltip>
      {pointClickEnabled && (
        <>
          <Tooltip content={t('editor:toolbar.placement.click')} position="bottom">
            <ViewportButton
              lean={true}
              onClick={() => editorHelperState.placementMode.set(PlacementMode.CLICK as PlacementModeType)}
              selected={editorHelperState.placementMode.value === (PlacementMode.CLICK as PlacementModeType)}
              icon={LuMousePointerClick}
            />
          </Tooltip>
          <Tooltip content={t('editor:toolbar.placement.drag')} position="bottom">
            <ViewportButton
              lean={true}
              onClick={() => editorHelperState.placementMode.set(PlacementMode.DRAG as PlacementModeType)}
              selected={editorHelperState.placementMode.value === (PlacementMode.DRAG as PlacementModeType)}
              icon={LuMove3D}
            />
          </Tooltip>
        </>
      )}
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-nodeIcons')}
        content={t('editor:toolbar.helpersToggle.info-nodeHelpers')}
        position="bottom"
      >
        <ViewportButton
          lean={true}
          onClick={() => rendererState.nodeIconVisibility.set(!rendererState.nodeIconVisibility.value)}
          selected={rendererState.nodeIconVisibility.value}
          icon={SunMd}
        />
      </Tooltip>
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-nodeVolume')}
        content={volumeVisbilityDescriptions[editorHelperState.volumeVisibility.value]}
        position="bottom"
      >
        <div className="relative z-10 inline-grid">
          <ViewportButton
            lean={true}
            onClick={onVolumeVisibilityClick}
            selected={isVolumeVisibilityOn}
            icon={CubeOutlineLg}
          />
          {isVolumeVisibilityAuto && (
            <Cursor03Lg className="pointer-events-none absolute -bottom-[0.4em] -right-[0.25em] z-20 text-xs text-text-secondary" />
          )}
        </div>
      </Tooltip>
      <Tooltip content={t('editor:toolbar.grid.info-toggleGridVisibility')} position="bottom">
        <ViewportButton
          lean={true}
          onClick={onToggleGridVisible}
          icon={GridDotsMd}
          selected={editorHelperState.gridVisibility.value}
        />
      </Tooltip>
      <Tooltip
        title={t('editor:toolbar.helpersToggle.lbl-colliderHelpers')}
        content={t('editor:toolbar.helpersToggle.info-helpers')}
        position="bottom"
      >
        <ViewportButton
          lean={true}
          onClick={() => rendererState.physicsDebug.set(!rendererState.physicsDebug.value)}
          disabled={false}
          selected={rendererState.physicsDebug.value}
          icon={RulerUnitsMd}
        />
      </Tooltip>
      {/* <Tooltip content={t('editor:toolbar.helpersToggle.lbl-directManipulation')} position="bottom">
        <ViewportButton lean={true} onClick={() => {}} disabled={true} selected={false} icon={Edit01Md} />
      </Tooltip> */}
    </div>
  )
}
