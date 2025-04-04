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
  ComponentMap,
  Entity,
  EntityUUID,
  S,
  Static,
  UUIDComponent,
  defineComponent,
  deserializeComponent,
  getComponent,
  matchesEntityUUID,
  removeComponent,
  removeEntity,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import {
  NO_PROXY,
  StateDefinitions,
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getNestedObject,
  getState,
  matches,
  useImmediateEffect,
  useMutableState
} from '@ir-engine/hyperflux'
import { NetworkTopics } from '@ir-engine/network'
import React, { useEffect } from 'react'
import { NodeIDComponent, NodeIDSchema } from '../../gltf/NodeIDComponent'
import { SourceComponent } from './SourceComponent'

export const ObservableActions = {
  called: defineAction({
    type: 'ir.engine.observable.CALLED' as const,
    entityUUID: matchesEntityUUID,
    indices: matches.arrayOf(matches.number)
  })
}

type ObservableCalled = {
  entityUUID: EntityUUID
  indices: number[]
}

export const ObservableState = defineState({
  name: 'ir.engine.ObservableState',
  initial: [] as Array<ObservableCalled>,

  receptors: {
    onCalled: ObservableActions.called.receive((action) => {
      const state = getMutableState(ObservableState)
      state.merge([
        {
          entityUUID: action.entityUUID,
          indices: action.indices
        }
      ])
    })
  },
  reactor: () => {
    const calls = useMutableState(ObservableState).get(NO_PROXY)
    return calls.map((item: ObservableCalled, i) => <ObservableCalledReactor key={i} item={item} />)
  }
})

const ObservableCalledReactor = (props: { item: { entityUUID: EntityUUID; indices: number[] } }) => {
  const { item } = props

  useImmediateEffect(() => {
    const entity = UUIDComponent.getEntityByUUID(item.entityUUID)
    for (const index of item.indices) {
      const observer = getComponent(entity, ObservableComponent).observers[index]
      if (!observer) continue
      for (const effect of observer.effects) {
        // setComponent
        if ('nodeID' in effect && 'jsonID' in effect && 'values' in effect) {
          const componentDefinition = ComponentMap.get(effect.jsonID)
          if (!componentDefinition) continue
          const targetEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(getComponent(entity, SourceComponent), effect.nodeID)
          )
          deserializeComponent(targetEntity, componentDefinition, effect.values)
        }
        // removeComponent
        else if ('nodeID' in effect && 'jsonID' in effect) {
          const componentDefinition = ComponentMap.get(effect.jsonID)
          if (!componentDefinition) continue
          const targetEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(getComponent(entity, SourceComponent), effect.nodeID)
          )
          removeComponent(targetEntity, componentDefinition)
        }
        // createEntity
        else if ('nodeID' in effect && 'parentID' in effect && 'components' in effect) {
          const parentEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(getComponent(entity, SourceComponent), effect.parentID)
          )
          const newEntity = NodeIDComponent.create(getComponent(parentEntity, SourceComponent), effect.nodeID)
          for (const components of effect.components) {
            for (const [jsonID, values] of Object.entries(components)) {
              const componentDefinition = ComponentJSONIDMap.get(jsonID)
              if (!componentDefinition) continue
              deserializeComponent(newEntity, componentDefinition, values)
            }
          }
        }
        // removeEntity
        else if ('nodeID' in effect) {
          const targetEntity = UUIDComponent.getEntityByUUID(
            NodeIDComponent.getUUIDBySourceAndNodeID(getComponent(entity, SourceComponent), effect.nodeID)
          )
          removeEntity(targetEntity)
        }
        // callback
        // else if ('callback' in effect) {
        //   const targetEntity = UUIDComponent.getEntityByUUID(
        //     NodeIDComponent.getUUIDBySourceAndNodeID(getComponent(entity, SourceComponent), effect.target)
        //   )
        //   const callback = getCallback(targetEntity, effect.callback)
        //   if (!callback) continue
        //   const parameters = effect.parameters.map((parameter) => {
        //     if (typeof parameter === 'string') {
        //       return parameter
        //     } else if (typeof parameter === 'number') {
        //       return parameter
        //     } else if (typeof parameter === 'boolean') {
        //       return parameter
        //     }
        //   })
        //   callback(...parameters)
        // }
      }
    }
  }, [])

  return null
}

export const ConditionSchema = S.LiteralUnion([
  'largerThan',
  'smallerThan',
  'equal',
  'notEqual',
  'contains',
  'notContains'
])

export const EntityConditionSchema = S.Object({
  nodeID: NodeIDSchema(),
  component: S.String(),
  property: S.String(),
  value: S.Any(),
  condition: ConditionSchema
})

export const StateConditionSchema = S.Object({
  state: S.String(),
  property: S.Any(),
  value: S.Any(),
  condition: ConditionSchema
})

export const PrimitiveSchema = S.Union([S.String(), S.Number(), S.Bool(), S.Null()])

export const ValueSchema = S.Union([PrimitiveSchema, S.Array(PrimitiveSchema)])

// Component properties use period separated paths for nested properties, which is handled by deserializeComponent
export const ComponentSchema = S.Record(S.String(), ValueSchema)

export const SetComponentSchema = S.Object({
  nodeID: NodeIDSchema(),
  jsonID: S.String(),
  values: ComponentSchema
})

export const RemoveComponentSchema = S.Object({
  nodeID: NodeIDSchema(),
  jsonID: S.String()
})

export const CreateEntitySchema = S.Object({
  nodeID: NodeIDSchema(),
  parentID: NodeIDSchema(),
  components: S.Array(ComponentSchema)
})

export const RemoveEntitySchema = S.Object({
  nodeID: NodeIDSchema()
})

// export const CallbackSchema = S.Object({
//   callback: S.String(),
//   target: NodeIDSchema(),
//   parameters: S.Array(ValueSchema)
// })

export const ObserverSchema = S.Object({
  conditions: S.Array(S.Union([EntityConditionSchema, StateConditionSchema])),
  effects: S.Array(
    S.Union([
      SetComponentSchema,
      RemoveComponentSchema,
      CreateEntitySchema,
      RemoveEntitySchema
      // CallbackSchema
    ])
  ),
  networked: S.Bool(true)
})

const validCondition = (condition: Static<typeof EntityConditionSchema> | Static<typeof StateConditionSchema>) => {
  if ('nodeID' in condition) {
    return condition.nodeID !== '' && condition.component !== '' && condition.property !== ''
  } else {
    return condition.state !== '' && condition.property !== ''
  }
}

const validEffect = (
  effect:
    | Static<typeof SetComponentSchema>
    | Static<typeof RemoveComponentSchema>
    | Static<typeof CreateEntitySchema>
    | Static<typeof RemoveEntitySchema>
  // | Static<typeof CallbackSchema>
) => {
  if ('nodeID' in effect && 'jsonID' in effect) {
    // SetComponentSchema | RemoveComponentSchema
    return effect.nodeID !== '' && effect.jsonID !== '' && ComponentJSONIDMap.has(effect.jsonID)
  } else if ('nodeID' in effect && 'parentID' in effect) {
    // CreateEntitySchema
    return effect.nodeID !== '' && effect.parentID !== ''
  } else if ('nodeID' in effect) {
    // RemoveEntitySchema
    return effect.nodeID !== ''
  }
  //  else if ('callback' in effect) {
  //   return effect.callback !== '' && effect.parameters.length > 0
  // }
}

const validObserver = (observer: Static<typeof ObserverSchema>) =>
  observer.conditions.length &&
  observer.effects.length &&
  observer.conditions.every(validCondition) &&
  observer.effects.every(validEffect)

export const ObservableComponent = defineComponent({
  name: 'ObservableComponent',
  jsonID: 'IR_observable',

  schema: S.Object({
    observers: S.Array(ObserverSchema)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const observers = useComponent(entity, ObservableComponent).observers

    return (
      <>
        {observers.value.filter(validObserver).map((observer, index) => {
          return (
            <ObserverReactor
              key={JSON.stringify(observers[index].get(NO_PROXY))}
              entity={entity}
              observerIndex={index}
            />
          )
        })}
      </>
    )
  }
})

const ObserverReactor = (props: { entity: Entity; observerIndex: number }) => {
  const { entity, observerIndex } = props
  const observer = useComponent(entity, ObservableComponent).observers[observerIndex]
  const conditions = observer.conditions.value

  const sourceID = getComponent(entity, SourceComponent)

  // Get dependencies
  const dependencies = conditions.map((condition) => {
    if ('nodeID' in condition) {
      const componentDefinition = ComponentMap.get(condition.component)
      if (!componentDefinition) return null
      const uuid = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, condition.nodeID)
      const observedEntity = UUIDComponent.useEntityByUUID(uuid)
      const component = useComponent(observedEntity, componentDefinition).value
      const value = getNestedObject(component, condition.property).result
      return value
    } else {
      const stateDefinition = StateDefinitions.get(condition.state)
      if (!stateDefinition) return null
      return useMutableState(stateDefinition, condition.property).value
    }
  })

  useEffect(() => {
    const sourceID = getComponent(entity, SourceComponent)

    // Check conditions
    for (const condition of conditions) {
      if ('nodeID' in condition) {
        const componentDefinition = ComponentMap.get(condition.component)
        if (!componentDefinition) return
        const uuid = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, condition.nodeID)
        const observedEntity = UUIDComponent.getEntityByUUID(uuid)
        const component = getComponent(observedEntity, componentDefinition)
        const property = getNestedObject(component, condition.property).result
        const result = compare(property, condition)
        if (!result) return
      } else {
        const stateDefinition = StateDefinitions.get(condition.state)
        if (!stateDefinition) return
        const state = getState(stateDefinition)
        const property = getNestedObject(state, condition.property).result

        const result = compare(property, condition)
        if (!result) return
      }
    }

    const networkParams = observer.networked.value ? { $cached: true, $topic: NetworkTopics.world } : {}
    dispatchAction(
      ObservableActions.called({
        entityUUID: getComponent(entity, UUIDComponent),
        indices: [observerIndex],
        ...networkParams
      })
    )
  }, dependencies)

  return null
}

const compare = (
  a: number | boolean | string | Array<any>,
  condition: Static<typeof EntityConditionSchema> | Static<typeof StateConditionSchema>
) => {
  switch (condition.condition) {
    case 'largerThan':
      if (typeof a !== 'number') return false
      if (a >= condition.value) return true
      break
    case 'smallerThan':
      if (typeof a !== 'number') return false
      if (a <= condition.value) return true
      break
    case 'equal':
      if (a === condition.value) return true
      break
    case 'notEqual':
      if (a !== condition.value) return true
      break
    case 'contains':
      if (typeof a !== 'string' || Array.isArray(a) || typeof a.includes !== 'function') return false
      if (a.includes(condition.value)) return true
      break
    case 'notContains':
      if (typeof a !== 'string' || Array.isArray(a) || typeof a.includes !== 'function') return false
      if (!a.includes(condition.value)) return true
      break
  }
  return false
}
