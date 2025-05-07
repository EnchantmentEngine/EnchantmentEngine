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
  createEntity,
  defineComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { TriplanarMappingMaterialPlugin } from '@ir-engine/spatial/src/renderer/materials/plugins/TriplanarMappingMaterialPlugin'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { useEffect } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Texture,
  Vector2
} from 'three'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'

export const TerrainMeshComponent = defineComponent({
  name: 'TerrainMeshComponent',
  jsonID: 'EE_terrain_mesh',

  schema: S.Object({
    // Terrain dimensions
    width: S.Number({ default: 100 }),
    height: S.Number({ default: 20 }),
    depth: S.Number({ default: 100 }),

    // Terrain resolution
    widthSegments: S.Number({ default: 100 }),
    depthSegments: S.Number({ default: 100 }),

    // Heightmap
    heightmapURL: S.String({ default: '' }),

    // Physics
    enablePhysics: S.Bool({ default: true }),

    // Materials
    diffuseMap1: S.String({ default: '' }),
    diffuseMap2: S.String({ default: '' }),
    diffuseMap3: S.String({ default: '' }),
    normalMap1: S.String({ default: '' }),
    normalMap2: S.String({ default: '' }),
    normalMap3: S.String({ default: '' }),

    // Texture scaling
    texScale1: T.Vec2(new Vector2(0.1, 0.1)),
    texScale2: T.Vec2(new Vector2(0.1, 0.1)),
    texScale3: T.Vec2(new Vector2(0.1, 0.1)),

    // Material properties
    blendSharpness: S.Number({ default: 2.0 }),
    normalScale: S.Number({ default: 1.0 }),

    // Visibility
    visible: S.Bool({ default: true })
  }),

  errors: ['MISSING_HEIGHTMAP', 'INVALID_DIMENSIONS'],

  reactor: function TerrainMeshReactor({ entity }) {
    const component = useComponent(entity, TerrainMeshComponent)

    // Track loaded textures
    const textureState = useHookstate({
      heightmap: null as Texture | null,
      diffuse1: null as Texture | null,
      diffuse2: null as Texture | null,
      diffuse3: null as Texture | null,
      normal1: null as Texture | null,
      normal2: null as Texture | null,
      normal3: null as Texture | null
    })

    // Load heightmap texture
    const [heightmapTexture] = useTexture(component.heightmapURL.value, entity)

    // Load material textures
    const [diffuse1] = useTexture(component.diffuseMap1.value, entity)
    const [diffuse2] = useTexture(component.diffuseMap2.value, entity)
    const [diffuse3] = useTexture(component.diffuseMap3.value, entity)
    const [normal1] = useTexture(component.normalMap1.value, entity)
    const [normal2] = useTexture(component.normalMap2.value, entity)
    const [normal3] = useTexture(component.normalMap3.value, entity)

    // Update texture state when textures load
    useEffect(() => {
      if (heightmapTexture) textureState.heightmap.set(heightmapTexture)
      if (diffuse1) textureState.diffuse1.set(diffuse1)
      if (diffuse2) textureState.diffuse2.set(diffuse2)
      if (diffuse3) textureState.diffuse3.set(diffuse3)
      if (normal1) textureState.normal1.set(normal1)
      if (normal2) textureState.normal2.set(normal2)
      if (normal3) textureState.normal3.set(normal3)
    }, [heightmapTexture, diffuse1, diffuse2, diffuse3, normal1, normal2, normal3])

    // Create terrain mesh when heightmap is loaded
    useEffect(() => {
      const heightmapTexture = textureState.heightmap.get(NO_PROXY)
      if (!heightmapTexture) return

      // Create terrain mesh
      const terrainMesh = createTerrainMesh(component.get(NO_PROXY), heightmapTexture, {
        diffuse1: textureState.diffuse1.get(NO_PROXY) || null,
        diffuse2: textureState.diffuse2.get(NO_PROXY) || null,
        diffuse3: textureState.diffuse3.get(NO_PROXY) || null,
        normal1: textureState.normal1.get(NO_PROXY) || null,
        normal2: textureState.normal2.get(NO_PROXY) || null,
        normal3: textureState.normal3.get(NO_PROXY) || null
      })

      // Set mesh component
      setComponent(entity, MeshComponent, terrainMesh)

      // Set up physics if enabled
      if (component.enablePhysics.value) {
        setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Scene)
        setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
        setComponent(entity, ColliderComponent, {
          shape: Shapes.Mesh,
          collisionLayer: CollisionGroups.Ground,
          collisionMask: CollisionGroups.Default | CollisionGroups.Avatars
        })
      }

      return () => {
        removeComponent(entity, MeshComponent)
        if (component.enablePhysics.value) {
          removeComponent(entity, RigidBodyComponent)
          removeComponent(entity, ColliderComponent)
        }
      }
    }, [
      component.width.value,
      component.height.value,
      component.depth.value,
      component.widthSegments.value,
      component.depthSegments.value,
      component.enablePhysics.value,
      component.blendSharpness.value,
      component.normalScale.value,
      textureState.heightmap.value,
      textureState.diffuse1.value,
      textureState.diffuse2.value,
      textureState.diffuse3.value,
      textureState.normal1.value,
      textureState.normal2.value,
      textureState.normal3.value
    ])

    return null
  }
})

// Helper function to create a terrain mesh from a heightmap
function createTerrainMesh(
  terrainConfig: any,
  heightmapTexture: Texture | any,
  textures: {
    diffuse1: Texture | null | any
    diffuse2: Texture | null | any
    diffuse3: Texture | null | any
    normal1: Texture | null | any
    normal2: Texture | null | any
    normal3: Texture | null | any
  }
): Mesh {
  // Create geometry
  const geometry = new PlaneGeometry(
    terrainConfig.width,
    terrainConfig.depth,
    terrainConfig.widthSegments,
    terrainConfig.depthSegments
  )

  // Rotate to horizontal plane
  geometry.rotateX(-Math.PI / 2)

  // Create heightmap data
  const heightmapData = getHeightmapData(
    heightmapTexture,
    terrainConfig.widthSegments + 1,
    terrainConfig.depthSegments + 1
  )

  // Apply heightmap to geometry
  applyHeightmapToGeometry(geometry, heightmapData, terrainConfig.height)

  // Create a standard material
  const material = new MeshStandardMaterial({
    roughness: 1.0,
    metalness: 0.0,
    side: DoubleSide
  })

  // Create mesh
  const mesh = new Mesh(geometry, material)
  mesh.name = 'TerrainMesh'
  mesh.castShadow = true
  mesh.receiveShadow = true

  // Create a material entity for the plugin
  const materialEntity = createEntity()

  // Set the material state component
  setComponent(materialEntity, MaterialStateComponent, { material })

  // Configure texture wrapping and filtering for all textures
  if (textures.diffuse1) {
    textures.diffuse1.wrapS = textures.diffuse1.wrapT = RepeatWrapping
    textures.diffuse1.minFilter = LinearMipmapLinearFilter
  }
  if (textures.diffuse2) {
    textures.diffuse2.wrapS = textures.diffuse2.wrapT = RepeatWrapping
    textures.diffuse2.minFilter = LinearMipmapLinearFilter
  }
  if (textures.diffuse3) {
    textures.diffuse3.wrapS = textures.diffuse3.wrapT = RepeatWrapping
    textures.diffuse3.minFilter = LinearMipmapLinearFilter
  }
  // Do the same for normal maps if needed

  // Apply the triplanar mapping plugin
  setComponent(materialEntity, TriplanarMappingMaterialPlugin, {
    diffuseMap1: textures.diffuse1 || null,
    diffuseMap2: textures.diffuse2 || null,
    diffuseMap3: textures.diffuse3 || null,
    normalMap1: textures.normal1 || null,
    normalMap2: textures.normal2 || null,
    normalMap3: textures.normal3 || null,
    texScale1: terrainConfig.texScale1,
    texScale2: terrainConfig.texScale2,
    texScale3: terrainConfig.texScale3,
    blendSharpness: terrainConfig.blendSharpness,
    normalScale: terrainConfig.normalScale
  })

  return mesh
}

// Extract heightmap data from texture
function getHeightmapData(heightmapTexture: Texture, width: number, height: number): Float32Array {
  // Create a canvas to read pixel data
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    console.error('Could not get 2D context for heightmap canvas')
    return new Float32Array(width * height)
  }

  // Draw the texture to the canvas
  context.drawImage(heightmapTexture.image, 0, 0, width, height)

  // Get the pixel data
  const imageData = context.getImageData(0, 0, width, height)
  const pixels = imageData.data

  // Convert to height values (using red channel)
  const heightData = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    // Use red channel (0-255) and normalize to 0-1
    heightData[i] = pixels[i * 4] / 255
  }

  return heightData
}

// Apply heightmap data to geometry
function applyHeightmapToGeometry(geometry: BufferGeometry, heightData: Float32Array, maxHeight: number): void {
  const positionAttribute = geometry.getAttribute('position') as BufferAttribute
  const positions = positionAttribute.array as Float32Array

  // Apply height to each vertex
  for (let i = 0; i < positions.length / 3; i++) {
    const index = i * 3
    // Y is up in Three.js
    positions[index + 1] = heightData[i] * maxHeight
  }

  // Update position attribute
  positionAttribute.needsUpdate = true

  // Recompute normals
  geometry.computeVertexNormals()
}
