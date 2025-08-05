import {
  Color,
  FrontSide,
  IUniform,
  Material,
  MeshStandardMaterial as MeshStandardMaterial0,
  Texture,
  Uniform,
  Vector2,
  Vector3,
  Vector4
} from 'three'

import {
  ComponentType,
  ECSState,
  PresentationSystemGroup,
  Schema,
  Static,
  TObjectSchema,
  TProperties,
  UUIDComponent,
  createEntity,
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useExecute,
  useOptionalComponent
} from '@ir-engine/ecs'
import { Entity, EntityUUID, EntityUUIDPair } from '@ir-engine/ecs/src/Entity'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, defineState, getMutableState, getState, none, useHookstate } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { NameComponent } from '../../common/NameComponent'
import { useTexture } from '../../resources/resourceLoaderHooks'
import { T } from '../../schema/schemaFunctions'
import { MeshComponent } from '../components/MeshComponent'
import { setMeshMaterial } from './materialFunctions'

/**
 * A JSON Schema for a texture uniform.
 * - `string` for remote textures
 * - `null` for no texture
 */
export const TextureSchema = () =>
  S.Union([S.String(), S.Null(), S.Type<Texture>()], { default: null, metadata: { $isTexture: true } }) // @todo replace $isTexture with $id

export type TextureSchemaType = Static<ReturnType<typeof TextureSchema>>

export const isTextureUniform = (uniformSchema: Schema) => !!uniformSchema.options?.metadata?.$isTexture

export type ValidUniformTypes = boolean | number | string | Vector2 | Vector3 | Vector4 | Color | Texture | null

export type UniformRecord = Record<string, ValidUniformTypes>

export const useUniforms = <T extends TObjectSchema<TProperties>>(
  entity: Entity,
  schemas: T,
  uniformValues: UniformRecord,
  onUpdate?: (uniforms: Static<T>, deltaSeconds: number) => void
) => {
  const textureUniformState = useHookstate(
    () =>
      Object.fromEntries(
        Object.entries(schemas.properties!)
          .filter(([key, value]) => isTextureUniform(value))
          .map(([key, value]) => [key, new Uniform(null)])
      ) as Record<keyof UniformRecord, Uniform<Texture | null>>
  )

  const textureUniforms = textureUniformState.get(NO_PROXY) as Record<keyof UniformRecord, Uniform<Texture | null>>
  const textureState = useHookstate(
    () =>
      Object.fromEntries(Object.keys(textureUniforms).map((key) => [key, null])) as Record<
        keyof UniformRecord,
        Texture | null
      >
  )

  const uniforms = useHookstate(
    () =>
      Object.fromEntries(
        Object.entries(schemas.properties)
          .map(([key, value]) => {
            if (isTextureUniform(schemas.properties![key])) return [key, new Uniform(null)]
            return [key, new Uniform(value !== null && typeof value === 'object' && 'index' in value ? null : value)]
          })
          .filter(Boolean)
      ) as Record<keyof UniformRecord, Uniform>
  ).get(NO_PROXY) as Record<keyof UniformRecord, Uniform>

  for (const key in textureUniforms) {
    const src = uniformValues[key]
    const [texture] = useTexture(typeof src === 'string' ? src : '', entity)
    useEffect(() => {
      textureUniformState[key].nested('value').set(texture)
      textureState[key].set(texture)
    }, [texture])
  }

  useExecute(
    () => {
      if (!uniformValues) return
      if (onUpdate) onUpdate(uniforms, getState(ECSState).deltaSeconds)
      for (const key in uniforms) {
        uniforms[key].value = key in textureUniforms ? textureUniforms[key].value : uniformValues[key]
      }
    },
    { before: PresentationSystemGroup }
  )

  return { textureState, uniforms }
}

/**
 * Material System
 * - automatically synchronizes material changes to the mesh, including fallback for unassigned materials
 * - extensible via material plugins
 */

export type SerializedTexture = {
  source: string
  channel: number
  repeat: Vector2
  offset: Vector2
}

export const MaterialPluginComponents = {} as Record<string, ComponentType<any>>

const MaterialUniformSchemaProperties = {
  /**
   * These schema properties map directly to threejs' internal uniforms.
   */
  opacity: S.Number({ default: 1, minimum: 0, maximum: 1 }),
  diffuse: T.Color(), // Material.color
  emissive: T.Color(),
  emissiveIntensity: S.Number({ default: 1, minimum: 0, maximum: 1 }),
  alphaMap: TextureSchema(),
  bumpMap: TextureSchema(),
  bumpScale: S.Number({ default: 1, minimum: 0 }),
  normalMap: TextureSchema(),
  displacementMap: TextureSchema(),
  emissiveMap: TextureSchema(),
  specularMap: TextureSchema(),
  alphaTest: S.Number({ default: 0, minimum: 0, maximum: 1 })
}

// advanced material properties

// metallic: number
// roughness: number
// occlusionMap: texture
// occlusionStrength: number

// lightMap: texture
// aoMap: texture

const MaterialUniformSchema = S.Object(MaterialUniformSchemaProperties)

export const MaterialComponent = defineComponent({
  name: 'MaterialComponent',

  jsonID: 'IR_material',

  schema: S.Object({
    ...MaterialUniformSchemaProperties,
    alphaMode: S.LiteralUnion(['OPAQUE', 'MASK', 'BLEND'], { default: 'OPAQUE' }),
    alphaCutoff: S.Number({ default: 0.5, minimum: 0, maximum: 1 }),
    doubleSided: S.Bool({ default: false })
  }),

  reactor: ({ entity }) => {
    const component = useComponent(entity, MaterialComponent)

    /** Only pass in properties that are uniforms */
    useUniforms(entity, MaterialUniformSchema, component)

    return null
  }
})

export const MaterialStateComponent = defineComponent({
  name: 'MaterialStateComponent',

  jsonID: 'IR_material_old',

  schema: S.Object({
    material: S.Type<Material>(),
    // serialized data (textures as URLs, colors as numbers etc)
    parameters: S.Record(S.String(), S.Any())
  }),

  fallbackMaterialUUIDPair: {
    entitySourceID: 'fallback',
    entityID: 'material'
  } as EntityUUIDPair,

  fallbackMaterial: () => {
    let fallbackMaterialEntity = UUIDComponent.getEntityByUUID(
      UUIDComponent.join(MaterialStateComponent.fallbackMaterialUUIDPair)
    )
    if (!fallbackMaterialEntity) {
      fallbackMaterialEntity = createEntity()
      /**
       * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
       */
      const fallbackMaterial = new MeshStandardMaterial0({
        name: 'Fallback Material',
        color: 0xffffff,
        emissive: 0x000000,
        metalness: 1,
        roughness: 1,
        transparent: false,
        depthTest: true,
        side: FrontSide
      })
      setComponent(fallbackMaterialEntity, UUIDComponent, MaterialStateComponent.fallbackMaterialUUIDPair)
      setComponent(fallbackMaterialEntity, NameComponent, 'Fallback Material')
      setComponent(fallbackMaterialEntity, MaterialStateComponent, { material: fallbackMaterial })
    }
    return fallbackMaterialEntity
  },

  onSet(entity, component, json) {
    if (!json) return
    if (json.material && json.material.isMaterial) {
      component.material = json.material
      Object.assign(json.material, {
        get uuid() {
          return UUIDComponent.get(entity)
        },
        set uuid(value) {
          if (value != undefined) throw new Error('Cannot set uuid of proxified object')
        },
        get name() {
          return getOptionalComponent(entity, NameComponent)
        },
        set name(value) {
          if (value != undefined) throw new Error('Cannot set name of proxified object')
        },
        get entity() {
          return entity
        }
      })
    }
    if (json.parameters) {
      component.parameters = json.parameters
    }
  },

  onRemove: (entity, component) => {
    const instances = getState(MaterialReferenceState)[entity]
    if (!instances) return
    for (const instanceEntity of instances) {
      if (!hasComponent(instanceEntity, MaterialInstanceComponent)) continue
      setMeshMaterial(instanceEntity, getComponent(instanceEntity, MaterialInstanceComponent).entities)
    }
  }
})

const MaterialReferenceState = defineState({
  name: 'MaterialReferenceState',
  // map of MaterialStateComponent entity to MaterialInstanceComponent entities
  initial: () => ({}) as Record<Entity, Entity[]>
})

export const MaterialInstanceComponent = defineComponent({
  name: 'MaterialInstanceComponent',

  schema: S.Object({ entities: S.Array(S.Entity()) }),

  onRemove: (entity) => {
    const entities = getOptionalComponent(entity, MaterialInstanceComponent)?.entities
    if (!entities) return
    for (const materialEntity of entities) {
      const references = getMutableState(MaterialReferenceState)[materialEntity]
      if (!references.value) continue
      if (references.value) references.set(references.value.filter((instance) => instance !== entity))
      if (!references.value.length) references.set(none)
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const materialComponent = useOptionalComponent(entity, MaterialInstanceComponent)

    if (!materialComponent || materialComponent.entities.length === 0) return null

    if (materialComponent.entities.length > 1)
      return (
        <>
          {materialComponent.entities.map((materialEntity, index) => (
            <MaterialInstanceSubReactor
              array={true}
              key={`${materialEntity}-${index}`}
              index={index}
              materialEntity={materialEntity}
              entity={entity}
            />
          ))}
        </>
      )

    return (
      <MaterialInstanceSubReactor
        array={false}
        key={`${materialComponent.entities[0]}`}
        index={0}
        materialEntity={materialComponent.entities[0]}
        entity={entity}
      />
    )
  }
})

const MaterialInstanceSubReactor = (props: {
  array: boolean
  materialEntity: Entity
  entity: Entity
  index: number
}) => {
  const { materialEntity, entity, index } = props

  const materialStateComponent = useOptionalComponent(materialEntity, MaterialStateComponent)
  const meshComponent = useOptionalComponent(entity, MeshComponent)

  useEffect(() => {
    if (!meshComponent || !materialStateComponent) return
    const material = getComponent(materialEntity, MaterialStateComponent).material
    if (props.array) {
      if (!Array.isArray(meshComponent.material)) meshComponent.material = []
      meshComponent.material[index] = material
    } else {
      meshComponent.material = material
    }

    const references = getMutableState(MaterialReferenceState)[materialEntity]
    if (!references.value) references.set([entity])
    else references.merge([entity])
  }, [materialStateComponent?.material, meshComponent])

  return null
}

declare module 'three/src/renderers/shaders/ShaderLib.js' {
  export interface Shader {
    uuid?: EntityUUID
    shaderType: string
    uniforms: { [uniform: string]: IUniform }
    vertexShader: string
    fragmentShader: string
  }
}
