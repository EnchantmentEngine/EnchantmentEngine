import { t } from 'i18next'
import React from 'react'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { HiOutlineCamera } from 'react-icons/hi'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'

export const CameraNodeEditor: EditorComponentType = (props) => {
  const component = useComponent(props.entity, CameraComponent)

  return (
    <NodeEditor
      name={t('editor:properties.cameraComponent.name')}
      description={t('editor:properties.cameraComponent.description')}
      Icon={CameraNodeEditor.iconComponent}
      {...props}
    >
      <InputGroup name="Fov" label={t('editor:properties.cameraComponent.lbl-fov')}>
        <NumericInput
          value={component.fov.value}
          onChange={updateProperty(CameraComponent, 'fov')}
          onRelease={commitProperty(CameraComponent, 'fov')}
        />
      </InputGroup>
      <InputGroup name="Aspect" label={t('editor:properties.cameraComponent.lbl-aspect')}>
        <NumericInput
          value={component.aspect.value}
          onChange={updateProperty(CameraComponent, 'aspect')}
          onRelease={commitProperty(CameraComponent, 'aspect')}
        />
      </InputGroup>
      <InputGroup name="Near" label={t('editor:properties.cameraComponent.lbl-near')}>
        <NumericInput
          value={component.aspect.value}
          onChange={updateProperty(CameraComponent, 'near')}
          onRelease={commitProperty(CameraComponent, 'near')}
        />
      </InputGroup>
      <InputGroup name="Far" label={t('editor:properties.cameraComponent.lbl-far')}>
        <NumericInput
          value={component.aspect.value}
          onChange={updateProperty(CameraComponent, 'far')}
          onRelease={commitProperty(CameraComponent, 'far')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

CameraNodeEditor.iconComponent = HiOutlineCamera

export default CameraNodeEditor
