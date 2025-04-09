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

import React, { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import {
  Component,
  defineComponent,
  EntityUUID,
  hasComponent,
  removeComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  matches,
  none,
  useMutableState
} from '@ir-engine/hyperflux'
import { WorldNetworkAction } from '@ir-engine/network'

import { matchesQuaternion, matchesVector3 } from '../common/functions/MatchesUtils'
import { SpawnObjectActions } from '../transform/SpawnObjectActions'

/**
 * Options for defining a networked component
 */
export interface NetworkedComponentOptions {
  /**
   * Component definition
   */
  component: any

  /**
   * Additional actions to define
   */
  actions?: Record<string, any>

  /**
   * Custom state definition (optional)
   * If provided, this will be used as the base for the state definition
   * The name and initial state will be overridden, but receptors will be merged
   */
  stateDefinition?: any

  /**
   * Custom reactor for the state
   */
  stateReactor?: (props: { entityUUID: EntityUUID }) => React.ReactNode
}

/**
 * Defines a networked component that combines component API with event sourcing
 *
 * @param options Options for defining the networked component
 * @returns The defined component, state, actions, and helper functions
 */
export function defineNetworkedComponent(options: NetworkedComponentOptions) {
  const { component: componentDef, actions: additionalActions = {}, stateDefinition } = options

  // Define the component
  const component = defineComponent(componentDef)

  // Create a unique prefix for actions and state
  const prefix = `ee.networked.${component.name}`

  // Extract schema properties to use for state
  const schemaProperties = componentDef.schema?.properties || {}
  const stateProperties = Object.keys(schemaProperties).reduce((acc, key) => {
    // Use the schema's default value for the state
    acc[key] = schemaProperties[key].default
    return acc
  }, {})

  // Define the spawn action with properties from the component schema
  const spawnActionProps = Object.keys(stateProperties).reduce((acc, key) => {
    // Create a matcher for each property
    acc[key] = matches.any.optional()
    return acc
  }, {})

  // Define the actions for network operations
  const spawnAction = defineAction(
    SpawnObjectActions.spawnObject.extend({
      type: `${prefix}.SPAWN`,
      position: matchesVector3.optional(),
      rotation: matchesQuaternion.optional(),
      parentUUID: matches.string,
      ...spawnActionProps
    })
  )

  // Create the actions object
  const actions = {
    spawn: spawnAction,
    ...additionalActions
  }

  // Create the base state definition
  const baseStateDefinition = {
    name: `${prefix}.State`,
    initial: {} as Record<EntityUUID, typeof stateProperties>,
    receptors: {
      onSpawn: spawnAction.receive((action) => {
        const stateData = {}

        // Extract component-specific properties from the action
        Object.keys(stateProperties).forEach((key) => {
          if (key in action) {
            stateData[key] = action[key]
          } else {
            stateData[key] = stateProperties[key]
          }
        })

        // We'll use getMutableState with the actual state instance later
        return { entityUUID: action.entityUUID, stateData }
      }),
      onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
        // We'll use getMutableState with the actual state instance later
        return { entityUUID: action.entityUUID }
      })
    },
    reactor: function StateReactor() {
      const networkState = useMutableState(state)
      const entityUUIDs = Object.keys(networkState.value || {}) as EntityUUID[]

      return (
        <>
          {entityUUIDs.map((entityUUID) => (
            <React.Fragment key={entityUUID}>
              {NetworkedComponentReactor({
                entityUUID,
                component,
                stateReactor: options.stateReactor
              })}
            </React.Fragment>
          ))}
        </>
      )
    }
  }

  // Merge with custom state definition if provided
  const mergedStateDefinition = stateDefinition
    ? {
        ...stateDefinition,
        name: baseStateDefinition.name,
        initial: baseStateDefinition.initial,
        receptors: {
          ...baseStateDefinition.receptors,
          ...stateDefinition.receptors
        },
        reactor: baseStateDefinition.reactor
      }
    : baseStateDefinition

  // Define the state for event sourcing
  const state = defineState(mergedStateDefinition)

  // Now that we have the state instance, we can update the receptors to use it
  spawnAction.receive((action) => {
    const stateData = {}

    // Extract component-specific properties from the action
    Object.keys(stateProperties).forEach((key) => {
      if (key in action) {
        stateData[key] = action[key]
      } else {
        stateData[key] = stateProperties[key]
      }
    })

    getMutableState(state)[action.entityUUID].set(stateData)
  })

  WorldNetworkAction.destroyEntity.receive((action) => {
    getMutableState(state)[action.entityUUID].set(none)
  })

  // Helper function to spawn an entity with this component
  const spawnEntity = (props: {
    position?: Vector3
    rotation?: Quaternion
    parentUUID?: EntityUUID
    [key: string]: any
  }) => {
    const { position, rotation, parentUUID = '0' as EntityUUID, ...rest } = props
    const entityUUID = UUIDComponent.generateUUID()

    // Dispatch the spawn action
    dispatchAction(
      spawnAction({
        entityUUID,
        parentUUID,
        position,
        rotation,
        ...rest
      })
    )

    // Get the entity from the UUID
    const entity = UUIDComponent.getEntityByUUID(entityUUID)

    return { entityUUID, entity }
  }

  return {
    component,
    state,
    actions,
    spawnEntity
  }
}

/**
 * Reactor component for networked components
 */
function NetworkedComponentReactor({
  entityUUID,
  component,
  stateReactor
}: {
  entityUUID: EntityUUID
  component: Component
  stateReactor?: (props: { entityUUID: EntityUUID }) => React.ReactNode
}) {
  const entity = UUIDComponent.useEntityByUUID(entityUUID)

  // Apply component to entity
  useEffect(() => {
    if (!entity) return

    // Initialize the component if it doesn't exist
    if (!hasComponent(entity, component)) {
      setComponent(entity, component)
    }

    return () => {
      // Clean up component when entity is destroyed
      if (entity && hasComponent(entity, component)) {
        removeComponent(entity, component)
      }
    }
  }, [entity, component])

  // Render custom reactor if provided
  return stateReactor ? stateReactor({ entityUUID }) : null
}
