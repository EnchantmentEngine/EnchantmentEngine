import React, { useEffect } from 'react'
import { Light, Material, Mesh, Object3D, SkinnedMesh, Texture } from 'three'

import {
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineQuery, EntityArrayBoundary, QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { KHRUnlitExtensionComponent } from '../../gltf/MaterialExtensionComponents'

import { UUIDComponent } from '@ir-engine/ecs'
import { ShadowComponent } from '../components/ShadowComponent'

const disposeMaterial = (material: Material) => {
  for (const [key, val] of Object.entries(material) as [string, Texture][]) {
    if (val && typeof val.dispose === 'function') {
      val.dispose()
    }
  }
  material.dispose()
}

export const disposeObject3D = (obj: Object3D) => {
  const mesh = obj as Mesh<any, any>
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(disposeMaterial)
    } else {
      disposeMaterial(mesh.material)
    }
  }

  if (mesh.geometry) {
    mesh.geometry.dispose()
    for (const key in mesh.geometry.attributes) {
      mesh.geometry.deleteAttribute(key)
    }
  }

  const skinnedMesh = obj as SkinnedMesh
  if (skinnedMesh.isSkinnedMesh) {
    skinnedMesh.skeleton?.dispose()
  }

  const light = obj as Light // anything with dispose function
  if (typeof light.dispose === 'function') light.dispose()
}

const visibleObjectQuery = defineQuery([ObjectComponent, VisibleComponent])

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const execute = () => {
  for (const entity of visibleObjectQuery()) {
    const obj = getComponent(entity, ObjectComponent)
    const hasDistance = hasComponent(entity, DistanceFromCameraComponent)
    const inRange = hasDistance
      ? DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr
      : true
    /**
     * do frustum culling here, but only if the object is more than 5 units away
     */
    const visible = !(FrustumCullCameraComponent.isCulled[entity] && inRange)

    obj.visible = visible
  }
}

const ModelEntityReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const sourceID = UUIDComponent.useAsSourceID(entity)
  const childEntities = UUIDComponent.useEntitiesBySource(sourceID)

  return (
    <EntityArrayBoundary entities={childEntities} ChildEntityReactor={ChildReactor} props={{ parentEntity: entity }} />
  )
}

const useIsUnlit = (entity: Entity) => {
  let isUnlit = useHasComponent(entity, KHRUnlitExtensionComponent)
  const materialInstanceUUIDs = useOptionalComponent(entity, MaterialInstanceComponent)?.entities

  if (materialInstanceUUIDs) {
    for (const matEntity of materialInstanceUUIDs) {
      if (matEntity && hasComponent(matEntity, KHRUnlitExtensionComponent)) {
        isUnlit = true
        break
      }
    }
  }

  return isUnlit
}

const ChildReactor = (props: { entity: Entity; parentEntity: Entity }) => {
  const isMesh = useHasComponent(props.entity, MeshComponent)
  const isVisible = useHasComponent(props.entity, VisibleComponent)
  const isUnlit = useIsUnlit(props.entity)

  const shadowComponent = useOptionalComponent(props.parentEntity, ShadowComponent)
  useEffect(() => {
    if (!isMesh || !isVisible) return
    if (!shadowComponent) return

    if (!isUnlit) setComponent(props.entity, ShadowComponent, getComponent(props.parentEntity, ShadowComponent))
    else removeComponent(props.entity, ShadowComponent)

    return () => {
      removeComponent(props.entity, ShadowComponent)
    }
  }, [isVisible, isMesh, isUnlit, shadowComponent?.cast, shadowComponent?.receive])

  return null
}

const reactor = () => {
  return (
    <>
      <QueryReactor Components={[GLTFComponent, UUIDComponent]} ChildEntityReactor={ModelEntityReactor} />
    </>
  )
}

export const SceneObjectSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectSystem',
  insert: { after: AnimationSystemGroup },
  execute,
  reactor
})
