import React from 'react'

import multiLogger from '@ir-engine/common/src/logger'
import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import { Dropdown } from '@ir-engine/ui/viewer'
import { clientContextParams } from '../../util/ClientContextState'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import { Section } from './Section'
import SliderItem from './SliderItem'
import ToggleItem from './ToggleItem'

const logger = multiLogger.child({ component: 'system:settings-menu', modifier: clientContextParams })

// Define types for screen components
type ScreenProps = NavigateFuncProps & {}

const GraphicsSettings: React.FC<ScreenProps> = ({ navigateTo }) => {
  const { qualityLevel, usePostProcessing, useShadows, automatic, shadowMapResolution } = useMutableState(RendererState)

  const onQualityChange = (value: number) => {
    qualityLevel.set(value)
    logger.analytics({ event_name: 'set_quality_preset', event_value: value })
    automatic.set(false)
    logger.analytics({ event_name: 'automatic_qp', event_value: false })
  }
  const onPostProcessingToggle = () => {
    usePostProcessing.set(!usePostProcessing.value)
    logger.analytics({ event_name: 'post_processing', event_value: usePostProcessing.value })
    automatic.set(false)
    logger.analytics({ event_name: 'automatic_qp', event_value: false })
  }
  const onShadowToggle = () => {
    useShadows.set(!useShadows.value)
    logger.analytics({ event_name: 'shadows', event_value: useShadows.value })
    automatic.set(false)
    logger.analytics({ event_name: 'automatic_qp', event_value: false })
  }

  const onShadowMapResolutionChange = (event) => {
    shadowMapResolution.set(Number(event))
    logger.info({
      event_name: 'change_shadow_map_resolution',
      event_value: `${event}px`
    })
    automatic.set(false)
    logger.analytics({ event_name: 'automatic_qp', event_value: false })
  }

  return (
    <Inner className="space-y-4">
      <Section>
        <SliderItem
          label="Quality Preset"
          min={0}
          step={1}
          max={5}
          value={qualityLevel.value}
          defaultValue={qualityLevel.value}
          onChange={onQualityChange}
        />
        <Divider />
        <ToggleItem label="Post Processing" checked={usePostProcessing.value} onClick={onPostProcessingToggle} />
        <Divider />
        <ToggleItem label="Shadows" checked={useShadows.value} onClick={onShadowToggle} />
        <Divider />
        <Dropdown
          backgroundColor={`black`}
          onChange={onShadowMapResolutionChange}
          value={shadowMapResolution.value}
          options={[
            { label: '256px', value: 256 },
            { label: '512px', value: 512 },
            { label: '1024px', value: 1024 },
            { label: '2048px', value: 2048 },
            { label: '4096px (not recommended)', value: 4096 }
          ]}
        />
      </Section>
    </Inner>
  )
}

export default GraphicsSettings
