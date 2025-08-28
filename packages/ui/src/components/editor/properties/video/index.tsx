import {
  getComponent,
  getSimulationCounterpart,
  hasComponent,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { MediaComponent, MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineVideoCamera } from 'react-icons/hi2'

import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'
import {
  BackSide,
  ClampToEdgeWrapping,
  DoubleSide,
  FrontSide,
  MirroredRepeatWrapping,
  RepeatWrapping,
  Vector3
} from 'three'

import { TransformComponent } from '@ir-engine/spatial'
import { twMerge } from 'tailwind-merge'
import Checkbox from '../../../../primitives/tailwind/Checkbox'
import InputGroup from '../../input/Group'
import SegmentedControlInput from '../../input/SegmentedControl'
import SelectInput from '../../input/Select'
import Vector2Input from '../../input/Vector2'
import Slider from '../../Slider'
import { MediaInput, MediaMode } from '../media'

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.single
  },
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

const audioModeOptions = [
  { label: 'Positional', value: 'positional' },
  { label: 'Ambient', value: 'ambient' }
]

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Stretch', value: 'stretch' },
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' }
]

const projectionOptions = [
  { label: 'Flat', value: 'Flat' },
  { label: 'Equirectangular360', value: 'Equirectangular360' }
]

const wrappingOptions = [
  { label: 'Repeat', value: RepeatWrapping },
  { label: 'Clamp', value: ClampToEdgeWrapping },
  { label: 'Mirrored Repeat', value: MirroredRepeatWrapping }
]

/**
 * VideoNodeEditor used to render editor view for property customization.
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const simulationEntity = getSimulationCounterpart(props.entity)
  const video = useComponent(simulationEntity, VideoComponent)
  const mediaElement = useHasComponent(simulationEntity, MediaElementComponent)

  const resizeVideoToMatchAspectRatio = () => {
    const transformComponent = getComponent(props.entity, TransformComponent)
    const videoSize = video.currentVideoSize
    const videoRatio = videoSize.x / videoSize.y
    const scale = transformComponent.scale
    const newX = scale.y * videoRatio
    const newY = scale.y
    const newZ = 1
    const newScale = new Vector3(newX, newY, newZ)
    commitProperty(TransformComponent, 'scale')(newScale)
  }

  useEffect(() => {
    if (!hasComponent(props.entity, MediaComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, MediaComponent, true)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
      Icon={VideoNodeEditor.iconComponent}
    >
      <MediaInput
        mediaMode={MediaMode.video}
        entity={props.entity}
        mediaNodeId={video.mediaUUID}
        OnMediaSourceUpdate={commitProperty(VideoComponent, 'mediaUUID')}
        dropTypes={[...ItemTypes.Videos]}
      />

      <InputGroup name="Aspect Ratio" label={t('editor:properties.video.lbl-aspect-ratio')}>
        <button
          className={twMerge(
            'w-full flex-auto rounded-md  px-10 py-1 ',
            mediaElement ? ' bg-surface-1 text-text-primary' : 'bg-surface-2 text-text-inactive'
          )}
          onClick={resizeVideoToMatchAspectRatio}
          disabled={!mediaElement}
        >
          {t('editor:properties.video.lbl-match-aspect-ratio')}
        </button>
      </InputGroup>

      <InputGroup
        name="Video Fit"
        label={t('editor:properties.video.lbl-fit')}
        info={t('editor:properties.video.lbl-fit-info')}
      >
        <SelectInput value={video.fit} onChange={commitProperty(VideoComponent, 'fit')} options={fitOptions} />
      </InputGroup>

      <InputGroup name="Projection" label={t('editor:properties.video.lbl-projection')}>
        <SegmentedControlInput
          value={video.projection}
          onChange={commitProperty(VideoComponent, 'projection')}
          options={projectionOptions}
        />
      </InputGroup>

      <InputGroup
        name="Side"
        label={t('editor:properties.video.lbl-side')}
        info={t('editor:properties.video.lbl-side-info')}
      >
        <SegmentedControlInput
          value={video.side}
          onChange={commitProperty(VideoComponent, 'side')}
          options={[
            { label: 'Front', value: FrontSide },
            { label: 'Back', value: BackSide },
            { label: 'Double', value: DoubleSide }
          ]}
        />
      </InputGroup>

      <InputGroup
        name="UV Offset"
        label={t('editor:properties.video.lbl-uv-offset')}
        info={t('editor:properties.video.lbl-uv-offset-info')}
      >
        <Vector2Input
          value={video.uvOffset}
          onChange={updateProperty(VideoComponent, 'uvOffset')}
          onRelease={commitProperty(VideoComponent, 'uvOffset')}
          axisClassNames={['w-1/2', 'w-1/2']}
        />
      </InputGroup>

      <InputGroup
        name="UV Scale"
        label={t('editor:properties.video.lbl-uv-scale')}
        info={t('editor:properties.video.lbl-uv-scale-info')}
      >
        <Vector2Input
          value={video.uvScale}
          onChange={updateProperty(VideoComponent, 'uvScale')}
          onRelease={commitProperty(VideoComponent, 'uvScale')}
          axisClassNames={['w-1/2', 'w-1/2']}
        />
      </InputGroup>
      <InputGroup
        name="Wrap"
        label={t('editor:properties.video.lbl-wrap')}
        info={t('editor:properties.video.lbl-wrap-info')}
      >
        <div className="flex w-full">
          <div className="flex w-1/2">
            <SelectInput
              value={video.wrapS}
              onChange={commitProperty(VideoComponent, 'wrapS')}
              options={wrappingOptions}
            />
          </div>
          <div className="flex w-1/2">
            <SelectInput
              value={video.wrapT}
              onChange={commitProperty(VideoComponent, 'wrapT')}
              options={wrappingOptions}
            />
          </div>
        </div>
      </InputGroup>
      <InputGroup
        name="Use Alpha"
        label={t('editor:properties.video.lbl-use-alpha')}
        info={t('editor:properties.video.lbl-use-alpha-info')}
      >
        <Checkbox
          label={t('editor:properties.video.lbl-use-alphaEnable')}
          variantTextPlacement={'right'}
          checked={video.useAlpha}
          onChange={commitProperty(VideoComponent, 'useAlpha')}
        />

        {video.useAlpha && (
          <>
            <Checkbox
              label={t('editor:properties.video.lbl-use-alphaInvert')}
              variantTextPlacement={'right'}
              checked={video.useAlphaInvert}
              onChange={commitProperty(VideoComponent, 'useAlphaInvert')}
            />

            <Slider
              label={t('editor:properties.video.lbl-alpha-threshold')}
              min={0}
              max={1}
              step={0.01}
              value={video.alphaThreshold}
              onChange={updateProperty(VideoComponent, 'alphaThreshold')}
              onRelease={commitProperty(VideoComponent, 'alphaThreshold')}
              aria-label="alphaThreshold"
            />

            <InputGroup
              label={t('editor:properties.video.lbl-use-alpha-uv-transform')}
              info={t('editor:properties.video.lbl-use-alpha-uv-transform-info')}
            >
              <Vector2Input
                value={video.alphaUVOffset}
                onChange={updateProperty(VideoComponent, 'alphaUVOffset')}
                onRelease={commitProperty(VideoComponent, 'alphaUVOffset')}
                axisLabels={['U', 'V']}
                axisClassNames={['w-1/2', 'w-1/2']}
              />
            </InputGroup>
          </>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

VideoNodeEditor.iconComponent = HiOutlineVideoCamera

export default VideoNodeEditor
