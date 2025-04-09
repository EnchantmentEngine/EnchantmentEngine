/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  ComponentJSONIDMap,
  getAllComponents,
  getComponent,
  hasComponent,
  Layers,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { HiMiniPuzzlePiece, HiMinus, HiPlus } from 'react-icons/hi2'

import { commitProperties, commitProperty, EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'

import { Entity, Static, useAncestorWithComponents, useChildrenWithComponents, UUIDComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import {
  BehaviorComponent,
  BehaviorSchema,
  CallbackConditionSchema,
  EffectSchema,
  EntityConditionSchema,
  StateConditionSchema
} from '@ir-engine/engine/src/scene/components/BehaviorComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getState, NO_PROXY, none, StateDefinitions, useHookstate } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import Checkbox from '../../../../primitives/tailwind/Checkbox'
import { OptionType } from '../../../../primitives/tailwind/Select'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'

/**
 * Use this function to infer the preset based on the entity's behaviors.
 */
const inferPreset = (entity: Entity) => {
  if (hasComponent(entity, BehaviorComponent)) {
    const behaviors = getComponent(entity, BehaviorComponent).behaviors
    if (
      behaviors.length === 2 &&
      behaviors[0].conditions.length === 1 &&
      'type' in behaviors[0].conditions &&
      behaviors[0].conditions.type === 'callback' &&
      behaviors[1].conditions.length === 1 &&
      'type' in behaviors[1].conditions &&
      behaviors[1].conditions.type === 'callback'
    ) {
      return 'trigger'
    } else if (
      behaviors.length === 1 &&
      behaviors[0].conditions.length === 1 &&
      'type' in behaviors[0].conditions &&
      behaviors[0].conditions.type === 'callback'
    ) {
      return 'callback'
    }
  }
  return 'none'
}

const presetOptions = [
  { label: 'Trigger', value: 'trigger' },
  { label: 'Callback', value: 'callback' },
  { label: 'None', value: 'none' }
]

const ConditionOptions = [
  { label: 'Larger Than', value: 'largerThan' },
  { label: 'Smaller Than', value: 'smallerThan' },
  { label: 'Equal', value: 'equal' },
  { label: 'Not Equal', value: 'notEqual' },
  { label: 'Contains', value: 'contains' },
  { label: 'Not Contains', value: 'notContains' }
]

/**
 * BehaviorNodeEditor used to render editor view for property customization.
 */
export const BehaviorNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const selectedPreset = useHookstate<'trigger' | 'callback' | 'none'>(inferPreset(props.entity))

  const onChangePreset = useCallback((value: 'trigger' | 'callback' | 'none') => {
    selectedPreset.set(value)
    const behaviors = [] as Static<typeof BehaviorSchema>[]
    if (value === 'trigger') {
      behaviors.push(
        {
          conditions: [{ type: 'callback', callback: '', nodeID: '' as NodeID, sourceNodeID: '' as NodeID }],
          effects: [],
          networked: true
        },
        {
          conditions: [{ type: 'callback', callback: '', nodeID: '' as NodeID, sourceNodeID: '' as NodeID }],
          effects: [],
          networked: true
        }
      )
    } else if (value === 'callback') {
      behaviors.push({
        conditions: [{ type: 'callback', callback: '', nodeID: '' as NodeID, sourceNodeID: '' as NodeID }],
        effects: [],
        networked: true
      })
    }
    if (!behaviors.length) return
    commitProperties(BehaviorComponent, { behaviors: structuredClone(behaviors) as Static<typeof BehaviorSchema>[] }, [
      props.entity
    ])
  }, [])

  const behavior = useComponent(props.entity, BehaviorComponent)

  const handleChange = useCallback((value: string, index: number, addRemove?: 'add' | 'remove') => {
    const behaviors = behavior.behaviors
    if (addRemove === 'add') {
      behaviors.merge([
        {
          conditions: [],
          effects: [],
          networked: true
        }
      ])
    } else if (addRemove === 'remove') {
      behaviors[index].set(none)
    }
    commitProperties(
      BehaviorComponent,
      { behaviors: structuredClone(behaviors.get(NO_PROXY)) as Static<typeof BehaviorSchema>[] },
      [props.entity]
    )
  }, [])

  const assetContextEntity = useAncestorWithComponents(props.entity, [GLTFComponent])
  const assetContextSource = GLTFComponent.useInstanceID(assetContextEntity)
  const sameSourceEntities = useChildrenWithComponents(assetContextEntity, [GLTFComponent])

  const sourceNodeIDOptions: OptionType[] = sameSourceEntities.map((entity) => ({
    label: getComponent(entity, NameComponent),
    // secondaryText: getComponent(entity, GLTFComponent).src,
    value: getComponent(entity, NodeIDComponent)
  }))
  sourceNodeIDOptions.unshift({ label: 'Self', value: '' })

  const CallbackConditionInput = ({
    behaviorIndex,
    condition,
    index
  }: {
    behaviorIndex: number
    condition: Static<typeof CallbackConditionSchema>
    index: number
  }) => {
    const sourceNodeEntity = condition.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, condition.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))

    const nodeID = condition.nodeID
    const nodeEntityUUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID)
    const nodeEntity = UUIDComponent.useEntityByUUID(nodeEntityUUID, Layers.Authoring)
    const callbackOptions =
      nodeEntity && hasComponent(nodeEntity, CallbackComponent)
        ? [...getComponent(nodeEntity, CallbackComponent).keys()].map((callback) => ({
            label: callback,
            value: callback
          }))
        : []

    return (
      <>
        <InputGroup
          name="Callback"
          label={t('editor:properties.behavior.lbl-callback')}
          info={t('editor:properties.behavior.lbl-callback-info')}
        >
          <SelectInput
            value={condition.sourceNodeID}
            onChange={commitProperty(
              BehaviorComponent,
              `behaviors.${behaviorIndex}.conditions.${index}.sourceNodeID` as any
            )}
            options={sourceNodeIDOptions}
          />
          <SelectInput
            value={condition.nodeID}
            onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.nodeID` as any)}
            options={nodeIDOptions}
          />
          <SelectInput
            value={condition.callback}
            onChange={commitProperty(
              BehaviorComponent,
              `behaviors.${behaviorIndex}.conditions.${index}.callback` as any
            )}
            options={callbackOptions}
          />
        </InputGroup>
      </>
    )
  }

  const EntityConditionInput = ({
    behaviorIndex,
    condition,
    index
  }: {
    behaviorIndex: number
    condition: Static<typeof EntityConditionSchema>
    index: number
  }) => {
    const sourceNodeEntity = condition.sourceNodeID
      ? UUIDComponent.getEntityByUUID(
          NodeIDComponent.getUUIDBySourceAndNodeID(assetContextSource, condition.sourceNodeID),
          Layers.Authoring
        )
      : assetContextEntity
    const sourceID = GLTFComponent.useInstanceID(sourceNodeEntity)
    const nodeIDOptions = SourceComponent.useEntitiesBySource(sourceID).map((entity) => ({
      label: getComponent(entity, NameComponent),
      value: getComponent(entity, NodeIDComponent)
    }))

    const selectedEntityUUID = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, condition.nodeID)
    const selectedEntity = UUIDComponent.useEntityByUUID(selectedEntityUUID, Layers.Authoring)

    const componentOptions = getAllComponents(selectedEntity)
      .filter((c) => !!c.jsonID)
      .map((component) => ({
        label: component.name,
        value: component.jsonID!
      }))

    const selectedComponent = ComponentJSONIDMap.get(condition.component)

    // just one level deep for now
    // @todo support nested properties
    const componentProperties = selectedComponent ? Object.keys(getComponent(selectedEntity, selectedComponent)) : []
    const propertyOptions = componentProperties.map((property) => ({
      label: property,
      value: property
    }))

    /**
     * @todo use the component schema to drive the acceptable values
     * - for now, just support strings
     */

    return (
      <InputGroup
        name="Entity"
        label={t('editor:properties.behavior.lbl-entity')}
        info={t('editor:properties.behavior.lbl-entity-info')}
      >
        <SelectInput
          labelProps={{ text: 'Source Node', position: 'left' }}
          value={condition.sourceNodeID}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.conditions.${index}.sourceNodeID` as any
          )}
          options={sourceNodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Node', position: 'left' }}
          value={condition.nodeID}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.nodeID` as any)}
          options={nodeIDOptions}
        />
        <SelectInput
          labelProps={{ text: 'Component', position: 'left' }}
          value={condition.component}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.conditions.${index}.component` as any
          )}
          options={componentOptions}
        />
        <SelectInput
          labelProps={{ text: 'Property', position: 'left' }}
          value={condition.property}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.property` as any)}
          options={propertyOptions}
        />
        <StringInput
          labelProps={{ text: 'Assertion Value', position: 'left' }}
          value={condition.value}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.value` as any)}
        />
        <SelectInput
          labelProps={{ text: 'Condition', position: 'left' }}
          value={condition.condition}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.conditions.${index}.condition` as any
          )}
          options={ConditionOptions}
        />
      </InputGroup>
    )
  }

  const StateConditionInput = ({
    behaviorIndex,
    condition,
    index
  }: {
    behaviorIndex: number
    condition: Static<typeof StateConditionSchema>
    index: number
  }) => {
    // ignore all event sourced states
    const stateList = Object.fromEntries([...StateDefinitions.entries()].filter(([key, val]) => !val.receptors))

    const stateOptions = Object.keys(stateList)
      .map((state) => ({
        label: state.includes('.') ? state.split('.').pop()! : state,
        value: state
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
    const selectedState = condition.state ? getState(stateList[condition.state]) : undefined
    const propertyOptions = selectedState
      ? Object.keys(selectedState).map((property) => ({
          label: property,
          value: property
        }))
      : []

    return (
      <InputGroup
        name="State"
        label={t('editor:properties.behavior.lbl-state')}
        info={t('editor:properties.behavior.lbl-state-info')}
      >
        <SelectInput
          labelProps={{ text: 'State', position: 'left' }}
          value={condition.state}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.state` as any)}
          options={stateOptions}
        />
        <SelectInput
          labelProps={{ text: 'Property', position: 'left' }}
          value={condition.property}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.property` as any)}
          options={propertyOptions}
        />
        <StringInput
          labelProps={{ text: 'Assertion Value', position: 'left' }}
          value={condition.value}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.conditions.${index}.value` as any)}
        />
        <SelectInput
          labelProps={{ text: 'Condition', position: 'left' }}
          value={condition.condition}
          onChange={commitProperty(
            BehaviorComponent,
            `behaviors.${behaviorIndex}.conditions.${index}.condition` as any
          )}
          options={ConditionOptions}
        />
      </InputGroup>
    )
  }

  const ConditionInput = ({
    index,
    condition,
    behaviorIndex
  }: {
    index: number
    condition: Static<typeof CallbackConditionSchema | typeof EntityConditionSchema | typeof StateConditionSchema>
    behaviorIndex: number
  }) => {
    return (
      <>
        <SelectInput
          value={condition.type}
          onChange={(val) =>
            commitProperties(BehaviorComponent, {
              [`behaviors.${behaviorIndex}.conditions.${index}` as any]:
                val === 'callback'
                  ? {
                      type: 'callback',
                      callback: '',
                      nodeID: '',
                      sourceNodeID: ''
                    }
                  : val === 'entity'
                  ? {
                      type: 'entity',
                      sourceNodeID: '',
                      nodeID: '',
                      component: '',
                      property: '',
                      value: '',
                      condition: 'equal'
                    }
                  : {
                      type: 'state',
                      state: '',
                      property: '',
                      value: '',
                      condition: 'equal'
                    }
            })
          }
          options={[
            { label: 'Callback', value: 'callback' },
            { label: 'State', value: 'state' },
            { label: 'Entity', value: 'entity' }
          ]}
        />
        {condition.type === 'callback' ? (
          <CallbackConditionInput behaviorIndex={behaviorIndex} index={index} condition={condition} />
        ) : condition.type === 'entity' ? (
          <EntityConditionInput behaviorIndex={behaviorIndex} index={index} condition={condition} />
        ) : (
          <StateConditionInput behaviorIndex={behaviorIndex} index={index} condition={condition} />
        )}
      </>
    )
  }

  const EffectInput = ({
    index,
    effect,
    behaviorIndex
  }: {
    index: number
    effect: Static<typeof EffectSchema>
    behaviorIndex: number
  }) => {
    const effectOptions = getAllComponents(props.entity)
      .filter((c) => !!c.jsonID)
      .map((component) => ({
        label: component.name,
        value: component.jsonID!
      }))

    return (
      <InputGroup
        name="Effect"
        label={t('editor:properties.behavior.lbl-effects')}
        info={t('editor:properties.behavior.lbl-effects-info')}
      >
        <SelectInput
          value={effect.component}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.component` as any)}
          options={effectOptions}
        />
        <StringInput
          value={effect.property}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.property` as any)}
        />
        <StringInput
          value={effect.value}
          onChange={commitProperty(BehaviorComponent, `behaviors.${behaviorIndex}.effects.${index}.value` as any)}
        />
      </InputGroup>
    )
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.behavior.name')}
      description={t('editor:properties.behavior.description')}
      Icon={BehaviorNodeEditor.iconComponent}
    >
      <InputGroup
        name="Preset"
        label={t('editor:properties.behavior.lbl-preset')}
        info={t('editor:properties.behavior.lbl-preset-info')}
      >
        <SelectInput value={selectedPreset.value} onChange={onChangePreset} options={presetOptions} />
      </InputGroup>
      {behavior.behaviors.value.map((behavior, index) => (
        <InputGroup
          key={index}
          name="Behavior"
          label={t('editor:properties.behavior.lbl-behaviors') + (index + 1)}
          info={t('editor:properties.behavior.lbl-behaviors-info')}
        >
          {/* conditions */}
          {behavior.conditions.map((condition, conditionIndex) => (
            <InputGroup
              key={conditionIndex}
              name="Condition"
              label={t('editor:properties.behavior.lbl-conditions') + (conditionIndex + 1)}
              info={t('editor:properties.behavior.lbl-conditions-info')}
            >
              <ConditionInput condition={condition} index={conditionIndex} behaviorIndex={index} />
            </InputGroup>
          ))}
          {/* effects */}
          {behavior.effects.map((effect, effectIndex) => (
            <InputGroup
              key={index}
              name="Effect"
              label={t('editor:properties.behavior.lbl-effects') + (index + 1)}
              info={t('editor:properties.behavior.lbl-effects-info')}
            >
              <EffectInput behaviorIndex={index} index={effectIndex} effect={effect as Static<typeof EffectSchema>} />
            </InputGroup>
          ))}
          {/* networked */}
          <Checkbox
            label={t('editor:properties.media.lbl-muteEditor')}
            variantTextPlacement={'right'}
            checked={behavior.networked}
            onChange={commitProperty(BehaviorComponent, `behaviors.${index}.networked` as any)}
          />
          <button
            className=" h-8 w-9 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
            onClick={() => handleChange('', index, 'remove')}
          >
            <HiMinus className="m-auto" />
          </button>
        </InputGroup>
      ))}
      <div className="my-1 flex w-full justify-end gap-1">
        <button
          className=" h-8 w-8 cursor-pointer rounded-md bg-surface-2 text-text-primary-button"
          onClick={() => handleChange('', 0, 'add')}
        >
          <HiPlus className="m-auto" />
        </button>
      </div>
    </NodeEditor>
  )
}

BehaviorNodeEditor.iconComponent = HiMiniPuzzlePiece

export default BehaviorNodeEditor
