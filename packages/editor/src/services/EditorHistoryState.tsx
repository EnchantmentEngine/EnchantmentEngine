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
  ComponentMap,
  deserializeComponent,
  Entity,
  EntityTreeComponent,
  getAllComponents,
  getComponent,
  hasComponent,
  Layers,
  QueryReactor,
  removeComponent,
  removeEntity,
  serializeComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { SourceComponent, SourceID } from '@ir-engine/engine/src/scene/components/SourceComponent'
import {
  defineAction,
  defineState,
  dispatchAction,
  ErrorBoundary,
  getMutableState,
  getState,
  matches,
  NO_PROXY,
  none,
  useMutableState,
  UserID,
  Validator
} from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { Suspense, useEffect } from 'react'
import { applyPatch, createPatch, Operation, Patch } from 'rfc6902'

export type SourceData = Record<NodeID, object>

export type UndoCommand = {
  type: 'undo'
  sourceID: SourceID
  author: UserID
}

export type RedoCommand = {
  type: 'redo'
  sourceID: SourceID
  author: UserID
}

export type JSONPatchCommands = { sourceID: SourceID; author: UserID; ops: Patch }

export type HistoryCommand = UndoCommand | RedoCommand | JSONPatchCommands

export const EditorHistoryActions = {
  /**
   * Use to initialize the history state for a source
   */
  initialize: defineAction({
    type: 'ir.editor.history.INITIALIZE',
    sourceID: matches.string as Validator<unknown, SourceID>,
    partialState: matches.object as Validator<unknown, SourceData>
  }),

  /**
   * Use to uninitialize the history state for a source
   */
  uninitialize: defineAction({
    type: 'ir.editor.history.UNINITIALIZE',
    sourceID: matches.string as Validator<unknown, SourceID>
  }),

  /**
   * Use to undo the last done command
   */
  undo: defineAction({
    type: 'ir.editor.history.UNDO',
    sourceID: matches.string as Validator<unknown, SourceID>
  }),

  /**
   * Use to redo the last undone command
   */
  redo: defineAction({
    type: 'ir.editor.history.REDO',
    sourceID: matches.string as Validator<unknown, SourceID>
  }),

  /**
   * Use to add entities or components
   */
  ops: defineAction({
    type: 'ir.editor.history.ADD',
    sourceID: matches.string as Validator<unknown, SourceID>,
    ops: matches.array as Validator<unknown, Operation[]>
  })
}

export const EditorHistoryState = defineState({
  name: 'ir.editor.history.EditorHistoryState',
  initial: {
    commands: {} as Record<UserID, HistoryCommand[]>,
    sources: {} as Record<SourceID, { initial: SourceData; latest: SourceData }>
  },

  receptors: {
    initialize: EditorHistoryActions.initialize.receive((action) => {
      if (!getState(EditorHistoryState).sources[action.sourceID]) {
        getMutableState(EditorHistoryState).sources.set({})
      }
      getMutableState(EditorHistoryState).sources[action.sourceID].set({
        initial: action.partialState,
        latest: action.partialState
      })
    }),
    uninitialize: EditorHistoryActions.uninitialize.receive((action) => {
      getMutableState(EditorHistoryState).sources[action.sourceID].set(none)
    }),
    undo: EditorHistoryActions.undo.receive((action) => {
      if (!getState(EditorHistoryState).commands[action.$user]) {
        getMutableState(EditorHistoryState).commands[action.$user].set([])
      }
      const history = getMutableState(EditorHistoryState).commands[action.$user]
      history.merge([
        {
          type: 'undo',
          author: action.$user,
          sourceID: action.sourceID
        }
      ])
    }),
    redo: EditorHistoryActions.redo.receive((action) => {
      if (!getState(EditorHistoryState).commands[action.$user]) {
        getMutableState(EditorHistoryState).commands[action.$user].set([])
      }
      const history = getMutableState(EditorHistoryState).commands[action.$user]
      history.merge([
        {
          type: 'redo',
          author: action.$user,
          sourceID: action.sourceID
        }
      ])
    }),
    ops: EditorHistoryActions.ops.receive((action) => {
      if (!getState(EditorHistoryState).commands[action.$user]) {
        getMutableState(EditorHistoryState).commands[action.$user].set([])
      }
      const history = getMutableState(EditorHistoryState).commands[action.$user]
      history.merge([
        {
          author: action.$user,
          sourceID: action.sourceID,
          ops: action.ops
        }
      ])
    })
  },

  reactor: () => {
    const state = useMutableState(EditorHistoryState)

    return (
      <>
        <QueryReactor
          Components={[SceneComponent, GLTFComponent]}
          ChildEntityReactor={SourceReactor}
          layer={Layers.Authoring}
        />
        {state.sources.keys.map((sourceID: SourceID) => (
          <ErrorBoundary key={sourceID}>
            <Suspense>
              <SourceHistoryReactor sourceID={sourceID} />
            </Suspense>
          </ErrorBoundary>
        ))}
      </>
    )
  },

  canRedo: (sourceID: SourceID) => {
    const history = getState(EditorHistoryState)[sourceID]
    const commands = Object.values(history.commands).flat() as HistoryCommand[]
    const { redoStack } = computeCommands(commands)
    return redoStack.length > 0
  },

  canUndo: (sourceID: SourceID) => {
    const history = getState(EditorHistoryState)[sourceID]
    const commands = Object.values(history.commands).flat() as HistoryCommand[]
    const { doneStack } = computeCommands(commands)
    return doneStack.length > 1 // 1 such that you cannot undo the first snapshot
  },

  snapshot: (sourceID: SourceID) => {
    const newData = getSourceSnapshot(sourceID)
    const patch = createPatch(getState(EditorHistoryState).sources[sourceID].latest, newData)
    dispatchAction(EditorHistoryActions.ops({ sourceID, ops: patch }))
  },

  snapshotEntities: (entities: Entity[]) => {
    const affectedSources = new Set<SourceID>(entities.map((entity) => GLTFComponent.getInstanceID(entity)))
    for (const sourceID of affectedSources) {
      const newData = getSourceSnapshot(sourceID)
      const patch = createPatch(getState(EditorHistoryState).sources[sourceID].latest, newData)
      dispatchAction(EditorHistoryActions.ops({ sourceID, ops: patch }))
    }
  }
})

const SourceReactor = (props: { entity: Entity }) => {
  const loaded = GLTFComponent.useSceneLoaded(props.entity)

  useEffect(() => {
    if (!loaded) return

    const sourceID = GLTFComponent.getInstanceID(props.entity)

    const sourceData = getSourceSnapshot(sourceID)

    dispatchAction(EditorHistoryActions.initialize({ sourceID, partialState: sourceData }))

    return () => {
      dispatchAction(EditorHistoryActions.uninitialize({ sourceID }))
    }
  }, [loaded])

  return null
}

/**
 * Because our actions are an immutable event log, we can replay them to get the current state.
 * This component replays the history of a source to keep the current state in sync.
 */
const SourceHistoryReactor = (props: { sourceID: SourceID }) => {
  const commands = useMutableState(EditorHistoryState).commands
  const sourceCommands = Object.values(commands.get(NO_PROXY))
    .flat()
    .filter((command) => command.sourceID === props.sourceID) as HistoryCommand[]
  const commandLength = sourceCommands.length

  useEffect(() => {
    if (commandLength === 0) return

    // parse our undo/redo stack and return a new list of commands that represent the final graph path
    const { doneStack } = computeCommands(sourceCommands)
    if (!doneStack.length) return

    // get the readonly state and treat it as mutable so we have a non-reactive copy of the current state
    const readonlyState = getState(EditorHistoryState).sources[props.sourceID]

    const operations = doneStack.flatMap((command) => command.ops)

    // get the final state of the history
    const finalState = structuredClone(readonlyState.initial)
    applyPatch(finalState, operations)

    console.log(finalState)

    // update the state to the ECS
    applyCommandsToECS(props.sourceID, readonlyState.latest, finalState)

    readonlyState.latest = finalState
  }, [commandLength])

  return null
}

/**
 * Given a list of commands, compute the final state of the history.
 * @param commands
 * @returns
 */
export const computeCommands = (commands: HistoryCommand[]) => {
  const commandLength = commands.length
  const doneStack: JSONPatchCommands[] = []
  const redoStack: JSONPatchCommands[] = []
  for (let i = 0; i < commandLength; i++) {
    const command = commands[i]
    if ('type' in command) {
      if (command.type === 'undo') {
        // Undo the most recent command, if there is one.
        if (doneStack.length > 0) {
          const undoneCmd = doneStack.pop()!
          redoStack.push(undoneCmd)
        }
      } else if (command.type === 'redo') {
        // Redo the most recent undone command.
        if (redoStack.length > 0) {
          const redoneCmd = redoStack.pop()!
          doneStack.push(redoneCmd)
        }
      }
    } else {
      // A normal command: push it onto the done stack
      // and clear the redo stack (as new commands invalidate the redo history).
      doneStack.push(command)
      redoStack.length = 0
    }
  }

  return { doneStack: doneStack.flat(), redoStack: redoStack.flat() }
}

/**
 * Given a final state, apply the commands to the ECS.
 * - Ensures that entities and components that are created or removed are reflected in the ECS with respect to the the last update.
 * @param sourceID
 * @param finalState
 */
export const applyCommandsToECS = (sourceID: SourceID, currentState: SourceData, finalState: SourceData) => {
  for (const nodeID of Object.keys(finalState) as NodeID[]) {
    if (finalState[nodeID]) {
      const uuid = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID)
      if (!currentState[nodeID] && !UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)) {
        // entity does not exist, add entity
        NodeIDComponent.create(sourceID, nodeID, Layers.Authoring)
      }
      const entity = UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)
      for (const [componentName, componentData] of Object.entries(finalState[nodeID])) {
        const Component = ComponentMap.get(componentName)
        if (!Component) continue
        deserializeComponent(entity, Component, componentData)
      }
      if (currentState[nodeID]) {
        for (const componentName of Object.keys(currentState[nodeID])) {
          if (!finalState[nodeID][componentName]) {
            // component does not exist, remove component
            const Component = ComponentMap.get(componentName)
            if (!Component) continue
            removeComponent(entity, Component)
          }
        }
      }
    }
  }
  for (const nodeID of Object.keys(currentState) as NodeID[]) {
    if (!finalState[nodeID]) {
      // entity does not exist, remove entity
      const uuid = NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID)
      const entity = UUIDComponent.getEntityByUUID(uuid, Layers.Authoring)
      // ensure the entity has actually been removed, and not moved to another source
      if (getComponent(entity, SourceComponent) === sourceID) {
        removeEntity(entity)
      }
    }
  }
}

export const getSourceSnapshot = (sourceID: SourceID) => {
  const sourceEntities = SourceComponent.getEntitiesBySource(sourceID, Layers.Authoring)

  const sourceData = {} as SourceData

  for (const entity of sourceEntities) {
    const nodeID = getComponent(entity, NodeIDComponent)
    sourceData[nodeID] = {}

    const components = getAllComponents(entity)

    for (const component of components) {
      if (component === NodeIDComponent) continue
      const sceneComponentID = component.jsonID
      if (sceneComponentID) {
        const data = serializeComponent(entity, component)
        if (data) {
          sourceData[nodeID][component.name] = data
        }
      }
    }

    // special case components that do not have a jsonID but are required if available
    if (hasComponent(entity, NameComponent)) {
      sourceData[nodeID][NameComponent.name] = getComponent(entity, NameComponent)
    }
    if (hasComponent(entity, TransformComponent)) {
      const component = getComponent(entity, TransformComponent)
      sourceData[nodeID][TransformComponent.name] = {
        position: {
          x: component.position.x,
          y: component.position.y,
          z: component.position.z
        },
        rotation: {
          x: component.rotation.x,
          y: component.rotation.y,
          z: component.rotation.z,
          w: component.rotation.w
        },
        scale: {
          x: component.scale.x,
          y: component.scale.y,
          z: component.scale.z
        }
      }
    }
    if (hasComponent(entity, EntityTreeComponent)) {
      sourceData[nodeID][EntityTreeComponent.name] = {
        parentEntity: getComponent(entity, EntityTreeComponent).parentEntity,
        childIndex: getComponent(entity, EntityTreeComponent).childIndex
      }
    }
  }

  return sourceData
}
