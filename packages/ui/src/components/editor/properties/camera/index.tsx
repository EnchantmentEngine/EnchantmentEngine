import { t } from 'i18next'
import React from 'react'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { useHookstate } from '@ir-engine/hyperflux'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { ProjectionType } from '@ir-engine/spatial/src/camera/types/ProjectionType'
import { HiOutlineCamera } from 'react-icons/hi'
import { getMutableState } from '../../../../../../hyperflux/src/functions/StateFunctions'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'

export const CameraNodeEditor: EditorComponentType = (props) => {
  const component = useComponent(props.entity, CameraComponent)
  const cameraSettings = useHookstate(getMutableState(CameraSettingsState))

  return (
    <NodeEditor
      name={t('editor:properties.cameraComponent.name')}
      description={t('editor:properties.cameraComponent.description')}
      Icon={CameraNodeEditor.iconComponent}
      {...props}
    >
      {cameraSettings.projectionType.value === ProjectionType.Perspective && (
        <>
          <InputGroup name="Fov" label={t('editor:properties.cameraComponent.lbl-fov')}>
            <NumericInput
              value={(component as any).fov.value}
              onChange={updateProperty(CameraComponent, 'fov' as any)}
              onRelease={commitProperty(CameraComponent, 'fov' as any)}
            />
          </InputGroup>
          <InputGroup name="Aspect" label={t('editor:properties.cameraComponent.lbl-aspect')}>
            <NumericInput
              value={(component as any).aspect.value}
              onChange={updateProperty(CameraComponent, 'aspect' as any)}
              onRelease={commitProperty(CameraComponent, 'aspect' as any)}
            />
          </InputGroup>
        </>
      )}
      <InputGroup name="Near" label={t('editor:properties.cameraComponent.lbl-near')}>
        <NumericInput
          value={component.near.value}
          onChange={updateProperty(CameraComponent, 'near')}
          onRelease={commitProperty(CameraComponent, 'near')}
        />
      </InputGroup>
      <InputGroup name="Far" label={t('editor:properties.cameraComponent.lbl-far')}>
        <NumericInput
          value={component.far.value}
          onChange={updateProperty(CameraComponent, 'far')}
          onRelease={commitProperty(CameraComponent, 'far')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

CameraNodeEditor.iconComponent = HiOutlineCamera

export default CameraNodeEditor
