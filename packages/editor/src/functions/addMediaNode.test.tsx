import {
  createEngine,
  createEntity,
  destroyEngine,
  EngineState,
  Entity,
  EntityTreeComponent,
  EntityUUID,
  getComponent,
  hasComponent,
  Layers,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { TransformComponent } from '@ir-engine/spatial'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  MaterialInstanceComponent,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { Cache, Color, Material, Mesh, Object3D } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UserID } from '@ir-engine/common/src/schema.type.module'
import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { AssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState } from '@ir-engine/hyperflux'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { EditorState } from '../services/EditorServices'
import { addMediaNode } from './addMediaNode'
import { EditorControlFunctions } from './EditorControlFunctions'
import * as getIntersectingNodeModule from './getIntersectingNode'

// Mock the getContentType function
vi.mock('./utils', () => ({
  getContentType: vi.fn().mockImplementation((url) => {
    if (url.includes('material.gltf')) return 'model/material'
    if (url.includes('lookdev.gltf')) return 'model/lookdev'
    if (url.includes('prefab.gltf')) return 'model/prefab'
    if (url.includes('.gltf') || url.includes('.glb')) return 'model/gltf'
    if (url.includes('.mp4') || url.includes('.webm')) return 'video/mp4'
    if (url.includes('.jpg') || url.includes('.png')) return 'image/png'
    if (url.includes('.mp3') || url.includes('.wav')) return 'audio/mp3'
    return 'application/octet-stream'
  }),
  getIncreamentedName: vi.fn().mockImplementation((name) => name)
}))

// Create a simple GLTF scene
const createSceneGLTF = () => ({
  asset: {
    version: '2.0',
    generator: 'iR Engine Test'
  },
  scenes: [{ nodes: [0] }],
  scene: 0,
  nodes: [
    {
      name: 'Root',
      children: [1],
      extensions: {
        [NodeIDComponent.jsonID]: 'root-node-id'
      }
    },
    {
      name: 'Cube',
      mesh: 0,
      extensions: {
        [NodeIDComponent.jsonID]: 'cube-node-id',
        [VisibleComponent.jsonID]: true
      }
    }
  ],
  meshes: [
    {
      primitives: [
        {
          mode: 4,
          attributes: {
            POSITION: 0,
            NORMAL: 1,
            TEXCOORD_0: 2
          },
          material: 0
        }
      ]
    }
  ],
  materials: [
    {
      name: 'Standard Material',
      pbrMetallicRoughness: {
        baseColorFactor: [0.8, 0.8, 0.8, 1.0],
        metallicFactor: 0.5,
        roughnessFactor: 0.5
      }
    }
  ],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126,
      count: 24,
      max: [1, 1, 1],
      min: [-1, -1, -1],
      type: 'VEC3'
    },
    {
      bufferView: 1,
      componentType: 5126,
      count: 24,
      type: 'VEC3'
    },
    {
      bufferView: 2,
      componentType: 5126,
      count: 24,
      type: 'VEC2'
    }
  ],
  bufferViews: [
    {
      buffer: 0,
      byteOffset: 0,
      byteLength: 288
    },
    {
      buffer: 0,
      byteOffset: 288,
      byteLength: 288
    },
    {
      buffer: 0,
      byteOffset: 576,
      byteLength: 192
    }
  ],
  buffers: [
    {
      byteLength: 768,
      uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAgD8AAAAAAACAPwAAgD8AAAAAAACAPwAAgD8AAAAAAACAPwAAgD8AAAAAAACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAAAAAADAPwAAAAAAAMA/AAAAAAAAwD8AAAAAAADAPwAAwD8AAAAAAAAAAAAA4D8AAAAAAADAPwAAwD8AAAAAAAAAAAAA4D8AAAAAAAAAAAAAAAAAANA/AAAAAAAAwD8AAAAAAAAAAAAAAAAAANA/AAAAAAAAwD8AAAAAAAAAAAAA4D8AAAAAAADAPwAAAAAAAOA/AAAAAAAAwD8='
    }
  ],
  extensionsUsed: [NodeIDComponent.jsonID, VisibleComponent.jsonID]
})

// Create a simple material GLTF
const createMaterialGLTF = () => ({
  asset: {
    version: '2.0',
    generator: 'iR Engine Test'
  },
  scenes: [{ name: 'Root', nodes: [0] }],
  scene: 0,
  nodes: [{ name: 'Materials', mesh: 0 }],
  materials: [
    {
      name: 'Test Material',
      pbrMetallicRoughness: {
        baseColorFactor: [1.0, 0.0, 0.0, 1.0], // Red material
        metallicFactor: 0.0,
        roughnessFactor: 0.5
      },
      extensions: {
        EE_material: {
          uuid: 'test-material-uuid',
          name: 'Test Material',
          prototype: 'MeshStandardMaterial',
          plugins: [],
          args: {
            color: { type: 'color', contents: new Color('red').getHex() },
            roughness: { type: 'float', contents: 0.5 },
            metalness: { type: 'float', contents: 0.0 }
          }
        }
      }
    }
  ],
  meshes: [
    {
      primitives: [{ mode: 4, attributes: {}, material: 0 }],
      extensions: { EE_resourceId: { resourceId: 'test-material-resource-id' } }
    }
  ],
  extensionsUsed: ['EE_resourceId', 'EE_material']
})

describe('addMediaNode', () => {
  let physicsWorldEntity: Entity
  let rootEntity: Entity
  let sceneURL: string
  let materialURL: string

  beforeEach(async () => {
    try {
      destroyEngine()
    } catch (e) {
      // Engine might not exist yet
    }

    createEngine()
    mockSpatialEngine()

    // Set user ID for AuthoringState
    getMutableState(EngineState).userID.set('test-user' as UserID)

    // Create physics world entity
    physicsWorldEntity = createEntity()
    setComponent(physicsWorldEntity, UUIDComponent, 'physics-world-uuid' as EntityUUID)
    setComponent(physicsWorldEntity, SceneComponent)
    setComponent(physicsWorldEntity, TransformComponent)
    setComponent(physicsWorldEntity, EntityTreeComponent)

    // Create and cache scene GLTF
    sceneURL = 'https://test.com/test-scene.gltf'
    const sceneGLTF = createSceneGLTF()
    Cache.enabled = true
    Cache.add(sceneURL, sceneGLTF)

    // Load scene
    rootEntity = AssetState.load(sceneURL, undefined, physicsWorldEntity, Layers.Authoring)
    getMutableState(EditorState).rootEntity.set(rootEntity)

    // Create and cache material GLTF
    materialURL = 'https://test.com/test-material.material.gltf'
    const materialGLTF = createMaterialGLTF()
    Cache.add(materialURL, materialGLTF)

    // Mock AuthoringState.snapshot and snapshotEntities
    vi.spyOn(AuthoringState, 'snapshot').mockImplementation(() => {})
    vi.spyOn(AuthoringState, 'snapshotEntities').mockImplementation(() => {})

    // Mock AssetState.loadAsync
    vi.spyOn(AssetState, 'loadAsync').mockImplementation((url, _uuid, _entityUUID, _parent, _layer) => {
      if (url === materialURL) {
        const materialEntity = createEntity()
        const childEntity = createEntity()
        setComponent(materialEntity, EntityTreeComponent)
        setComponent(childEntity, EntityTreeComponent, { parentEntity: materialEntity })
        setComponent(childEntity, MaterialStateComponent, {
          material: new Material(),
          parameters: {}
        })
        return Promise.resolve(materialEntity)
      }
      return Promise.resolve(createEntity())
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Cache.clear()
    destroyEngine()
  })

  it('should load a regular GLTF model', async () => {
    // Create a mock entity that will be returned by createObjectFromSceneElement
    const mockEntity = createEntity()
    const mockEntityUUID = 'mock-entity-uuid' as EntityUUID
    setComponent(mockEntity, UUIDComponent, mockEntityUUID)

    // Mock EditorControlFunctions.createObjectFromSceneElement to return our entity
    vi.spyOn(EditorControlFunctions, 'createObjectFromSceneElement').mockImplementation(() => {
      // Set up the entity with the components that would be set in a real scenario
      setComponent(mockEntity, GLTFComponent, { src: 'https://test.com/test-model.gltf' })
      setComponent(mockEntity, EntityTreeComponent, { parentEntity: rootEntity })

      return {
        entityUUID: mockEntityUUID,
        sourceID: 'test-source-id'
      }
    })

    // Mock AuthoringState.snapshot to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshot').mockImplementation(() => {})

    // Call the function
    const modelURL = 'https://test.com/test-model.gltf'
    const result = await addMediaNode(modelURL, rootEntity)

    // Verify the entity was created with the correct components
    expect(result).toBe(mockEntityUUID)
    expect(hasComponent(mockEntity, GLTFComponent)).toBe(true)
    expect(getComponent(mockEntity, GLTFComponent).src).toBe('https://test.com/test-model.gltf')
    expect(hasComponent(mockEntity, EntityTreeComponent)).toBe(true)
    expect(getComponent(mockEntity, EntityTreeComponent).parentEntity).toBe(rootEntity)
  })

  it('should load a material and replace material at intersection', async () => {
    // Create a target entity that will be intersected
    const targetEntity = createEntity()
    setComponent(targetEntity, VisibleComponent)
    setComponent(targetEntity, MeshComponent, new Mesh())
    setComponent(targetEntity, MaterialInstanceComponent, {
      uuid: ['original-material-uuid' as EntityUUID]
    })

    // Create a material entity that will be loaded
    const materialEntity = createEntity()
    setComponent(materialEntity, MaterialStateComponent, {
      material: new Material(),
      parameters: {}
    })
    setComponent(materialEntity, UUIDComponent, 'material-uuid' as EntityUUID)

    // Set up a child entity relationship
    const childEntity = createEntity()
    setComponent(materialEntity, EntityTreeComponent)
    setComponent(childEntity, EntityTreeComponent, { parentEntity: materialEntity })
    setComponent(childEntity, MaterialStateComponent, {
      material: new Material(),
      parameters: {}
    })

    // Mock getIntersectingNodeOnScreen to return our target entity
    vi.spyOn(getIntersectingNodeModule, 'getIntersectingNodeOnScreen').mockImplementation(
      (_raycaster, _mouse, target) => {
        if (target) {
          const object = new Object3D()
          object.entity = targetEntity
          target.push({
            distance: 1,
            point: { x: 0, y: 0, z: 0 },
            object,
            faceIndex: 0
          } as any)
        }
        return { object: { entity: targetEntity } } as any
      }
    )

    // Mock AssetState.loadAsync to return our material entity
    vi.spyOn(AssetState, 'loadAsync').mockImplementation(() => {
      return Promise.resolve(materialEntity)
    })

    // Mock AuthoringState.snapshotEntities to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshotEntities').mockImplementation(() => {})

    // Mock the event object
    const mockEvent = {
      clientX: 100,
      clientY: 100,
      target: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 800,
          height: 600
        })
      },
      altKey: false,
      button: 0,
      buttons: 0,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      type: 'click'
    } as unknown as MouseEvent

    // Mock window.event
    Object.defineProperty(window, 'event', {
      value: mockEvent,
      writable: true
    })

    // Call addMediaNode with material URL
    const result = await addMediaNode(materialURL, rootEntity)

    // Verify the result is null (material replacement doesn't return an entityUUID)
    expect(result).toBeNull()
  })

  it('should load a video', async () => {
    // Mock EditorControlFunctions.createObjectFromSceneElement
    const mockEntityUUID = 'mock-video-uuid' as EntityUUID
    vi.spyOn(EditorControlFunctions, 'createObjectFromSceneElement').mockReturnValue({
      entityUUID: mockEntityUUID,
      sourceID: 'test-video-source-id'
    })

    // Mock AuthoringState.snapshot to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshot').mockImplementation(() => {})

    // Call the function
    const videoURL = 'https://test.com/test-video.mp4'
    const result = await addMediaNode(videoURL, rootEntity)

    // Verify the result is the expected entity UUID
    expect(result).toBe(mockEntityUUID)
  })

  it('should load an image', async () => {
    // Mock EditorControlFunctions.createObjectFromSceneElement
    const mockEntityUUID = 'mock-image-uuid' as EntityUUID
    vi.spyOn(EditorControlFunctions, 'createObjectFromSceneElement').mockReturnValue({
      entityUUID: mockEntityUUID,
      sourceID: 'test-image-source-id'
    })

    // Mock AuthoringState.snapshot to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshot').mockImplementation(() => {})

    // Call the function
    const imageURL = 'https://test.com/test-image.png'
    const result = await addMediaNode(imageURL, rootEntity)

    // Verify the result is the expected entity UUID
    expect(result).toBe(mockEntityUUID)
  })

  it('should load an audio file', async () => {
    // Mock EditorControlFunctions.createObjectFromSceneElement
    const mockEntityUUID = 'mock-audio-uuid' as EntityUUID
    vi.spyOn(EditorControlFunctions, 'createObjectFromSceneElement').mockReturnValue({
      entityUUID: mockEntityUUID,
      sourceID: 'test-audio-source-id'
    })

    // Mock AuthoringState.snapshot to prevent actual snapshot
    vi.spyOn(AuthoringState, 'snapshot').mockImplementation(() => {})

    // Call the function
    const audioURL = 'https://test.com/test-audio.mp3'
    const result = await addMediaNode(audioURL, rootEntity)

    // Verify the result is the expected entity UUID
    expect(result).toBe(mockEntityUUID)
  })
})
