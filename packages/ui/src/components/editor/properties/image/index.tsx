import React from 'react'
import { useTranslation } from 'react-i18next'

import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { getImageAspectRatio, ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'

import { getComponent, useComponent } from '@ir-engine/ecs'
import DroppableImageInput from '@ir-engine/editor/src/components/assets/DroppableImageInput'
import { commitProperty, EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { TransformComponent } from '@ir-engine/spatial'
import { LuImage } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'
import { Vector3 } from 'three'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import ImageSourceProperties from './sourceProperties'

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Stretch', value: 'stretch' },
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' }
]

export const ImageNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const imageComponent = useComponent(entity, ImageComponent)
  const errors = getEntityErrors(props.entity, ImageComponent)

  const resizeImageToMatchAspectRatio = () => {
    const imageRatio = getImageAspectRatio(props.entity) || 1

    const transformComponent = getComponent(props.entity, TransformComponent)
    const scale = transformComponent.scale
    const newX = scale.y * imageRatio!
    const newY = scale.y
    const newZ = 1
    const newScale = new Vector3(newX, newY, newZ)
    commitProperty(TransformComponent, 'scale')(newScale)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.image.name')}
      description={t('editor:properties.image.description')}
      Icon={ImageNodeEditor.iconComponent}
    >
      <InputGroup name="Image Url" label={t('editor:properties.image.lbl-imgURL')}>
        <DroppableImageInput src={imageComponent.source.value} onBlur={commitProperty(ImageComponent, 'source')} />
      </InputGroup>
      {errors ? (
        Object.entries(errors).map(([err, message]) => (
          <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
            {'Error: ' + err + '--' + message}
          </div>
        ))
      ) : (
        <></>
      )}
      {<ImageSourceProperties entity={props.entity} multiEdit={props.multiEdit} />}
      {/*<ScreenshareTargetNodeEditor entity={props.entity} multiEdit={props.multiEdit} />*/}

      <InputGroup
        name="Image Fit"
        label={t('editor:properties.image.lbl-fit')}
        info={t('editor:properties.image.lbl-fit-info')}
      >
        <SelectInput
          value={imageComponent.fit.value}
          onChange={commitProperty(ImageComponent, 'fit')}
          options={fitOptions}
        />
      </InputGroup>

      <InputGroup name="Aspect Ratio" label={t('editor:properties.image.lbl-aspect-ratio')}>
        <button
          className={twMerge(
            'w-full flex-auto rounded-md  px-10 py-1 ',
            imageComponent.source.value ? ' bg-surface-1 text-text-primary' : 'bg-surface-2 text-text-inactive'
          )}
          onClick={resizeImageToMatchAspectRatio}
          disabled={!imageComponent.source.value}
        >
          {t('editor:properties.image.lbl-match-aspect-ratio')}
        </button>
      </InputGroup>
    </NodeEditor>
  )
}

ImageNodeEditor.iconComponent = LuImage

export default ImageNodeEditor
