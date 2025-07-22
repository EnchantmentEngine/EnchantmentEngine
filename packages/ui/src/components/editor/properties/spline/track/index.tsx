import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { SplineTrackComponent } from '@ir-engine/engine/src/scene/components/SplineTrackComponent'
import { MdCameraswitch } from 'react-icons/md'

import { UUIDComponent } from '@ir-engine/ecs'
import { useQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SplineComponent } from '@ir-engine/engine/src/scene/components/SplineComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Checkbox } from '@ir-engine/ui'
import InputGroup from '../../../input/Group'
import NumericInput from '../../../input/Numeric'
import SelectInput from '../../../input/Select'
import { Vector3Scrubber } from '../../../input/Vector3'

/**
 * SplineTrackNodeEditor adds rotation editing to splines.
 *
 * @param       {Object} props
 * @constructor
 */

export const SplineTrackNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const component = useComponent(props.entity, SplineTrackComponent)
  const velocity = component.velocity
  const alpha = component.velocity

  const availableSplines = useQuery([SplineComponent]).map((entity) => {
    const name = getComponent(entity, NameComponent)
    const nodeID = getComponent(entity, UUIDComponent).entityID
    return {
      label: name,
      value: nodeID
    }
  })

  // @todo allow these to be passed in or remove this capability

  const setAlpha = (value) => {
    component.alpha.set(value)
  }

  return (
    <NodeEditor
      description={t('editor:properties.splinetrack.description')}
      Icon={SplineTrackNodeEditor.iconComponent}
      {...props}
    >
      <InputGroup name="Spline" label={t('editor:properties.splinetrack.lbl-spline')}>
        <SelectInput
          key={props.entity}
          options={availableSplines}
          value={component.splineEntityUUID.value!}
          onChange={commitProperty(SplineTrackComponent, 'splineEntityUUID') as any}
        />
      </InputGroup>
      <InputGroup name="Velocity" label={t('editor:properties.splinetrack.lbl-velocity')}>
        <NumericInput
          value={velocity.value}
          onChange={updateProperty(SplineTrackComponent, 'velocity')}
          onRelease={commitProperty(SplineTrackComponent, 'velocity')}
          prefix={
            <Vector3Scrubber
              value={velocity.value}
              onChange={updateProperty(SplineTrackComponent, 'velocity')}
              onRelease={commitProperty(SplineTrackComponent, 'velocity')}
            />
          }
        />
      </InputGroup>
      <InputGroup name="Enable Rotation" label={t('editor:properties.splinetrack.lbl-enableRotation')}>
        <Checkbox
          checked={component.enableRotation.value}
          onChange={commitProperty(SplineTrackComponent, 'enableRotation')}
        />
      </InputGroup>
      <InputGroup name="Lock XZ" label={t('editor:properties.splinetrack.lbl-lockXZ')}>
        <Checkbox
          checked={component.lockToXZPlane.value}
          onChange={commitProperty(SplineTrackComponent, 'lockToXZPlane')}
        />
      </InputGroup>
      <InputGroup name="Loop" label={t('editor:properties.splinetrack.lbl-loop')}>
        <Checkbox checked={component.loop.value} onChange={commitProperty(SplineTrackComponent, 'loop')} />
      </InputGroup>
    </NodeEditor>
  )
}

SplineTrackNodeEditor.iconComponent = MdCameraswitch

export default SplineTrackNodeEditor
