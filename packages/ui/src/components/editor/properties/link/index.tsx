import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PiLinkBreak } from 'react-icons/pi'

import { getComponent, hasComponent, useComponent, UUIDComponent } from '@ir-engine/ecs'
import { commitProperty, EditorComponentType, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import {
  InteractableComponent,
  XRUIActivationType
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { LinkComponent } from '@ir-engine/engine/src/scene/components/LinkComponent'
import { Checkbox } from '@ir-engine/ui'
import InputGroup from '../../input/Group'
import { ControlledStringInput } from '../../input/String'

/**
 * LinkNodeEditor component used to provide the editor view to customize link properties.
 */
export const LinkNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const linkComponent = useComponent(props.entity, LinkComponent)
  const errors = getEntityErrors(props.entity, LinkComponent)

  useEffect(() => {
    if (!hasComponent(props.entity, InteractableComponent)) {
      EditorControlFunctions.addOrRemoveComponent([props.entity], InteractableComponent, true, {
        label: LinkComponent.interactMessage,
        uiInteractable: false,
        clickInteract: true,
        uiActivationType: XRUIActivationType.hover,
        callbacks: [
          {
            callbackID: LinkComponent.linkCallbackName,
            target: getComponent(props.entity, UUIDComponent).entityID
          }
        ]
      })
    } else {
      // We should preserve the user's settings, such as uiActivationType
      const existingComponent = getComponent(props.entity, InteractableComponent)
      const hasLinkCallback = existingComponent.callbacks.some(
        (callback) => callback.callbackID === LinkComponent.linkCallbackName
      )

      EditorControlFunctions.modifyProperty([props.entity], InteractableComponent, {
        label: LinkComponent.interactMessage,
        uiInteractable: false,
        clickInteract: true,
        ...(hasLinkCallback
          ? {}
          : {
              callbacks: [
                ...existingComponent.callbacks,
                {
                  callbackID: LinkComponent.linkCallbackName,
                  target: getComponent(props.entity, UUIDComponent).entityID
                }
              ]
            })
      })
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.linkComp.title')}
      description={t('editor:properties.linkComp.description')}
      Icon={LinkNodeEditor.iconComponent}
    >
      {errors
        ? Object.entries(errors).map(([err, message]) => (
            <div key={err} style={{ marginTop: 2, color: '#FF8C00' }}>
              {'Error: ' + err + '--' + message}
            </div>
          ))
        : null}
      {/* <InputGroup name="Navigate Path" label={t('editor:properties.linkComp.lbl-navigateScene')}>
        <BooleanInput value={linkComponent.sceneNav} onChange={commitProperty(LinkComponent, 'sceneNav')} />
      </InputGroup>

      {linkComponent.sceneNav ? (
        <InputGroup name="Location" label={t('editor:properties.linkComp.lbl-locaiton')}>
          <ControlledStringInput
            value={linkComponent.location}
            onChange={updateProperty(LinkComponent, 'location')}
            onRelease={commitProperty(LinkComponent, 'location')}
          />
        </InputGroup>
      ) : (
        <InputGroup name="LinkUrl" label={t('editor:properties.linkComp.lbl-url')}>
          <ControlledStringInput
            value={linkComponent.url}
            onChange={updateProperty(LinkComponent, 'url')}
            onRelease={commitProperty(LinkComponent, 'url')}
          />
        </InputGroup>
      )} */}
      <InputGroup name="Redirect" label={t('editor:properties.linkComp.lbl-newTab')}>
        <Checkbox checked={linkComponent.newTab} onChange={commitProperty(LinkComponent, 'newTab')} />
      </InputGroup>
      <InputGroup name="LinkUrl" label={t('editor:properties.linkComp.lbl-url')}>
        <ControlledStringInput
          value={linkComponent.url}
          onChange={updateProperty(LinkComponent, 'url')}
          onRelease={commitProperty(LinkComponent, 'url')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

LinkNodeEditor.iconComponent = PiLinkBreak

export default LinkNodeEditor
