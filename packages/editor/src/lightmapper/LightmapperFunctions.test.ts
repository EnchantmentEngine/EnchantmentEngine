import {
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent,
  SourceID,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { mergeGeometries } from '@ir-engine/engine/src/scene/util/meshUtils'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { destroySpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { BoxGeometry, BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial } from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Lightmapper } from './LightmapperFunctions'

describe('LightmapperFunctions', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
    setComponent(testEntity, NameComponent, 'test-lightmap')
  })

  afterEach(() => {
    destroySpatialEngine()
    return destroyEngine()
  })

  describe('Lightmapper functions', () => {
    it('should export all expected functions', () => {
      expect(typeof Lightmapper.initialize).toBe('function')
      expect(typeof Lightmapper.sample).toBe('function')
      expect(typeof Lightmapper.getBakeBVH).toBe('function')
      expect(typeof Lightmapper.uploadLightmapTexture).toBe('function')
      expect(typeof Lightmapper.handleBakeLightmap).toBe('function')
    })
  })

  describe('getBakeBVH', () => {
    it('should create BVH from mesh entities and filter out transparent materials', async () => {
      const meshEntity = createEntity()
      const mesh1 = new BoxGeometry(1, 1, 1)
      const mesh2 = new BoxGeometry(2, 2, 2)
      const mesh3 = new BoxGeometry(3, 3, 3)

      setComponent(meshEntity, MeshComponent, new Mesh(mergeGeometries([mesh1, mesh2, mesh3], true)!))
      setComponent(meshEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })

      const transparentMaterialEntity = createEntity()
      setComponent(transparentMaterialEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      const transparentMaterial = new MeshStandardMaterial({ transparent: true, opacity: 0.5 })
      setComponent(transparentMaterialEntity, MaterialStateComponent, { material: transparentMaterial })

      const opaqueMaterial = new MeshStandardMaterial()
      const opaqueMaterialEntity = createEntity()
      setComponent(opaqueMaterialEntity, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      setComponent(opaqueMaterialEntity, MaterialStateComponent, { material: opaqueMaterial })

      setComponent(meshEntity, MaterialInstanceComponent, {
        entities: [transparentMaterialEntity, opaqueMaterialEntity, opaqueMaterialEntity]
      })

      await vi.waitFor(
        async () => {
          expect((getComponent(meshEntity, MeshComponent).material as MeshStandardMaterial[])[0].transparent).toBe(true)
        },
        { timeout: 10000 }
      )

      // Calculate expected indices length (entity1 + entity2, excluding transparent entity3)
      const expectedIndicesLength = mesh1.index!.count + mesh2.index!.count

      const bvh = Lightmapper.getBakeBVH([meshEntity])

      // Verify that transparent materials are filtered out by checking indices length
      const mergedGeometry = bvh.geometry
      expect(mergedGeometry.index!.count).toBe(expectedIndicesLength)

      expect(bvh).toBeInstanceOf(MeshBVH)
    })
  })

  describe('createGeometryFromGroups', () => {
    it('should create new geometry with specified groups', () => {
      const sourceGeometry = new BufferGeometry()

      // vertices for a quad
      const vertices = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0])

      const indices = new Uint16Array([0, 1, 2, 0, 2, 3])

      sourceGeometry.setAttribute('position', new BufferAttribute(vertices, 3))
      sourceGeometry.setIndex(new BufferAttribute(indices, 1))
      sourceGeometry.addGroup(0, 3, 0)
      sourceGeometry.addGroup(3, 3, 1)

      const entity = createEntity()
      const mesh = new Mesh(sourceGeometry, new MeshStandardMaterial())
      setComponent(entity, MeshComponent, mesh)

      const materialEntity1 = createEntity()
      const materialEntity2 = createEntity()
      setComponent(materialEntity1, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      setComponent(materialEntity2, UUIDComponent, {
        entitySourceID: 'test' as SourceID,
        entityID: UUIDComponent.generate()
      })
      const opaqueMaterial = new MeshStandardMaterial({ transparent: false })
      const transparentMaterial = new MeshStandardMaterial({ transparent: true, opacity: 0.5 })

      setComponent(materialEntity1, MaterialStateComponent, { material: opaqueMaterial })
      setComponent(materialEntity2, MaterialStateComponent, { material: transparentMaterial })
      setComponent(entity, MaterialInstanceComponent, { entities: [materialEntity1, materialEntity2] })

      const entities = [entity]
      const bvh = Lightmapper.getBakeBVH(entities)

      // expect it to successfully create BVH with filtered geometry
      expect(bvh).toBeInstanceOf(MeshBVH)
    })
  })
})
