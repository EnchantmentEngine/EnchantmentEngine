import {
  EntityID,
  EntityUUIDPair,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { Mesh, MeshLambertMaterial, MeshPhysicalMaterial } from 'three'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { convertMaterials } from './MaterialLibrarySystem'

describe('MaterialLibrarySystem', () => {
  describe('convertMaterials', () => {
    let instanceEntity = UndefinedEntity
    let materialEntity = UndefinedEntity
    const materialInstanceID = 'materialUuid' as SourceID
    const materialID = 'id' as EntityID

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, { entitySourceID: materialInstanceID, entityID: materialID })
      setComponent(materialEntity, NameComponent, 'Material')
      setComponent(materialEntity, MaterialStateComponent, { material: new MeshPhysicalMaterial() })

      instanceEntity = createEntity()
      setComponent(instanceEntity, MaterialInstanceComponent, {
        entities: [materialEntity]
      })
      setComponent(instanceEntity, MeshComponent, new Mesh())

      await flushAll()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should convert a physical material to a basic material and update the instance', () => {
      convertMaterials(materialEntity, true)

      const basicUuid = { entitySourceID: 'basic-' + materialInstanceID, entityID: materialID } as EntityUUIDPair
      const basicMaterialEntity = UUIDComponent.getEntityByUUID(UUIDComponent.join(basicUuid))

      assert.equal(getComponent(basicMaterialEntity, UUIDComponent).entitySourceID, basicUuid.entitySourceID)

      const basicMaterialComponent = getComponent(basicMaterialEntity, MaterialStateComponent)
      const basicMaterial = basicMaterialComponent.material as MeshLambertMaterial
      const originalMaterial = getComponent(materialEntity, MaterialStateComponent).material as MeshPhysicalMaterial

      assert.equal(basicMaterial.reflectivity, originalMaterial.metalness)
      assert.equal(basicMaterial.envMap, originalMaterial.envMap)
      assert.equal(basicMaterial.uuid, UUIDComponent.join(basicUuid))
      assert.equal(basicMaterial.alphaTest, originalMaterial.alphaTest)
      assert.equal(basicMaterial.side, originalMaterial.side)
      assert.equal(getComponent(instanceEntity, MaterialInstanceComponent).entities[0], basicMaterialEntity)
    })

    it('should switch the instance back to physical when disabling basic materials', async () => {
      convertMaterials(materialEntity, true)
      await flushAll()

      const basicMaterialEntity = UUIDComponent.getEntityByUUID(
        UUIDComponent.join({
          entitySourceID: ('basic-' + materialInstanceID) as SourceID,
          entityID: materialID
        })
      )

      assert.equal(getComponent(basicMaterialEntity, UUIDComponent).entitySourceID, 'basic-' + materialInstanceID)

      const instanceComponent = getComponent(instanceEntity, MaterialInstanceComponent)

      assert.equal(instanceComponent.entities[0], basicMaterialEntity)

      convertMaterials(basicMaterialEntity, false)

      assert.equal(instanceComponent.entities[0], materialEntity)
    })
  })
})
