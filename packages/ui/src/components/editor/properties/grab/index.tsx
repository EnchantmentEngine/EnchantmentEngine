import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, hasComponent, UUIDComponent } from '@ir-engine/ecs'
import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { GrabbableComponent } from '@ir-engine/engine/src/grabbable/GrabbableComponent'
import { InteractableComponent } from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { GiGrab } from 'react-icons/gi'

export const grabbableInteractMessage = 'Grab'

export const GrabbableComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (!hasComponent(props.entity, InteractableComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: grabbableInteractMessage,
        callbacks: [
          {
            callbackID: GrabbableComponent.grabbableCallbackName,
            target: getComponent(props.entity, UUIDComponent).entityID
          }
        ]
      })
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.grabbable.name')}
      description={t('editor:properties.grabbable.description')}
      Icon={GrabbableComponentNodeEditor.iconComponent}
    >
      <div id={'grabbable-component'}></div>
    </NodeEditor>
  )
}

GrabbableComponentNodeEditor.iconComponent = GiGrab

export default GrabbableComponentNodeEditor
