import {
  Entity,
  EntityID,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import sinon from 'sinon'
import { BoxGeometry, Material, Mesh } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { MeshComponent } from '../components/MeshComponent'
import { MaterialStateComponent, PrototypeArgumentValue } from './MaterialComponent'
import { hasPlugin, removePlugin, setMeshMaterial, setPlugin } from './materialFunctions'

const prototypeDefaultArgs: PrototypeArgumentValue = {
  type: 'defaultType',
  default: {},
  min: 21,
  max: 42,
  options: [{}]
}

describe('materialFunctions', () => {
  describe('setMeshMaterial', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the first item of `@param newMaterialEntities` to MeshComponent.material when MeshComponent.material is not an array', () => {
      const materialEntity = createEntity()
      const otherMaterialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      setComponent(otherMaterialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      const newMaterialEntities = [materialEntity, otherMaterialEntity]
      const material = new Material()
      const expectedUUID = UUIDComponent.get(materialEntity)

      // Set the data as expected
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material as Material
      assert.equal(Array.isArray(result), false)
      assert.equal(result.uuid, expectedUUID)
    })

    it('should add all items of `@param newMaterialEntities` to MeshComponent.material when MeshComponent.material is an array', () => {
      // Set the fallback material
      const fallbackMaterial = new Material()
      const fallbackUUID = MaterialStateComponent.fallbackMaterialUUIDPair
      const fallbackEntity = createEntity()
      setComponent(fallbackEntity, UUIDComponent, fallbackUUID)
      setComponent(fallbackEntity, MaterialStateComponent, { material: fallbackMaterial })

      // Generate the Materials and Entities
      const material1 = new Material()
      const material2 = new Material()

      const materialEntity1 = createEntity()
      const materialEntity2 = createEntity()
      const dummyEntity = createEntity()
      setComponent(materialEntity1, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      setComponent(materialEntity2, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      setComponent(dummyEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id3' as EntityID
      })
      const newMaterialEntities = [materialEntity1, materialEntity2, dummyEntity]
      const expectedMaterialEntities = [materialEntity1, materialEntity2]

      setComponent(materialEntity1, MaterialStateComponent, { material: material1 })
      setComponent(materialEntity2, MaterialStateComponent, { material: material2 })
      // Note: dummyEntity doesn't have MaterialStateComponent

      // Generate the Mesh with the Materials
      const mesh = new Mesh(new BoxGeometry())
      mesh.material = [new Material(), new Material()] as Material[]
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, MeshComponent, mesh)

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(expectedMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material as Material[]
      assert.equal(Array.isArray(result), true)

      // Check that the materials match the expected ones
      for (let i = 0; i < result.length; i++) {
        if (i < expectedMaterialEntities.length) {
          const expectedMaterialEntity = expectedMaterialEntities[i]
          if (hasComponent(expectedMaterialEntity, MaterialStateComponent)) {
            const expectedMaterial = getComponent(expectedMaterialEntity, MaterialStateComponent).material
            assert.equal(result[i].uuid, expectedMaterial.uuid)
          }
        }
      }
    })

    it('should not do anything when `@param groupEntity` is falsy', () => {
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      const otherMaterialEntity = createEntity()
      setComponent(otherMaterialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      const newMaterialEntities = [materialEntity, otherMaterialEntity]
      const material = new Material()
      const expectedUUID = material.uuid

      // Set the data as expected
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!UndefinedEntity, true) // Will pass UndefinedEntity as `@param groupEntity`
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(UndefinedEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material
      assert.equal(Array.isArray(result), false)
      assert.notEqual((result as Material).uuid, expectedUUID)
    })

    it('should not do anything when `@param groupEntity` does not have a MeshComponent', () => {
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      const otherMaterialEntity = createEntity()
      setComponent(otherMaterialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      const newMaterialEntities = [materialEntity, otherMaterialEntity]
      const material = new Material()

      // Set the data as expected
      // Do NOT set MeshComponent on testEntity
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), true)
      assert.equal(newMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getOptionalComponent(testEntity, MeshComponent)?.material
      assert.equal(Array.isArray(result), false)
      assert.equal(result, undefined)
    })

    it('should not do anything when `@param newMaterialEntities` is empty', () => {
      const newMaterialEntities = [] as Entity[]
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      const material = new Material()
      const expectedUUID = material.uuid

      // Set the data as expected
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialEntities.length === 0, true)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material
      assert.equal(Array.isArray(result), false)
      assert.notEqual((result as Material).uuid, expectedUUID)
    })
  }) //:: setMeshMaterial

  describe('setPlugin', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set material.onBeforeCompile to `@param callback`', () => {
      const material = new Material()
      const callback = sinon.spy()
      // Sanity check before running
      const before = material.onBeforeCompile.toString()
      assert.notEqual(before, callback)
      // Run and Check the result
      setPlugin(material, callback)
      const result = material.onBeforeCompile.toString()
      assert.equal(result, callback)
    })

    it('should set material.needsUpdate to true', () => {
      const callback = sinon.spy()
      const material = new Material()
      // Sanity check before running
      const before = material.version
      assert.equal(before, 0)
      // Run and Check the result
      setPlugin(material, callback)
      const result = material.version
      assert.equal(result, 1)
    })
  }) //:: setPlugin

  describe('hasPlugin', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return false if the `@param material`.plugins array is empty', () => {
      const Expected = false
      const callback = sinon.spy()
      // Set the data as expected
      const material = new Material()
      material.plugins = []
      // Sanity check before running
      assert.equal(material.plugins.length, 0)
      assert.equal(material.plugins.includes(callback), false)
      // Run and Check the result
      const result = hasPlugin(material, callback)
      assert.equal(result, Expected)
    })

    it('should return false if the `@param material`.plugins array is not empty but does not contain the `@param callback`', () => {
      const Expected = false
      const callback = sinon.spy()
      const other = () => {}
      // Set the data as expected
      const material = new Material()
      material.plugins = [other]
      // Sanity check before running
      assert.equal(material.plugins.length, 1)
      assert.equal(material.plugins.includes(callback), false)
      // Run and Check the result
      const result = hasPlugin(material, callback)
      assert.equal(result, Expected)
    })

    it('should return true if the `@param material`.plugins array is not empty and it contains the `@param callback`', () => {
      const Expected = true
      const callback = sinon.spy()
      // Set the data as expected
      const material = new Material()
      material.plugins = [callback]
      // Sanity check before running
      assert.equal(material.plugins.length, 1)
      assert.equal(material.plugins.includes(callback), true)
      // Run and Check the result
      const result = hasPlugin(material, callback)
      assert.equal(result, Expected)
    })
  }) //:: hasPlugin

  describe('removePlugin', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should remove the `@param callback` function from the `@param material`.plugins array', () => {
      const Expected = false
      const Initial = !Expected
      const callback = sinon.spy()
      // Set the data as expected
      const material = new Material()
      material.plugins = [callback]
      // Sanity check before running
      const before = material.plugins.includes(callback)
      assert.equal(before, Initial)
      // Run and Check the result
      removePlugin(material, callback)
      const result = material.plugins.includes(callback)
      assert.equal(result, Expected)
    })
  }) //:: removePlugin
}) //:: materialFunctions
