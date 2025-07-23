import React from 'react'
import { useTranslation } from 'react-i18next'

import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { RenderModes, RenderModesType } from '@ir-engine/spatial/src/renderer/constants/RenderModes'
import { Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import { GlobeWireframesMd, LitMd, NormalRenderMd, ShadowMd, UnlitMd } from '@ir-engine/ui/src/icons'
import { OptionType } from '@ir-engine/ui/src/primitives/tailwind/Select'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import ToolbarDropdown from './ToolbarDropdown'

const renderModes: OptionType[] = [
  {
    label: 'Unlit',
    Icon: UnlitMd as OptionType['Icon'],
    value: RenderModes.UNLIT
  },
  {
    label: 'Lit',
    Icon: LitMd as OptionType['Icon'],
    value: RenderModes.LIT
  },
  {
    label: 'Normals',
    Icon: NormalRenderMd as OptionType['Icon'],
    value: RenderModes.NORMALS
  },
  {
    label: 'Wireframe',
    Icon: GlobeWireframesMd as OptionType['Icon'],
    value: RenderModes.WIREFRAME
  }
]

const renderModeIcons = {
  [RenderModes.UNLIT]: UnlitMd,
  [RenderModes.LIT]: LitMd,
  [RenderModes.NORMALS]: NormalRenderMd,
  [RenderModes.WIREFRAME]: GlobeWireframesMd,
  [RenderModes.SHADOW]: ShadowMd
}

const RenderModeTool = () => {
  const { t } = useTranslation()

  const rendererState = useMutableState(RendererState)

  const dropdownValue =
    rendererState.renderMode.value === RenderModes.SHADOW ? RenderModes.LIT : rendererState.renderMode.value
  return (
    <div className="flex items-center gap-x-3">
      <Tooltip position={'right'} content={t('editor:toolbar.render-settings.info-renderMode')}>
        <Text className={'text-nowrap dark:text-[#A3A3A3]'} fontSize={'sm'}>
          {t('editor:toolbar.render-settings.lbl-renderMode')}
        </Text>
      </Tooltip>
      <ToolbarDropdown
        tooltipContent={t('editor:toolbar.render-settings.lbl-renderMode')}
        tooltipPosition="right"
        onChange={(value: RenderModesType) => rendererState.renderMode.set(value)}
        options={renderModes}
        value={dropdownValue}
        width="full"
        inputHeight="xs"
        dropdownParentClassName="w-[8rem]"
      />
      <Tooltip content={t('editor:toolbar.render-settings.lbl-shadows')} position="bottom">
        <ViewportButton
          lean={true}
          selected={rendererState.renderMode.value === RenderModes.SHADOW}
          onClick={() =>
            rendererState.renderMode.value === RenderModes.SHADOW
              ? rendererState.renderMode.set(RenderModes.LIT)
              : rendererState.renderMode.set(RenderModes.SHADOW)
          }
          icon={ShadowMd}
        />
      </Tooltip>
    </div>
  )
}

export default RenderModeTool
