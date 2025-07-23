import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlinePanTool } from 'react-icons/md'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  commitProperties,
  commitProperty,
  EditorComponentType,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { useCallbackQueryOptions } from '@ir-engine/engine/src/authoring/functions/useNodeOptions'
import {
  InteractableComponent,
  XRUIActivationType
} from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { Checkbox } from '@ir-engine/ui'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'

export const InteractableComponentNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const callbackQuery = useCallbackQueryOptions(props.entity)

  const interactableComponent = useComponent(props.entity, InteractableComponent)

  const updateLabel = (value: string) => {
    commitProperty(InteractableComponent, 'label')(value)
    //this might be useful later, but xrui is not updating properly
    // const msg = value ?? ''
    // modalState.interactMessage?.set(msg)
  }
  const addCallback = () => {
    const callbacks = [
      ...interactableComponent.callbacks.value,
      {
        target: 'Self',
        callbackID: ''
      }
    ]
    commitProperties(InteractableComponent, { callbacks: JSON.parse(JSON.stringify(callbacks)) }, [props.entity])
  }
  const removeCallback = (index: number) => {
    const callbacks = [...interactableComponent.callbacks.value]
    callbacks.splice(index, 1)
    commitProperties(InteractableComponent, { callbacks: JSON.parse(JSON.stringify(callbacks)) }, [props.entity])
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.interactable.name')}
      description={t('editor:properties.interactable.description')}
      Icon={InteractableComponentNodeEditor.iconComponent}
    >
      <InputGroup name="Label" label={t('editor:properties.interactable.lbl-label')}>
        <StringInput
          value={interactableComponent.label.value!}
          onChange={updateProperty(InteractableComponent, 'label')}
          onRelease={(value) => updateLabel(value)}
        />
      </InputGroup>

      <InputGroup name="activationType" label="Activation Type">
        <SelectInput
          key={props.entity}
          value={interactableComponent.uiActivationType.value}
          options={[
            { label: 'Hover', value: XRUIActivationType.hover },
            { label: 'Proximity', value: XRUIActivationType.proximity }
          ]}
          onChange={commitProperty(InteractableComponent, `uiActivationType`)}
        />
      </InputGroup>

      {interactableComponent.uiActivationType.value == XRUIActivationType.proximity && (
        <InputGroup
          name="ActivationDistance"
          label={t('editor:properties.interactable.lbl-UIactivationDistance')}
          info={t('editor:properties.interactable.info-UIactivationDistance')}
        >
          <NumericInput
            value={interactableComponent.activationDistance.value}
            onChange={updateProperty(InteractableComponent, 'activationDistance')}
            onRelease={commitProperty(InteractableComponent, 'activationDistance')}
          />
        </InputGroup>
      )}

      {interactableComponent.uiActivationType.value == XRUIActivationType.proximity && (
        <InputGroup
          name="ClickInteract"
          label={t('editor:properties.interactable.lbl-clickInteract')}
          info={t('editor:properties.interactable.info-clickInteract')}
        >
          <Checkbox
            checked={interactableComponent.clickInteract.value}
            onChange={commitProperty(InteractableComponent, 'clickInteract')}
          />
        </InputGroup>
      )}

      <Button className="self-end" onClick={addCallback}>
        {t('editor:properties.interactable.lbl-addcallback')}
      </Button>

      <div id={`callback-list`}>
        {interactableComponent.callbacks.map((callback, index) => {
          const targetOption = callbackQuery.find((o) => o.value === callback.target.value)
          const target = targetOption ? targetOption.value : 'Self'
          return (
            <div key={'callback' + index} className="space-y-2">
              <InputGroup name="Target" label={t('editor:properties.interactable.callbacks.lbl-target')}>
                <SelectInput
                  key={props.entity}
                  value={callback.target.value ?? 'Self'}
                  onChange={commitProperty(InteractableComponent, `callbacks.${index}.target` as any)}
                  options={callbackQuery.filter((o) => o.value !== undefined)}
                  disabled={props.multiEdit}
                />
              </InputGroup>

              <InputGroup name="CallbackID" label={t('editor:properties.interactable.callbacks.lbl-callbackID')}>
                {targetOption?.callbacks.length == 0 ? (
                  <StringInput
                    value={callback.callbackID.value!}
                    onChange={updateProperty(InteractableComponent, `callbacks.${index}.callbackID` as any)}
                    onRelease={commitProperty(InteractableComponent, `callbacks.${index}.callbackID` as any)}
                    disabled={props.multiEdit || !target}
                  />
                ) : (
                  <SelectInput
                    key={props.entity}
                    value={callback.callbackID.value!}
                    onChange={commitProperty(InteractableComponent, `callbacks.${index}.callbackID` as any)}
                    options={
                      targetOption?.callbacks
                        ? (targetOption.callbacks as Array<{
                            label: string
                            value: string
                          }>)
                        : []
                    }
                    disabled={props.multiEdit || !target}
                  />
                )}
              </InputGroup>

              <div className="flex justify-end">
                <Button onClick={() => removeCallback(index)}>
                  {t('editor:properties.interactable.lbl-removecallback')}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </NodeEditor>
  )
}

InteractableComponentNodeEditor.iconComponent = MdOutlinePanTool

export default InteractableComponentNodeEditor
