import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdPanTool } from 'react-icons/md'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { camelCaseToSpacedString } from '@ir-engine/common/src/utils/camelCaseToSpacedString'
import { EntityTreeComponent, getAncestorWithComponents, getChildrenWithComponents } from '@ir-engine/ecs'
import { getComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { useImmediateEffect } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { BodyTypes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'

const bodyTypeOptions = Object.entries(BodyTypes).map(([label, value]) => {
  return { label: camelCaseToSpacedString(label as string), value }
})

export const RigidBodyComponentEditor: EditorComponentType = (props) => {
  const { entity } = props
  const { t } = useTranslation()
  const rigidbodyComponent = useComponent(entity, RigidBodyComponent)
  const children = useOptionalComponent(entity, EntityTreeComponent)?.children

  const removeDuplicateRigidbody = () => {
    const rigidbodyAlreadyInHierarchy = !!(
      getAncestorWithComponents(entity, [RigidBodyComponent], true, false) ||
      getChildrenWithComponents(entity, [RigidBodyComponent]).length
    )

    if (rigidbodyAlreadyInHierarchy) {
      NotificationService.dispatchNotify(
        t('editor:properties.rigidbody.duplicateWarning', {
          entity: entity,
          name: getComponent(entity, NameComponent)
        }),
        { variant: 'warning' }
      )
      EditorControlFunctions.addOrRemoveComponent([entity], RigidBodyComponent, false)
    }
  }

  useImmediateEffect(() => {
    removeDuplicateRigidbody()
  }, [children])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.rigidbody.name')}
      description={t('editor:properties.rigidbody.description')}
      Icon={RigidBodyComponentEditor.iconComponent}
    >
      <InputGroup name="Type" label={t('editor:properties.rigidbody.lbl-type')}>
        <SelectInput
          options={bodyTypeOptions}
          value={rigidbodyComponent.type}
          onChange={commitProperty(RigidBodyComponent, 'type')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

RigidBodyComponentEditor.iconComponent = MdPanTool

export default RigidBodyComponentEditor
