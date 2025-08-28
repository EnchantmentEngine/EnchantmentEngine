import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { DistanceModel, DistanceModelOptions } from '@ir-engine/engine/src/audio/constants/AudioConstants'
import { MediaSettingsComponent } from '@ir-engine/engine/src/scene/components/MediaSettingsComponent'
import { Checkbox } from '@ir-engine/ui'
import { Slider } from '@ir-engine/ui/editor'
import { MdPermMedia } from 'react-icons/md'
import ComponentDropdown from '../../../ComponentDropdown'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import SelectInput from '../../../input/Select'

export const MediaSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const mediaState = useComponent(props.entity, MediaSettingsComponent)

  return (
    <ComponentDropdown
      name={t('editor:properties.mediaSettings.name')}
      description={t('editor:properties.mediaSettings.description')}
      Icon={MediaSettingsEditor.iconComponent}
      entity={props.entity}
    >
      <InputGroup
        name="Media Distance Model"
        label={t('editor:properties.mediaSettings.lbl-mediaDistanceModel')}
        info={t('editor:properties.mediaSettings.info-mediaDistanceModel')}
      >
        <SelectInput
          options={DistanceModelOptions}
          value={mediaState.distanceModel}
          onChange={commitProperty(MediaSettingsComponent, 'distanceModel')}
        />
      </InputGroup>
      <InputGroup
        name="Use Immersive Media"
        label={t('editor:properties.mediaSettings.lbl-immersiveMedia')}
        info={t('editor:properties.mediaSettings.info-immersiveMedia')}
      >
        <Checkbox
          checked={mediaState.immersiveMedia}
          onChange={commitProperty(MediaSettingsComponent, 'immersiveMedia')}
        />
      </InputGroup>

      {mediaState.distanceModel === DistanceModel.Linear ? (
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={mediaState.rolloffFactor}
          onChange={updateProperty(MediaSettingsComponent, 'rolloffFactor')}
          onRelease={commitProperty(MediaSettingsComponent, 'rolloffFactor')}
          aria-label="Media Rolloff Factor"
          label={t('editor:properties.mediaSettings.lbl-mediaRolloffFactor')}
          description={t('editor:properties.mediaSettings.info-mediaRolloffFactor')}
        />
      ) : (
        <InputGroup
          name="Media Rolloff Factor"
          label={t('editor:properties.mediaSettings.lbl-mediaRolloffFactor')}
          info={t('editor:properties.mediaSettings.info-mediaRolloffFactorInfinity')}
        >
          <NumericInput
            min={0}
            smallStep={0.1}
            mediumStep={1}
            largeStep={10}
            value={mediaState.rolloffFactor}
            onChange={updateProperty(MediaSettingsComponent, 'rolloffFactor')}
            onRelease={commitProperty(MediaSettingsComponent, 'rolloffFactor')}
          />
        </InputGroup>
      )}
      <InputGroup
        name="Media Ref Distance"
        label={t('editor:properties.mediaSettings.lbl-mediaRefDistance')}
        info={t('editor:properties.mediaSettings.info-mediaRefDistance')}
      >
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={mediaState.refDistance}
          onChange={updateProperty(MediaSettingsComponent, 'refDistance')}
          onRelease={commitProperty(MediaSettingsComponent, 'refDistance')}
          unit="m"
        />
      </InputGroup>
      <InputGroup
        name="Media Max Distance"
        label={t('editor:properties.mediaSettings.lbl-mediaMaxDistance')}
        info={t('editor:properties.mediaSettings.info-mediaMaxDistance')}
      >
        <NumericInput
          min={0}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={mediaState.maxDistance}
          onChange={updateProperty(MediaSettingsComponent, 'maxDistance')}
          onRelease={commitProperty(MediaSettingsComponent, 'maxDistance')}
          unit="m"
        />
      </InputGroup>
      <InputGroup
        name="Media Cone Inner Angle"
        label={t('editor:properties.mediaSettings.lbl-mediaConeInnerAngle')}
        info={t('editor:properties.mediaSettings.info-mediaConeInnerAngle')}
      >
        <NumericInput
          min={0}
          max={360}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={mediaState.coneInnerAngle}
          onChange={updateProperty(MediaSettingsComponent, 'coneInnerAngle')}
          onRelease={commitProperty(MediaSettingsComponent, 'coneInnerAngle')}
          unit="°"
        />
      </InputGroup>
      <InputGroup
        name="Media Cone Outer Angle"
        label={t('editor:properties.mediaSettings.lbl-mediaConeOuterAngle')}
        info={t('editor:properties.mediaSettings.info-mediaConeOuterAngle')}
      >
        <NumericInput
          min={0}
          max={360}
          smallStep={0.1}
          mediumStep={1}
          largeStep={10}
          value={mediaState.coneOuterAngle}
          onChange={updateProperty(MediaSettingsComponent, 'coneOuterAngle')}
          onRelease={commitProperty(MediaSettingsComponent, 'coneOuterAngle')}
          unit="°"
        />
      </InputGroup>
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={mediaState.coneOuterGain}
        onChange={updateProperty(MediaSettingsComponent, 'coneOuterGain')}
        onRelease={commitProperty(MediaSettingsComponent, 'coneOuterGain')}
        aria-labelname="Media Cone Outer Gain"
        label={t('editor:properties.mediaSettings.lbl-mediaConeOuterGain')}
        description={t('editor:properties.mediaSettings.info-mediaConeOuterGain')}
      />
    </ComponentDropdown>
  )
}

MediaSettingsEditor.iconComponent = MdPermMedia
export default MediaSettingsEditor
