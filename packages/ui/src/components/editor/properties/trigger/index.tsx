import {
  EntityID,
  EntityTreeComponent,
  getAncestorWithComponents,
  getComponent,
  hasComponent,
  Layers,
  useAncestorWithComponents,
  useComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  commitProperties,
  commitProperty,
  EditorComponentType,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { TriggerCallbackComponent } from '@ir-engine/engine/src/scene/components/TriggerCallbackComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GiTriggerHurt } from 'react-icons/gi'
import { HiPlus, HiTrash } from 'react-icons/hi2'
import Button from '../../../../primitives/tailwind/Button'
import { OptionType } from '../../../../primitives/tailwind/Select'
import InputGroup from '../../input/Group'
import NodeInput from '../../input/Node'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'

type TargetOptionType = { label: string; value: string; callbacks: OptionType[] }

const TriggerProperties: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const targets = useHookstate<TargetOptionType[]>([{ label: '', value: '', callbacks: [] }])

  const triggerComponent = useComponent(props.entity, TriggerCallbackComponent)
  const hasRigidbody = useAncestorWithComponents(props.entity, [RigidBodyComponent])

  const callbackQuery = useQuery([CallbackComponent, NameComponent, EntityTreeComponent], Layers.Authoring)

  useEffect(() => {
    if (!hasComponent(props.entity, ColliderComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, ColliderComponent, true)
    }

    if (!getAncestorWithComponents(props.entity, [RigidBodyComponent])) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, RigidBodyComponent, true)
    }

    const options = [] as TargetOptionType[]
    for (const entity of callbackQuery) {
      const callbacks = getComponent(entity, CallbackComponent)
      options.push({
        label: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent).entityID,
        callbacks: Object.keys(callbacks).map((cb) => ({ label: cb, value: cb }))
      })
    }
    targets.set(options)
  }, [JSON.stringify(callbackQuery)])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.trigger.name')}
      description={t('editor:properties.trigger.description')}
      Icon={TriggerProperties.iconComponent}
    >
      <div className="my-3 flex justify-end">
        {!hasRigidbody && (
          <Button
            title={t('editor:properties.triggerVolume.lbl-addRigidBody')}
            className="text-text-primary"
            variant="tertiary"
            onClick={() => {
              const nodes = SelectionState.getSelectedEntities()
              EditorControlFunctions.addOrRemoveComponent(nodes, RigidBodyComponent, true, { type: 'fixed' })
            }}
          >
            <HiPlus />
            {t('editor:properties.triggerVolume.lbl-addRigidBody')}
          </Button>
        )}
      </div>
      <div className="my-3 flex justify-end">
        <Button
          title={t('editor:properties.triggerVolume.lbl-addTrigger')}
          className="text-text-primary"
          variant="tertiary"
          onClick={() => {
            const triggers = [
              ...triggerComponent.triggers,
              {
                target: '',
                onEnter: '',
                onExit: ''
              }
            ]
            commitProperties(TriggerCallbackComponent, { triggers: JSON.parse(JSON.stringify(triggers)) }, [
              props.entity
            ])
          }}
        >
          <HiPlus />
          {t('editor:properties.triggerVolume.lbl-addTrigger')}
        </Button>
      </div>
      {triggerComponent.triggers.map((trigger, index) => {
        const targetOption = targets.value.find((o) => o.value === trigger.target)
        const target = targetOption ? targetOption.value : ''
        return (
          <div className="ml-4 h-[calc(100%+1.5rem)] w-[calc(100%-2rem)] bg-[#1A1A1A] px-1 pb-1.5 pt-1">
            <button
              title={t('editor:properties.triggerVolume.lbl-removeTrigger')}
              className="ml-auto text-sm text-[#8B8B8D]"
              onClick={() => {
                const triggers = [...triggerComponent.triggers]
                triggers.splice(index, 1)
                commitProperties(TriggerCallbackComponent, { triggers: JSON.parse(JSON.stringify(triggers)) }, [
                  props.entity
                ])
              }}
            >
              <HiTrash />
            </button>
            <InputGroup
              name="Target"
              label={t('editor:properties.triggerVolume.lbl-target')}
              info={t('editor:properties.triggerVolume.info-target')}
            >
              <NodeInput
                value={trigger.target ?? ('' as EntityID)}
                onRelease={commitProperty(TriggerCallbackComponent, `triggers.${index}.target` as any)}
                disabled={props.multiEdit}
              />
            </InputGroup>
            <InputGroup
              name="On Enter"
              label={t('editor:properties.triggerVolume.lbl-onenter')}
              info={t(
                props.multiEdit || !target
                  ? 'editor:properties.triggerVolume.info-disabled-callback'
                  : 'editor:properties.triggerVolume.info-onenter'
              )}
            >
              {targetOption?.callbacks.length ? (
                <SelectInput
                  value={trigger.onEnter!}
                  onChange={commitProperty(TriggerCallbackComponent, `triggers.${index}.onEnter` as any)}
                  options={targetOption?.callbacks ? targetOption.callbacks.slice() : []}
                  disabled={props.multiEdit || !target}
                  showClearButton
                  width="full"
                />
              ) : (
                <StringInput
                  value={trigger.onEnter!}
                  onChange={updateProperty(TriggerCallbackComponent, `triggers.${index}.onEnter` as any)}
                  onRelease={commitProperty(TriggerCallbackComponent, `triggers.${index}.onEnter` as any)}
                  disabled={props.multiEdit || !target}
                  fullWidth
                />
              )}
            </InputGroup>

            <InputGroup
              name="On Exit"
              label={t('editor:properties.triggerVolume.lbl-onexit')}
              info={t(
                props.multiEdit || !target
                  ? 'editor:properties.triggerVolume.info-disabled-callback'
                  : 'editor:properties.triggerVolume.info-onexit'
              )}
            >
              {targetOption?.callbacks.length ? (
                <SelectInput
                  value={trigger.onExit!}
                  onChange={commitProperty(TriggerCallbackComponent, `triggers.${index}.onExit` as any)}
                  options={targetOption?.callbacks ? targetOption.callbacks.slice() : []}
                  disabled={props.multiEdit || !target}
                  showClearButton
                  width="full"
                />
              ) : (
                <StringInput
                  value={trigger.onExit!}
                  onRelease={updateProperty(TriggerCallbackComponent, `triggers.${index}.onExit` as any)}
                  onChange={commitProperty(TriggerCallbackComponent, `triggers.${index}.onExit` as any)}
                  disabled={props.multiEdit || !target}
                  fullWidth
                />
              )}
            </InputGroup>
          </div>
        )
      })}
    </NodeEditor>
  )
}

TriggerProperties.iconComponent = GiTriggerHurt
export default TriggerProperties
