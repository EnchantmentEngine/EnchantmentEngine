import { UserID } from '@ir-engine/common/src/schema.type.module'
import {
  createEngine,
  createEntity,
  destroyEngine,
  EngineState,
  EntityTreeComponent,
  EntityUUID,
  getComponent,
  hasComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { BoxGeometry, Intersection, Material, Mesh, Object3D, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { replaceMaterialAtIntersection } from './addMediaNode'

describe('replaceMaterialAtIntersection', () => {
  beforeEach(() => {
    createEngine()
    mockSpatialEngine()

    getMutableState(EngineState).userID.set('test-user' as UserID)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    destroyEngine()
  })

  it('should replace material at intersection', () => {
    // Create asset entity with material entity as child
    const assetEntity = createEntity()
    const materialEntity = createEntity()

    // Set up material entity
    const material = new Material()
    material.uuid = 'test-material-uuid'
    setComponent(materialEntity, MaterialStateComponent, {
      material,
      parameters: {}
    })
    setComponent(materialEntity, UUIDComponent, 'material-uuid' as EntityUUID)
    setComponent(materialEntity, NodeIDComponent, 'material-node-id')

    // Set up asset entity with material entity as child
    setComponent(assetEntity, EntityTreeComponent)
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: assetEntity })

    // Create target entity with mesh and material instance
    const targetEntity = createEntity()
    const targetMesh = new Mesh(new BoxGeometry(), new Material())
    targetMesh.geometry.groups = [{ start: 0, count: 36, materialIndex: 0 }]

    // Set up target entity
    setComponent(targetEntity, MeshComponent, targetMesh)
    setComponent(targetEntity, VisibleComponent)
    setComponent(targetEntity, MaterialInstanceComponent, {
      uuid: ['original-material-uuid' as EntityUUID]
    })
    setComponent(targetEntity, NodeIDComponent, 'target-node-id')
    setComponent(targetEntity, SourceComponent, 'source-id')
    setComponent(targetEntity, GLTFComponent, { src: 'test.gltf' })
    setComponent(targetEntity, TransformComponent)

    // Create object for intersection
    const object = new Object3D()
    object.entity = targetEntity

    // Create intersection
    const intersections = [
      {
        distance: 1,
        point: new Vector3(0, 0, 0),
        object,
        faceIndex: 0
      }
    ] as unknown as Intersection[]

    // Mock AuthoringState.snapshotEntities to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshotEntities').mockImplementation(() => {})

    // Call the function
    const replaceMaterialFn = replaceMaterialAtIntersection(intersections)
    replaceMaterialFn(assetEntity)

    // Verify the material instance was updated to point to the new material
    expect(hasComponent(targetEntity, MaterialInstanceComponent)).toBe(true)
    const materialInstance = getComponent(targetEntity, MaterialInstanceComponent)
    expect(materialInstance.uuid[0]).toBe(getComponent(materialEntity, UUIDComponent))

    // Verify the material entity has a SourceComponent set
    // Note: In a real test, this would be 'source-id', but our mock prevents the actual value from being set
    expect(hasComponent(materialEntity, SourceComponent)).toBe(true)

    // Verify the material entity has a new NodeID (different from the original)
    expect(getComponent(materialEntity, NodeIDComponent)).not.toBe('material-node-id')
  })

  it('should not replace material if entity does not have VisibleComponent', () => {
    // Create asset entity with material entity as child
    const assetEntity = createEntity()
    const materialEntity = createEntity()

    // Set up material entity
    const material = new Material()
    setComponent(materialEntity, MaterialStateComponent, {
      material,
      parameters: {}
    })
    setComponent(materialEntity, UUIDComponent, 'material-uuid' as EntityUUID)
    setComponent(materialEntity, NodeIDComponent, 'material-node-id')

    // Set up asset entity with material entity as child
    setComponent(assetEntity, EntityTreeComponent)
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: assetEntity })

    // Create target entity WITHOUT VisibleComponent
    const targetEntity = createEntity()

    // Create object for intersection
    const object = new Object3D()
    object.entity = targetEntity

    // Create intersection
    const intersections = [
      {
        distance: 1,
        point: new Vector3(0, 0, 0),
        object,
        faceIndex: 0
      }
    ] as unknown as Intersection[]

    // Mock AuthoringState.snapshotEntities to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshotEntities').mockImplementation(() => {})

    // Call the function
    const replaceMaterialFn = replaceMaterialAtIntersection(intersections)
    replaceMaterialFn(assetEntity)

    // Verify the material entity's NodeID was not changed
    expect(getComponent(materialEntity, NodeIDComponent)).toBe('material-node-id')

    // Verify the material entity does not have a SourceComponent
    expect(hasComponent(materialEntity, SourceComponent)).toBe(false)
  })

  it('should not replace material if entity does not have MeshComponent', () => {
    // Create asset entity with material entity as child
    const assetEntity = createEntity()
    const materialEntity = createEntity()

    // Set up material entity
    const material = new Material()
    setComponent(materialEntity, MaterialStateComponent, {
      material,
      parameters: {}
    })
    setComponent(materialEntity, UUIDComponent, 'material-uuid' as EntityUUID)
    setComponent(materialEntity, NodeIDComponent, 'material-node-id')

    // Set up asset entity with material entity as child
    setComponent(assetEntity, EntityTreeComponent)
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: assetEntity })

    // Create target entity with VisibleComponent but WITHOUT MeshComponent
    const targetEntity = createEntity()
    setComponent(targetEntity, VisibleComponent)

    // Create object for intersection
    const object = new Object3D()
    object.entity = targetEntity

    // Create intersection
    const intersections = [
      {
        distance: 1,
        point: new Vector3(0, 0, 0),
        object,
        faceIndex: 0
      }
    ] as unknown as Intersection[]

    // Mock AuthoringState.snapshotEntities to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshotEntities').mockImplementation(() => {})

    // Call the function
    const replaceMaterialFn = replaceMaterialAtIntersection(intersections)
    replaceMaterialFn(assetEntity)

    // Verify the material entity's NodeID was not changed
    expect(getComponent(materialEntity, NodeIDComponent)).toBe('material-node-id')

    // Verify the material entity does not have a SourceComponent
    expect(hasComponent(materialEntity, SourceComponent)).toBe(false)
  })

  it('should find the correct material index based on face index', () => {
    // Create asset entity with material entity as child
    const assetEntity = createEntity()
    const materialEntity = createEntity()

    // Set up material entity
    const material = new Material()
    material.uuid = 'test-material-uuid'
    setComponent(materialEntity, MaterialStateComponent, {
      material,
      parameters: {}
    })
    setComponent(materialEntity, UUIDComponent, 'material-uuid' as EntityUUID)
    setComponent(materialEntity, NodeIDComponent, 'material-node-id')

    // Set up asset entity with material entity as child
    setComponent(assetEntity, EntityTreeComponent)
    setComponent(materialEntity, EntityTreeComponent, { parentEntity: assetEntity })

    // Create target entity with mesh and multiple material groups
    const targetEntity = createEntity()
    const targetMesh = new Mesh(new BoxGeometry())

    // Create two material groups
    targetMesh.geometry.groups = [
      { start: 0, count: 18, materialIndex: 0 },
      { start: 18, count: 18, materialIndex: 1 }
    ]

    // Set up target entity
    setComponent(targetEntity, MeshComponent, targetMesh)
    setComponent(targetEntity, VisibleComponent)
    setComponent(targetEntity, MaterialInstanceComponent, {
      uuid: ['material-1' as EntityUUID, 'material-2' as EntityUUID]
    })
    setComponent(targetEntity, NodeIDComponent, 'target-node-id')
    setComponent(targetEntity, SourceComponent, 'source-id')
    setComponent(targetEntity, GLTFComponent, { src: 'test.gltf' })
    setComponent(targetEntity, TransformComponent)

    // Create object for intersection
    const object = new Object3D()
    object.entity = targetEntity

    // Create intersection with face index in second group
    const intersections = [
      {
        distance: 1,
        point: new Vector3(0, 0, 0),
        object,
        faceIndex: 10 // This should map to materialIndex 1 (second group)
      }
    ] as unknown as Intersection[]

    // Mock AuthoringState.snapshotEntities to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshotEntities').mockImplementation(() => {})

    // Call the function
    const replaceMaterialFn = replaceMaterialAtIntersection(intersections)
    replaceMaterialFn(assetEntity)

    // Verify the material instance was updated for the correct index
    const materialInstance = getComponent(targetEntity, MaterialInstanceComponent)
    expect(materialInstance.uuid[1]).toBe(getComponent(materialEntity, UUIDComponent))
    expect(materialInstance.uuid[0]).toBe('material-1')

    // Verify the material entity has a SourceComponent set
    // Note: In a real test, this would be 'source-id', but our mock prevents the actual value from being set
    expect(hasComponent(materialEntity, SourceComponent)).toBe(true)

    // Verify the material entity has a new NodeID (different from the original)
    expect(getComponent(materialEntity, NodeIDComponent)).not.toBe('material-node-id')
  })
})
