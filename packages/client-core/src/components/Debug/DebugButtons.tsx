import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { respawnAvatar } from '@ir-engine/engine/src/avatar/functions/respawnAvatar'
import { getMutableState, useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { Button } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  MdAllOut,
  MdClose,
  MdFormatColorReset,
  MdGridOn,
  MdPerson,
  MdRefresh,
  MdSelectAll,
  MdSquareFoot
} from 'react-icons/md'
import { DebugState } from './index'

export default function DebugButtons() {
  const { t } = useTranslation()
  const rendererState = useMutableState(RendererState)
  const debugEnabled = useMutableState(DebugState).enabled

  const onClickRespawn = (): void => {
    respawnAvatar(AvatarComponent.getSelfAvatarEntity())
  }

  const toggleDebug = () => {
    rendererState.physicsDebug.set(!rendererState.physicsDebug.value)
  }

  const toggleAvatarDebug = () => {
    rendererState.avatarDebug.set(!rendererState.avatarDebug.value)
  }

  const toggleNodeHelpers = () => {
    getMutableState(RendererState).nodeHelperVisibility.set(!getMutableState(RendererState).nodeHelperVisibility.value)
  }

  const toggleGridHelper = () => {
    getMutableState(RendererState).gridVisibility.set(!getMutableState(RendererState).gridVisibility.value)
  }

  const onClickCloseDebug = () => {
    debugEnabled.set(false)
  }

  return (
    <div className="m-1 rounded bg-neutral-600 p-1">
      <Text className="text-text-primary-button">{t('common:debug.debugOptions')}</Text>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={rendererState.physicsDebug.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.physicsDebug')}
          onClick={toggleDebug}
        >
          <MdSquareFoot className="text-text-primary-button" />
        </Button>
        <Button
          size="sm"
          variant={rendererState.bvhDebug.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.bvhDebug')}
          onClick={() => rendererState.bvhDebug.set(!rendererState.bvhDebug.value)}
        >
          <MdAllOut className="text-text-primary-button" />
        </Button>
        <Button
          size="sm"
          variant={rendererState.avatarDebug.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.avatarDebug')}
          onClick={toggleAvatarDebug}
        >
          <MdPerson className="text-text-primary-button" />
        </Button>
        <Button
          size="sm"
          variant={rendererState.nodeHelperVisibility.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.nodeHelperDebug')}
          onClick={toggleNodeHelpers}
        >
          <MdSelectAll className="text-text-primary-button" />
        </Button>
        <Button
          size="sm"
          variant={rendererState.gridVisibility.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.gridDebug')}
          onClick={toggleGridHelper}
        >
          <MdGridOn className="text-text-primary-button" />
        </Button>
        <Button
          size="sm"
          variant={rendererState.forceBasicMaterials.value ? 'secondary' : 'tertiary'}
          title={t('common:debug.forceBasicMaterials')}
          onClick={() => rendererState.forceBasicMaterials.set(!rendererState.forceBasicMaterials.value)}
        >
          <MdFormatColorReset className="text-text-primary-button" />
        </Button>
        <Button size="sm" variant="tertiary" title={t('common:debug.respawn')} onClick={onClickRespawn}>
          <MdRefresh className="text-text-primary-button" />
        </Button>
        <Button size="sm" variant="tertiary" title={t('common:debug.close')} onClick={onClickCloseDebug}>
          <MdClose className="text-text-primary-button" />
        </Button>
      </div>
    </div>
  )
}
