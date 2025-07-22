import React from 'react'
import { useTranslation } from 'react-i18next'
import { BackSide, DoubleSide, FrontSide } from 'three'

import { ImageAlphaMode, ImageProjection } from '@ir-engine/engine/src/scene/classes/ImageUtils'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'

import { useComponent } from '@ir-engine/ecs'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { AssetExt, FileToAssetExt } from '@ir-engine/spatial/src/resources/AssetType'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'
import Slider from '../../../Slider'

const mapValue = (v) => ({ label: v, value: v })
const imageProjectionOptions = Object.values(ImageProjection).map(mapValue)
const imageTransparencyOptions = Object.values(ImageAlphaMode).map(mapValue)

const ImageProjectionSideOptions = [
  { label: 'Front', value: FrontSide },
  { label: 'Back', value: BackSide },
  { label: 'Both', value: DoubleSide }
]

const supportsTransparency = (src: string) => {
  const assetExt = FileToAssetExt(src)
  return assetExt === AssetExt.PNG || assetExt === AssetExt.KTX2
}

export const ImageSourceProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const imageComponent = useComponent(props.entity, ImageComponent)
  const showTransparencyOptions = supportsTransparency(imageComponent.source.value)

  return (
    <>
      {showTransparencyOptions && (
        <>
          <InputGroup name="Transparency" label={t('editor:properties.image.lbl-transparency')}>
            <SelectInput
              key={props.entity}
              options={imageTransparencyOptions}
              value={imageComponent.alphaMode.value}
              onChange={commitProperty(ImageComponent, 'alphaMode')}
            />
          </InputGroup>

          {imageComponent.alphaMode.value === ImageAlphaMode.Mask && (
            <Slider
              label={t('editor:properties.image.lbl-alphaCutoff')}
              //icon={<Icon type={audioState.masterVolume.value == 0 ? 'VolumeOff' : 'VolumeUp'} />}
              //label={t('user:usermenu.setting.lbl-volume')}
              max={1}
              min={0}
              step={0.01}
              value={imageComponent.alphaCutoff.value}
              onChange={updateProperty(ImageComponent, 'alphaCutoff')}
              onRelease={commitProperty(ImageComponent, 'alphaCutoff')}
            />
          )}
        </>
      )}

      <InputGroup name="Projection" label={t('editor:properties.image.lbl-projection')}>
        <SelectInput
          key={props.entity}
          options={imageProjectionOptions}
          value={imageComponent.projection.value}
          onChange={commitProperty(ImageComponent, 'projection')}
        />
      </InputGroup>
      <InputGroup name="Side" label={t('editor:properties.image.lbl-side')}>
        <SelectInput
          key={props.entity}
          options={ImageProjectionSideOptions}
          value={imageComponent.side.value}
          onChange={commitProperty(ImageComponent, 'side')}
        />
      </InputGroup>
    </>
  )
}

export default ImageSourceProperties
