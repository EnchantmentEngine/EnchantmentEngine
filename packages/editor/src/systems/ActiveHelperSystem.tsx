import { useCallback, useEffect, useMemo } from 'react'

import { defineQuery, EngineState, Entity, entityExists, UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import {
  ComponentJSONIDMap,
  getAuthoringCounterpart,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useEntityContext,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, NO_PROXY_STEALTH, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import React from 'react'

import { QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputHeuristicState, IntersectionData } from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks, ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import {
  BOUNDING_BOX_COLORS,
  BoundingBoxComponent,
  updateBoundingBox
} from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { Raycaster, Vector3 } from 'three'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { ComponentHelperEntry, ComponentHelperState } from '../classes/helper/ComponentHelperState'
import { iconGizmoArrow, setupGizmo } from '../constants/GizmoPresets'
import { getIconGizmo, gizmoIconUpdate, setIconSize, VolumeVisibility } from '../functions/gizmos/studioIconGizmoHelper'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
import { transformGizmoControllerQuery } from './TransformGizmoSystem'

const _raycaster = new Raycaster() // for heuristic
_raycaster.layers.enable(ObjectLayers.NodeIcon) // only icons
_raycaster.firstHitOnly = true

const inputObjectsQuery = defineQuery([InputComponent, VisibleComponent, ObjectComponent])

export const studioIconGizmoInputHeuristic = (
  viewerEntity: Entity = getState(ReferenceSpaceState).viewerEntity,
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) => {
  const isEditing = getState(EngineState).isEditing
  if (!isEditing) return

  const gizmoEnabled = getState(EditorHelperState).gizmoEnabled
  if (!gizmoEnabled) return

  _raycaster.set(position, direction)
  _raycaster.camera = getComponent(viewerEntity, CameraComponent)

  const objects = inputObjectsQuery().map((eid) => getComponent(eid, ObjectComponent))

  const hits = _raycaster.intersectObjects(objects, true)

  for (const hit of hits) {
    intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
  }
}

const getHighestPriorityHelper = (entity: Entity): ComponentHelperEntry | undefined => {
  const componentHelpers = getState(ComponentHelperState)
  let highestPriorityHelper: ComponentHelperEntry | undefined = undefined
  let highestPriority = -1

  // Iterate through all registered component helpers
  for (const [componentId, helperEntry] of Object.entries(componentHelpers)) {
    const component = globalThis.ComponentJSONIDMap?.get(componentId)
    // Check if the entity has this component
    if (component && hasComponent(entity, component)) {
      // If this helper has higher priority than current highest, replace it
      if (helperEntry.priority > highestPriority) {
        highestPriority = helperEntry.priority
        highestPriorityHelper = helperEntry
      }
    }
  }

  return highestPriorityHelper
}

const ActiveHelperReactor: React.FC<ComponentHelperEntry> = (helper) => {
  const entity = useEntityContext()
  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const engineState = useHookstate(getMutableState(EngineState))
  const engineRendererSettings = useMutableState(RendererState)

  const selectedEntities = SelectionState.useSelectedEntities()
  const selected = useHookstate<boolean>(false)
  const lineEntitiesState = useHookstate<Entity[]>([])
  const directionalEntitiesState = useHookstate<Entity[]>([])
  const iconSize = useHookstate<number>(getState(EditorHelperState).editorIconMinSize)
  const visibility = useHasComponent(entity, VisibleComponent)

  // check if entity has any higher priority helper
  const effectiveHelper = useMemo(() => {
    const highestPriorityHelper = getHighestPriorityHelper(entity)

    // If there's a higher priority helper than the current one, use it
    if (highestPriorityHelper && highestPriorityHelper.priority > helper.priority) {
      return highestPriorityHelper
    }

    // Otherwise, use the current helper
    return helper
  }, [entity, helper])

  const shouldShowHelper = useMemo(
    () =>
      editorHelperState.gizmoEnabled.value &&
      visibility &&
      engineState.isEditing.value &&
      effectiveHelper?.icon !== undefined,
    [editorHelperState.gizmoEnabled.value, visibility, engineState.isEditing.value, effectiveHelper?.icon]
  )

  const helperFactory = useCallback(() => {
    const iconGizmo = getIconGizmo(effectiveHelper.icon)
    iconGizmo.renderOrder = -1

    if (effectiveHelper?.directional) {
      const directionalEntities = setupGizmo(entity, iconGizmoArrow, ObjectLayers.NodeIcon)
      directionalEntities.forEach((directionalEntity) => {
        setComponent(directionalEntity, ObjectLayerMaskComponent, ObjectLayerMasks.NodeIcon)
      })
      directionalEntitiesState.set(directionalEntities)
    }

    if (effectiveHelper?.volume) {
      setComponent(entity, BoundingBoxComponent)
    }
    return iconGizmo
  }, [entity, effectiveHelper, directionalEntitiesState, lineEntitiesState])

  const studioIconEntity = useHelperEntity(
    entity,
    helperFactory,
    shouldShowHelper,
    ObjectLayerMasks.NodeIcon,
    'icon-helper'
  )

  // manage input state
  const hovered = InputComponent.useHasFocus(studioIconEntity)
  useEffect(() => {
    const authoringEntity = getAuthoringCounterpart(entity)
    const isSelected = selectedEntities.some((e) => e === authoringEntity)
    selected.set(isSelected)
  }, [selectedEntities, entity, selected])

  // manage input execution
  const inputExecutionCallback = useCallback(() => {
    if (studioIconEntity === UndefinedEntity || !entityExists(studioIconEntity)) return
    if (entity === UndefinedEntity || !entityExists(entity)) return
    if (!engineState.isEditing.value || !editorHelperState.gizmoEnabled.value) return
    if (getOptionalComponent(entity, UUIDComponent)) return

    gizmoIconUpdate(entity, studioIconEntity, [...directionalEntitiesState.get(NO_PROXY_STEALTH)], iconSize.value)

    iconSize.set((currentSize) => setIconSize(hovered.value, currentSize))

    const isEditing = getState(EngineState).isEditing
    for (const lineEntity of lineEntitiesState.value) {
      setVisibleComponent(lineEntity, hovered.value && isEditing)
    }

    if (selected.value) {
      const transformGizmoControllerEntity = transformGizmoControllerQuery()
      if (
        transformGizmoControllerEntity.length > 0 &&
        getComponent(transformGizmoControllerEntity[0], TransformGizmoControlComponent).dragging
      ) {
        return
      }
    }

    const defaultGizmoButtons = InputComponent.getButtons(studioIconEntity)
    if (defaultGizmoButtons.PrimaryClick?.down) {
      SelectionState.updateSelection([UUIDComponent.get(entity)])
    }
  }, [
    studioIconEntity,
    entity,
    engineState.isEditing.value,
    editorHelperState.gizmoEnabled.value,
    directionalEntitiesState,
    iconSize,
    hovered.value,
    lineEntitiesState.value,
    selected.value
  ])
  InputComponent.useExecuteWithInput(inputExecutionCallback, InputExecutionOrder.Before, true)

  //manage icon visibility
  useEffect(() => {
    const setGizmoVisibility = (visible: boolean) => {
      if (studioIconEntity === UndefinedEntity) return

      const entitiesToUpdate = [studioIconEntity, ...directionalEntitiesState.value, ...lineEntitiesState.value]

      for (const entityToUpdate of entitiesToUpdate) {
        setVisibleComponent(entityToUpdate, visible)
      }
    }

    const shouldBeVisible =
      engineState.isEditing.value &&
      editorHelperState.gizmoEnabled.value &&
      engineRendererSettings.nodeIconVisibility.value
    setGizmoVisibility(shouldBeVisible)
  }, [
    engineState.isEditing.value,
    editorHelperState.gizmoEnabled.value,
    engineRendererSettings.nodeIconVisibility.value,
    studioIconEntity,
    directionalEntitiesState.value,
    lineEntitiesState.value
  ])

  //manage volume visibility
  useEffect(() => {
    if (effectiveHelper?.volume === undefined) return

    const { volumeVisibility } = editorHelperState
    const hasPreexistingBoundingBoxComponent = hasComponent(entity, BoundingBoxComponent)
    switch (volumeVisibility.value) {
      case VolumeVisibility.On: {
        if (!hasPreexistingBoundingBoxComponent) {
          setComponent(entity, BoundingBoxComponent)
        } else {
          updateBoundingBox(entity)
        }

        const color = selected.value
          ? BOUNDING_BOX_COLORS.SELECTED
          : hovered.value
          ? BOUNDING_BOX_COLORS.HOVERED
          : undefined

        if (color) {
          setComponent(entity, BoundingBoxComponent, { color })
        }
        break
      }

      case VolumeVisibility.Auto:
        if (selected.value || hovered.value) {
          if (!hasPreexistingBoundingBoxComponent) {
            setComponent(entity, BoundingBoxComponent)
          } else {
            updateBoundingBox(entity)
          }

          const autoColor = selected.value ? BOUNDING_BOX_COLORS.SELECTED : BOUNDING_BOX_COLORS.HOVERED

          setComponent(entity, BoundingBoxComponent, { color: autoColor })
        }
        break

      case VolumeVisibility.Off:
      default:
        break
    }

    return () => {
      if (!hasPreexistingBoundingBoxComponent && hasComponent(entity, BoundingBoxComponent)) {
        removeComponent(entity, BoundingBoxComponent)
      }
    }
  }, [selected, hovered, effectiveHelper?.volume, visibility, editorHelperState.volumeVisibility, entity])

  if (!effectiveHelper.reactor) return null

  const ReactorComponent = effectiveHelper.reactor as React.ComponentType<{
    parentEntity: Entity
    iconEntity: Entity
    selected: boolean
    hovered: boolean
  }>

  return (
    <ReactorComponent
      parentEntity={entity}
      iconEntity={studioIconEntity}
      selected={selected.value}
      hovered={hovered.value}
    />
  )
}

const reactor = () => {
  useEffect(() => {
    InputHeuristicState.addHeuristic(1, studioIconGizmoInputHeuristic)
  }, [])

  const helperRegistry = useMutableState(ComponentHelperState).keys

  const helperComponents = useMemo(() => {
    return helperRegistry
      .map((componentJsonId) => {
        const component = ComponentJSONIDMap.get(componentJsonId)

        if (!component) return null

        const helper = getState(ComponentHelperState)[componentJsonId]

        return (
          <QueryReactor
            key={componentJsonId}
            Components={[component]}
            ChildEntityReactor={ActiveHelperReactor}
            props={helper}
          />
        )
      })
      .filter(Boolean)
  }, [helperRegistry])

  return <>{helperComponents}</>
}

export const ActiveHelperSystem = defineSystem({
  uuid: 'ee.engine.ActiveHelperSystem',
  insert: { with: PresentationSystemGroup },
  execute: () => {},
  reactor
})
