import { getSimulationCounterpart, useOptionalComponent } from '@ir-engine/ecs'
import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import { LightmapBakeComponent } from '@ir-engine/editor/src/lightmapper/LightmapBakeComponent'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Button, Checkbox } from '@ir-engine/ui'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MdLightbulb } from 'react-icons/md'

import { AtlasingFunctions, UVChannel, UVUnwrapperState } from '@ir-engine/editor/src/lightmapper/AtlasingFunctions'
import { Lightmapper } from '@ir-engine/editor/src/lightmapper/LightmapperFunctions'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'

const resolutionOptions = [
  { label: '256', value: 256 },
  { label: '512', value: 512 },
  { label: '1024', value: 1024 },
  { label: '2048', value: 2048 }
]

export const LightmapNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const resolutionState = useHookstate(1024)

  const uvChannelState = useHookstate('uv2' as UVChannel)

  const sampleState = useHookstate(1000)

  const bakeIndirectState = useHookstate(true)

  const bakeAOState = useHookstate(true)

  const unwrapperLoaded = useMutableState(UVUnwrapperState).isLoaded

  const isGeneratingAtlas = useHookstate(false)

  useEffect(() => {
    if (!unwrapperLoaded.value) {
      UVUnwrapperState.loadUnwrapper().then(() => unwrapperLoaded.set(true))
    }
  }, [])

  const simulationCounterpart = getSimulationCounterpart(props.entity)

  // Check if lightmap baking is in progress
  const lightmapBakeComponent = useOptionalComponent(simulationCounterpart, LightmapBakeComponent)
  const isLightmapBaking = !!lightmapBakeComponent?.value

  // Check if any operation is in progress
  const isOperationInProgress = isLightmapBaking || isGeneratingAtlas.value

  const handleGenerateAtlasClick = async () => {
    isGeneratingAtlas.set(true)
    await AtlasingFunctions.generateAtlas(
      AtlasingFunctions.getEntities(simulationCounterpart),
      props.entity,
      uvChannelState.value
    )
    isGeneratingAtlas.set(false)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.lightmap.name')}
      description={t('editor:properties.lightmap.description')}
      Icon={LightmapNodeEditor.iconComponent}
    >
      <InputGroup name="Resolution" label={t('editor:properties.lightmap.lbl-resolution')}>
        <SelectInput
          options={resolutionOptions}
          value={resolutionState.value}
          onChange={(value) => resolutionState.set(value as number)}
          disabled={isOperationInProgress}
        />
      </InputGroup>
      <InputGroup name="UV Channel" label={t('editor:properties.lightmap.lbl-uv-channel')}>
        <SelectInput
          options={[
            { label: 'UV0', value: 'uv' },
            { label: 'UV1', value: 'uv1' },
            { label: 'UV2', value: 'uv2' },
            { label: 'UV3', value: 'uv3' }
          ]}
          value={uvChannelState.value}
          onChange={(value) => uvChannelState.set(value as UVChannel)}
          disabled={isOperationInProgress}
        />
      </InputGroup>
      <InputGroup name="Samples" label={t('editor:properties.lightmap.lbl-samples')}>
        <NumericInput
          min={1}
          max={10000}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          value={sampleState.value}
          onChange={(value) => sampleState.set(value as number)}
          disabled={isOperationInProgress}
        />
      </InputGroup>
      <InputGroup name="Bake Indirect" label={t('editor:properties.lightmap.lbl-bake-indirect')}>
        <Checkbox
          checked={bakeIndirectState.value}
          onChange={(checked) => bakeIndirectState.set(checked)}
          disabled={isOperationInProgress}
          label={t('editor:properties.lightmap.desc-bake-indirect')}
        />
      </InputGroup>
      <InputGroup name="Bake AO" label={t('editor:properties.lightmap.lbl-bake-ao')}>
        <Checkbox
          checked={bakeAOState.value}
          onChange={(checked) => bakeAOState.set(checked)}
          disabled={isOperationInProgress}
          label={t('editor:properties.lightmap.desc-bake-ao')}
        />
      </InputGroup>

      <div className="flex w-full flex-col gap-y-2 py-1.5 pl-8 pr-3.5">
        {isOperationInProgress && <LoadingView spinnerOnly className="h-4 w-4 items-center" />}
        <Button
          onClick={handleGenerateAtlasClick}
          disabled={!unwrapperLoaded.value || isOperationInProgress}
          className="mb-2 flex w-full items-center"
        >
          {t('editor:properties.lightmap.btn-generateAtlas')}
        </Button>
        <Button
          onClick={() =>
            Lightmapper.handleBakeLightmap(
              simulationCounterpart,
              AtlasingFunctions.getEntities(simulationCounterpart),
              resolutionState.value,
              sampleState.value,
              uvChannelState.value === 'uv' ? 0 : Number(uvChannelState.value.replace('uv', '')),
              bakeIndirectState.value,
              bakeAOState.value
            )
          }
          disabled={!unwrapperLoaded.value || isOperationInProgress}
          className="mb-2 flex w-full items-center gap-2"
        >
          {t('editor:properties.lightmap.btn-bakeLightmap')}
        </Button>
      </div>
    </NodeEditor>
  )
}

LightmapNodeEditor.iconComponent = MdLightbulb

export default LightmapNodeEditor
