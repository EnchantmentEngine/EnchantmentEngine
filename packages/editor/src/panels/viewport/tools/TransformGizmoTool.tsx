import { useDraggable } from '@ir-engine/client-core/src/hooks/useDraggable'
import { setTransformMode } from '@ir-engine/editor/src/functions/transformFunctions'
import { useMutableState } from '@ir-engine/hyperflux'
import { TransformMode } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { Cursor03Default, MoveMd, Refresh1Md, Scale02Md, TransformMd } from '@ir-engine/ui/src/icons'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EditorHelperState } from '../../../services/EditorHelperState'
import { SelectionBoxState } from './SelectionBoxTool'

const GizmoTools = {
  ...TransformMode
}
type GizmoToolsType = (typeof GizmoTools)[keyof typeof GizmoTools]

function Placer({ id }: { id: string }) {
  return (
    <div id={id} className="z-[6] flex flex-col gap-0.5">
      <div className="h-0.5 w-6 bg-ui-outline" />
      <div className="h-0.5 w-6 bg-ui-outline" />
    </div>
  )
}

export default function TransformGizmoTool() {
  const { t } = useTranslation()

  const editorHelperState = useMutableState(EditorHelperState)
  const transformMode = editorHelperState.transformMode.value

  const selectionBoxEnabled = useMutableState(SelectionBoxState).selectionBoxEnabled
  const [toolSelected, setToolSelected] = useState<GizmoToolsType>(transformMode)

  useDraggable({
    targetId: 'gizmo-tool',
    placerId: 'gizmo-tool-placer',
    topOffset: 36,
    targetStartY: 56,
    targetStartX: 16
  })

  useEffect(() => {
    const mode = editorHelperState.transformMode.value
    setToolSelected(mode)
  }, [editorHelperState.transformMode])

  return (
    <div id="gizmo-tool" className={`absolute z-20 flex flex-col items-center rounded-lg bg-surface-0 px-1 pb-1 pt-2`}>
      <Placer id="gizmo-tool-placer" />
      <div className="mt-2 flex flex-col overflow-hidden rounded bg-surface-3">
        <Tooltip content={t('editor:toolbar.gizmo.pointer')} position="right">
          <ViewportButton
            onClick={() => {
              selectionBoxEnabled.set(false)
            }}
            selected={!selectionBoxEnabled.value}
            icon={Cursor03Default}
          />
        </Tooltip>
        <Tooltip content={t('editor:toolbar.gizmo.marquee')} position="right">
          <ViewportButton
            onClick={() => {
              selectionBoxEnabled.set(true)
            }}
            selected={selectionBoxEnabled.value}
            icon={TransformMd}
          />
        </Tooltip>
      </div>
      <div className="mt-2 flex flex-col overflow-hidden rounded bg-surface-3">
        <Tooltip content={t('editor:toolbar.gizmo.translate')} position="right">
          <ViewportButton
            onClick={() => {
              setTransformMode(TransformMode.translate)
              setToolSelected(GizmoTools.translate)
            }}
            selected={toolSelected === GizmoTools.translate}
            icon={MoveMd}
          />
        </Tooltip>
        <Tooltip content={t('editor:toolbar.gizmo.rotate')} position="right">
          <ViewportButton
            onClick={() => {
              setTransformMode(TransformMode.rotate)
              setToolSelected(GizmoTools.rotate)
            }}
            selected={toolSelected === GizmoTools.rotate}
            icon={Refresh1Md}
          />
        </Tooltip>
        <Tooltip content={t('editor:toolbar.gizmo.scale')} position="right">
          <ViewportButton
            onClick={() => {
              setTransformMode(TransformMode.scale)
              setToolSelected(GizmoTools.scale)
            }}
            selected={toolSelected === GizmoTools.scale}
            icon={Scale02Md}
          />
        </Tooltip>
      </div>
    </div>
  )
}
