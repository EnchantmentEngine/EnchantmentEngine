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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/
import { Ray } from '@dimforge/rapier3d-compat'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import {
  Entity,
  EntityTreeComponent,
  UUIDComponent,
  UndefinedEntity,
  defineQuery,
  defineSystem,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs'
import { AssetType, FileToAssetType } from '@ir-engine/engine/src/assets/constants/AssetType'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { defineMaterialPlugin } from '@ir-engine/engine/src/material/defineMaterialPlugin'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'

import { createSceneEntity } from '@ir-engine/engine/src/scene/functions/createSceneEntity'
import { NO_PROXY, defineState, getMutableState, getState, useHookstate, useState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { ReferenceSpaceState } from '@ir-engine/spatial/src/ReferenceSpaceState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { MouseScroll } from '@ir-engine/spatial/src/input/state/ButtonState'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'

import { iterateEntityNode } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ObjectLayerComponents } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformDirtyCleanupSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import React, { useEffect } from 'react'
import { Euler, Object3D, Quaternion, Raycaster, Vector3 } from 'three'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import { addMediaNode } from '../functions/addMediaNode'
import { EditorHelperState, PlacementMode } from '../services/EditorHelperState'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'
import { ObjectGridSnapState } from './ObjectGridSnapSystem'

let placedCount = 0

type AssetTag = string

// Define the placement preview material plugin
export const PlacementPreviewMaterialPlugin = defineMaterialPlugin({
  name: 'PlacementPreviewMaterialPlugin',

  jsonID: 'IR_material_placement_preview',

  uniforms: S.Object({
    enabled: S.Bool({ default: false }),
    opacity: S.Number({ default: 0.5 })
  }),

  onApply: (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      /* glsl */ `
        #include <dithering_fragment>

        uniform bool enabled;
        uniform float opacity;

        if (enabled) {
          gl_FragColor.a *= opacity;
        }
      `
    )
  }
})

export interface AssetMetadataType {
  thumbnail?: string
  name?: string
  type: string
  author?: string
  dateCreated?: string
  fileSize?: string
  dimensions?: {
    height?: number | null
    width?: number | null
    depth?: number | null
  }
  mesh?: string
  resources?: string
  tags?: AssetTag[]
}
export const ClickPlacementState = defineState({
  name: 'ClickPlacementState',
  initial: {
    placementEntity: UndefinedEntity as Entity,
    selectedAsset: '',
    yawOffset: 0,
    pitchOffset: 0,
    rollOffset: 0,
    maxDistance: 25,
    metadata: {} as AssetMetadataType
  },
  setSelectedAsset: (src: string) => {
    if (ClickPlacementState.isPlaceableAsset(src)) {
      getMutableState(ClickPlacementState).selectedAsset.set(src)
    } else {
      // If in click placement mode and non-placeable asset was selected, show warning
      if (getState(EditorHelperState).placementMode === PlacementMode.CLICK) {
        ClickPlacementState.assetError()
      } else ClickPlacementState.resetSelectedAsset()
    }
  },
  setSelectedAssetData: (resource: AssetMetadataType) => {
    getMutableState(ClickPlacementState).metadata.set(resource)
  },
  resetSelectedAsset: () => {
    getMutableState(ClickPlacementState).selectedAsset.set('')
  },
  assetError: () => {
    NotificationService.dispatchNotify('Selected asset is not valid for click placement', { variant: 'warning' })
    ClickPlacementState.resetSelectedAsset()
  },
  isPlaceableAsset: (src: string): boolean => {
    if (!src) return false

    const assetType = FileToAssetType(src)

    // Support models, images, videos, audio, and volumetric assets
    return (
      assetType === AssetType.Model ||
      assetType === AssetType.Image ||
      assetType === AssetType.Video ||
      assetType === AssetType.Audio ||
      assetType === AssetType.Volumetric ||
      src.includes('.uvol')
    ) // Special case for volumetric files
  }
})

const ClickPlacementReactor = (props: { parentEntity: Entity }) => {
  const { parentEntity } = props
  const clickState = useState(getMutableState(ClickPlacementState))
  const editorState = useState(getMutableState(EditorHelperState))
  const sceneLoaded = GLTFComponent.useSceneLoaded(parentEntity)
  const errors = ErrorComponent.useComponentErrors(clickState.placementEntity.value, GLTFComponent)

  useEffect(() => {
    if (!sceneLoaded) return
    if (editorState.placementMode.value === PlacementMode.CLICK) {
      SelectionState.updateSelection([])
      if (clickState.placementEntity.value) return
      clickState.placementEntity.set(createPlacementEntity(parentEntity))
    } else {
      if (!clickState.placementEntity.value) return
      const selectedEntities = getState(SelectionState).selectedEntities.filter(
        (uuid) => uuid !== UUIDComponent.get(clickState.placementEntity.value)
      )
      cleanupPlacementEntity(clickState.placementEntity.value)
      clickState.placementEntity.set(UndefinedEntity)
      SelectionState.updateSelection(selectedEntities)
    }
  }, [editorState.placementMode.value, sceneLoaded])

  useEffect(() => {
    if (!clickState.placementEntity.value) return
    const assetURL = clickState.selectedAsset.get(NO_PROXY)
    const placementEntity = clickState.placementEntity.value
    if (getComponent(placementEntity, GLTFComponent)?.src === assetURL) return
    updatePlacementEntity(placementEntity, assetURL)
  }, [clickState.selectedAsset.value, clickState.placementEntity.value])

  useEffect(() => {
    if (
      !errors?.value ||
      !clickState.selectedAsset.value ||
      !clickState.placementEntity.value ||
      !getComponent(clickState.placementEntity.value, GLTFComponent)?.src ||
      getComponent(clickState.placementEntity.value, GLTFComponent)?.src === clickState.selectedAsset.value
    )
      return
    ClickPlacementState.assetError()
  }, [errors, clickState.selectedAsset.value])

  return (
    <PlacementModelReactor key={clickState.placementEntity.value} placementEntity={clickState.placementEntity.value} />
  )
}

const PlacementModelReactor = (props: { placementEntity: Entity }) => {
  const { placementEntity } = props
  const gltfComponent = GLTFComponent.useSceneLoaded(placementEntity)

  useEffect(() => {
    if (!gltfComponent || !placementEntity) return

    // Apply placement preview material plugin to all meshes in the placement entity
    const applyPlacementPreview = () => {
      iterateEntityNode(placementEntity, (entity) => {
        const meshComponent = getOptionalComponent(entity, MeshComponent)
        if (!meshComponent) return

        // Add the placement preview material plugin component
        setComponent(entity, PlacementPreviewMaterialPlugin, {
          enabled: true,
          opacity: 0.5
        })
      })
    }

    applyPlacementPreview()

    return () => {
      // Cleanup: Remove placement preview components
      iterateEntityNode(placementEntity, (entity) => {
        if (getOptionalComponent(entity, PlacementPreviewMaterialPlugin)) {
          removeComponent(entity, PlacementPreviewMaterialPlugin)
        }
      })
    }
  }, [gltfComponent, placementEntity])

  return null
}

const objectLayerQuery = defineQuery([ObjectLayerComponents[ObjectLayers.Scene]])

const getParentEntity = () => {
  return getState(EditorState).rootEntity
}

const updatePlacementEntity = (placementEntity: Entity, assetURL: string) => {
  if (assetURL) {
    setComponent(placementEntity, GLTFComponent, { src: assetURL })
  } else {
    removeComponent(placementEntity, GLTFComponent)
  }
}

const cleanupPlacementEntity = (placementEntity: Entity) => {
  if (!placementEntity) return

  // Remove placement preview components from all child entities
  iterateEntityNode(placementEntity, (entity) => {
    if (getOptionalComponent(entity, PlacementPreviewMaterialPlugin)) {
      removeComponent(entity, PlacementPreviewMaterialPlugin)
    }
  })

  // Remove the placement entity
  EditorControlFunctions.removeObject([placementEntity])
}

const createPlacementEntity = (parentEntity: Entity) => {
  const placementEntity = createSceneEntity('Placement-' + placedCount, parentEntity)
  setComponent(placementEntity, EntityTreeComponent, { parentEntity })

  // Load the selected asset if one is available
  const selectedAsset = getState(ClickPlacementState).selectedAsset
  if (selectedAsset) {
    setComponent(placementEntity, GLTFComponent, { src: selectedAsset })
  }

  return placementEntity
}

const clickListener = async () => {
  const clickState = getMutableState(ClickPlacementState)
  if (!clickState.selectedAsset.value) return
  const parentEntity = getParentEntity()
  if (!parentEntity) return
  const placementEntity = clickState.placementEntity.value
  if (!placementEntity) return

  // Get the current transform of the placement entity
  const transform = getComponent(placementEntity, TransformComponent)
  if (!transform) return

  // Apply grid snap if enabled
  if (getState(ObjectGridSnapState).enabled) {
    ObjectGridSnapState.apply()
  } else {
    TransformComponent.updateFromWorldMatrix(placementEntity)
  }

  // Use addMediaNode for proper asset handling based on type
  const assetURL = clickState.selectedAsset.value
  const extraComponents = [
    {
      name: TransformComponent.jsonID,
      props: {
        position: [transform.position.x, transform.position.y, transform.position.z],
        rotation: [transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w],
        scale: [transform.scale.x, transform.scale.y, transform.scale.z]
      }
    }
  ]

  try {
    // Use addMediaNode which handles different asset types properly
    const entityUUID = await addMediaNode(assetURL, parentEntity, UndefinedEntity, extraComponents)

    if (entityUUID) {
      // Create new placement entity for next placement
      placedCount += 1
      clickState.placementEntity.set(createPlacementEntity(parentEntity))
    }
  } catch (error) {
    console.error('Failed to place asset:', error)
    NotificationService.dispatchNotify('Failed to place asset', { variant: 'error' })
  }
}

export const ClickPlacementSystem = defineSystem({
  uuid: 'ee.studio.ClickPlacementSystem',
  insert: { after: TransformDirtyCleanupSystem },
  reactor: () => {
    const parentEntity = useHookstate(getMutableState(EditorState)).rootEntity

    return parentEntity.value ? (
      <ClickPlacementReactor key={parentEntity.value} parentEntity={parentEntity.value} />
    ) : null
  },
  execute: () => {
    const editorHelperState = getState(EditorHelperState)
    if (editorHelperState.placementMode !== PlacementMode.CLICK) return
    const clickState = getMutableState(ClickPlacementState)
    const placementEntity = clickState.placementEntity
    if (!placementEntity) return

    const editorEntity = getState(EditorState).rootEntity
    const physicsWorld = Physics.getWorld(editorEntity)
    if (!physicsWorld) return

    const sceneObjects: Object3D[] = []
    const candidates = objectLayerQuery()
    for (const entity of candidates) {
      const obj = getOptionalComponent(entity, ObjectComponent)
      !!obj && sceneObjects.push(obj)
    }

    // Get camera from the current viewer entity
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    const camera = getComponent(viewerEntity, CameraComponent)
    if (!camera) return

    const pointerScreenRaycaster = new Raycaster()
    let targetIntersection: { point: Vector3; normal: Vector3 } | null = null

    const mouseEntity = InputPointerComponent.getPointersForCamera(viewerEntity)[0]
    if (!mouseEntity) return

    const buttons = InputComponent.getButtons(viewerEntity)
    const axes = InputComponent.getAxes(viewerEntity)

    const zoom = axes[MouseScroll.VerticalScroll]!

    if (buttons.SecondaryClick?.pressed) {
      clickState.maxDistance.set(clickState.maxDistance.value - zoom)
    }

    if (buttons.KeyE?.up) {
      clickState.yawOffset.set(clickState.yawOffset.value + Math.PI / 4)
    }
    if (buttons.KeyQ?.up) {
      clickState.yawOffset.set(clickState.yawOffset.value - Math.PI / 4)
    }
    if (buttons.PrimaryClick?.up) {
      clickListener()
      //Wait until next frame is placement entity changed
      if (placementEntity !== clickState.placementEntity) return
    }

    const pointer = getComponent(mouseEntity, InputPointerComponent)
    const mouse = pointer.position
    pointerScreenRaycaster.setFromCamera(mouse, camera) // Assuming 'camera' is your Three.js camera
    const cameraPosition = pointerScreenRaycaster.ray.origin
    const cameraDirection = pointerScreenRaycaster.ray.direction
    const physicsIntersection = physicsWorld.castRayAndGetNormal(new Ray(cameraPosition, cameraDirection), 1000, false)
    if (physicsIntersection && physicsIntersection.toi < clickState.maxDistance.value) {
      const intersectPosition = cameraPosition
        .clone()
        .add(cameraDirection.clone().multiplyScalar(physicsIntersection.toi))
      const intersectNormal = new Vector3(
        physicsIntersection.normal.x,
        physicsIntersection.normal.y,
        physicsIntersection.normal.z
      )
      targetIntersection = {
        point: intersectPosition,
        normal: intersectNormal
      }
    }
    const intersect = pointerScreenRaycaster.intersectObjects(sceneObjects, false)
    //if (intersect.length === 0 && !targetIntersection) return
    for (let i = 0; i < intersect.length; i++) {
      const intersected = intersect[i]
      if (intersected.distance > clickState.maxDistance.value) continue
      if (isPlacementDescendant(intersected.object.entity!)) continue
      targetIntersection = {
        point: intersected.point,
        normal: intersected.face?.normal ?? new Vector3(0, 1, 0)
      }
      break
    }

    if (!targetIntersection) {
      const point = cameraPosition.clone().add(cameraDirection.clone().multiplyScalar(clickState.maxDistance.value))
      targetIntersection = { point, normal: new Vector3(0, 1, 0) }
    }
    const position = targetIntersection.point
    let rotation = new Quaternion().setFromUnitVectors(new Vector3(), targetIntersection.normal ?? new Vector3(0, 1, 0))
    const offset = new Quaternion().setFromEuler(
      new Euler(clickState.pitchOffset.value, clickState.yawOffset.value, clickState.rollOffset.value)
    )
    rotation = offset.multiply(rotation)
    setComponent(placementEntity.value, TransformComponent, { position, rotation })
  }
})

const isPlacementDescendant = (entity: Entity) => {
  const placementEntity = getState(ClickPlacementState).placementEntity
  if (!placementEntity) return false
  let walker = entity
  while (walker) {
    if (walker === placementEntity) return true
    walker = getComponent(walker, EntityTreeComponent)?.parentEntity ?? null
  }
  return false
}
