import { useEffect } from 'react'

import {
  createEntity,
  Entity,
  EntityUUIDPair,
  getComponent,
  getMutableComponent,
  PresentationSystemGroup,
  QueryReactor,
  removeEntity,
  setComponent,
  SourceID,
  useComponent,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getMutableState, getState, NO_PROXY_STEALTH, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  MaterialInstanceComponent,
  MaterialReferenceState,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { getMaterialIndices } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import React from 'react'
import { MeshLambertMaterial, MeshPhysicalMaterial } from 'three'

const reactor = () => {
  const rendererState = useMutableState(RendererState)
  useEffect(() => {
    if (rendererState.qualityLevel.value === 0) rendererState.forceBasicMaterials.set(true)
  }, [rendererState.qualityLevel, rendererState.forceBasicMaterials])

  return <QueryReactor Components={[MaterialStateComponent]} ChildEntityReactor={ChildMaterialReactor} />
}

const ChildMaterialReactor = () => {
  const entity = useEntityContext()
  const forceBasicMaterials = useMutableState(RendererState).forceBasicMaterials.value
  const materialComponent = useComponent(entity, MaterialStateComponent)
  const materialReferences = useHookstate(getMutableState(MaterialReferenceState)[entity])
  useEffect(() => {
    if (!materialComponent.material.value || !materialReferences.length) return
    convertMaterials(entity, forceBasicMaterials)
  }, [materialComponent.material, materialComponent.material.needsUpdate, materialReferences, forceBasicMaterials])
  return null
}

const ExpensiveMaterials = new Set(['MeshStandardMaterial', 'MeshPhysicalMaterial'])
/**@todo refactor this to use preprocessor directives instead of new cloned materials with different shaders */
export const convertMaterials = (material: Entity, forceBasicMaterials: boolean) => {
  const materialComponent = getComponent(material, MaterialStateComponent)
  const references = getState(MaterialReferenceState)[material]
  const setMaterial = (newMaterial: Entity) => {
    for (const instance of references) {
      const indices = getMaterialIndices(instance, material)
      for (const index of indices) {
        const instanceComponent = getMutableComponent(instance, MaterialInstanceComponent)
        const entities = instanceComponent.entities.get(NO_PROXY_STEALTH) as Entity[]
        entities[index] = newMaterial
        instanceComponent.entities.set(entities)
      }
    }
  }
  const shouldMakeBasic =
    (forceBasicMaterials || isMobileXRHeadset) && ExpensiveMaterials.has(materialComponent.material.type)

  const uuid = getComponent(material, UUIDComponent)
  const basicUuid: EntityUUIDPair = {
    entitySourceID: ('basic-' + uuid.entitySourceID) as SourceID,
    entityID: uuid.entityID
  }
  const existingMaterialEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(basicUuid))
  if (shouldMakeBasic) {
    if (existingMaterialEntity) {
      removeEntity(existingMaterialEntity)
      return
    }

    const prevMaterial = materialComponent.material as MeshPhysicalMaterial
    const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
    const newBasicMaterial = new MeshLambertMaterial().copy(prevMaterial)
    newBasicMaterial.specularMap = prevMaterial.roughnessMap ?? prevMaterial.specularIntensityMap
    if (onlyEmmisive) newBasicMaterial.emissiveMap = prevMaterial.emissiveMap
    else newBasicMaterial.map = prevMaterial.map
    newBasicMaterial.reflectivity = prevMaterial.metalness
    newBasicMaterial.envMap = prevMaterial.envMap
    newBasicMaterial.alphaTest = prevMaterial.alphaTest
    newBasicMaterial.side = prevMaterial.side

    const newMaterialEntity = createEntity()
    setComponent(newMaterialEntity, UUIDComponent, basicUuid)
    setComponent(newMaterialEntity, NameComponent, 'basic-' + getComponent(material, NameComponent))
    setComponent(newMaterialEntity, MaterialStateComponent, { material: newBasicMaterial })
    setMaterial(newMaterialEntity)
  } else if (!forceBasicMaterials) {
    const basicMaterialEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(uuid))
    if (!basicMaterialEntity) return
    const nonBasicUUID = UUIDComponent.join({
      entitySourceID: uuid.entitySourceID.slice(6) as SourceID,
      entityID: uuid.entityID
    })
    const materialEntity = UUIDComponent.getEntityByUUID(nonBasicUUID)
    if (!materialEntity) return
    setMaterial(materialEntity)
  }
}

export const MaterialLibrarySystem = defineSystem({
  uuid: 'ee.engine.scene.MaterialLibrarySystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
