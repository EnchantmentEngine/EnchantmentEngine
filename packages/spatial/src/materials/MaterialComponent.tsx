import {
  BackSide,
  Color,
  DoubleSide,
  FrontSide,
  IUniform,
  Material,
  MeshStandardMaterial,
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
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  useComponent,
  useExecute
} from '@ir-engine/ecs'
import { Entity, EntityUUID, UndefinedEntity } from '@ir-engine/ecs/src/Entity'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, defineState, getState, useHookstate } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { NameComponent } from '../common/NameComponent'
import { useTexture } from '../resources/resourceLoaderHooks'
import { T } from '../schema/schemaFunctions'

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

export const MaterialMapState = defineState({
  name: 'MaterialMapState',
  initial: () => {
    const map = new Map<Entity, Material>()
    map.set(
      UndefinedEntity,
      new MeshStandardMaterial({
        name: 'Fallback Material',
        color: 0xffffff,
        emissive: 0x000000,
        metalness: 1,
        roughness: 1,
        transparent: false,
        depthTest: true,
        side: FrontSide
      })
    )
    return map
  }
})

export const MaterialPluginComponents = {} as Record<string, ComponentType<any>>

const getMaterialPrototype = (entity: Entity): typeof Material => {
  return (
    Object.values(MaterialPluginComponents)
      .find((component) => component.getPrototype && hasComponent(entity, component))
      ?.getPrototype() ?? MeshStandardMaterial
  )
}

const MaterialUniformSchemaProperties = {
  /**
   * These schema properties map directly to threejs' internal uniforms.
   */
  opacity: S.Number({ default: 1, minimum: 0, maximum: 1 }),
  diffuse: T.Color(), // Material.color
  envMap: TextureSchema(),
  envMapIntensity: S.Number({ default: 1, minimum: 0, maximum: 1 }),
  map: TextureSchema(),
  alphaMap: TextureSchema(),
  emissiveMap: TextureSchema(),
  specularMap: TextureSchema(),
  alphaTest: S.Number({ default: 0, minimum: 0, maximum: 1 })
}

const PBRMaterialUniformSchemaProperties = {
  bumpMap: TextureSchema(),
  bumpScale: S.Number({ default: 1, minimum: 0 }),
  displacementMap: TextureSchema(),
  emissive: T.Color(),
  emissiveIntensity: S.Number({ default: 1, minimum: 0, maximum: 1 }),
  normalMap: TextureSchema(),
  metalness: S.Number({ default: 1, minimum: 0, maximum: 1 }),
  metalnessMap: TextureSchema(),
  roughness: S.Number({ default: 1, minimum: 0, maximum: 1 }),
  roughnessMap: TextureSchema()
}

const MaterialUniformSchema = S.Object({
  ...MaterialUniformSchemaProperties,
  ...PBRMaterialUniformSchemaProperties
})

export const MaterialComponent = defineComponent({
  name: 'MaterialComponent',

  jsonID: 'IR_material',

  schema: S.Object({
    ...MaterialUniformSchemaProperties,
    ...PBRMaterialUniformSchemaProperties,
    alphaMode: S.LiteralUnion(['OPAQUE', 'MASK', 'BLEND'], { default: 'OPAQUE' }),
    alphaCutoff: S.Number({ default: 0.5, minimum: 0, maximum: 1 }),
    side: S.LiteralUnion([FrontSide, BackSide, DoubleSide], { default: FrontSide }),
    vertexColors: S.Bool({ default: false }),
    flatShading: S.Bool({ default: false })
  }),

  reactor: ({ entity }) => {
    const component = useComponent(entity, MaterialComponent)

    /** Only pass in properties that are uniforms */
    useUniforms(entity, MaterialUniformSchema, component)

    return null
  },

  get: (entity: Entity) => {
    if (entity === UndefinedEntity) {
      return getState(MaterialMapState).get(UndefinedEntity)!
    }
    if (!hasComponent(entity, MaterialComponent)) {
      return console.warn(`MaterialComponent.get(${entity}) called on entity without MaterialComponent.`)
    }
    const state = getState(MaterialMapState)
    if (!state.has(entity)) lazilyCreateMaterial(entity)
    return state.get(entity)
  }
})

export const MaterialInstanceComponent = defineComponent({
  name: 'MaterialInstanceComponent',
  schema: S.Object({ entities: S.Array(S.Union([S.Entity(), S.Undefined()])) })
})

const lazilyCreateMaterial = (entity: Entity) => {
  const state = getState(MaterialMapState)
  const materialComponent = getComponent(entity, MaterialComponent)
  const prototype = getMaterialPrototype(entity)
  const material = new prototype()

  Object.assign(material, {
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
    },
    set entity(value) {
      throw new Error('Cannot set entity of proxified object')
    },
    get diffuse() {
      return materialComponent.diffuse
    },
    set diffuse(value) {
      throw new Error('Cannot set diffuse of proxified object')
    },
    get emissive() {
      return materialComponent.emissive
    },
    set emissive(value) {
      throw new Error('Cannot set emissive of proxified object')
    },
    get emissiveIntensity() {
      return materialComponent.emissiveIntensity
    },
    set emissiveIntensity(value) {
      throw new Error('Cannot set emissiveIntensity of proxified object')
    },
    get envMap() {
      return materialComponent.envMap
    },
    set envMap(value) {
      throw new Error('Cannot set envMap of proxified object')
    },
    get envMapIntensity() {
      return materialComponent.envMapIntensity
    },
    set envMapIntensity(value) {
      throw new Error('Cannot set envMapIntensity of proxified object')
    },
    get map() {
      return materialComponent.map
    },
    set map(value) {
      throw new Error('Cannot set map of proxified object')
    },
    get alphaMap() {
      return materialComponent.alphaMap
    },
    set alphaMap(value) {
      throw new Error('Cannot set alphaMap of proxified object')
    },
    get bumpMap() {
      return materialComponent.bumpMap
    },
    set bumpMap(value) {
      throw new Error('Cannot set bumpMap of proxified object')
    },
    get bumpScale() {
      return materialComponent.bumpScale
    },
    set bumpScale(value) {
      throw new Error('Cannot set bumpScale of proxified object')
    },
    get normalMap() {
      return materialComponent.normalMap
    },
    set normalMap(value) {
      throw new Error('Cannot set normalMap of proxified object')
    },
    get displacementMap() {
      return materialComponent.displacementMap
    },
    set displacementMap(value) {
      throw new Error('Cannot set displacementMap of proxified object')
    },
    get emissiveMap() {
      return materialComponent.emissiveMap
    },
    set emissiveMap(value) {
      throw new Error('Cannot set emissiveMap of proxified object')
    },
    get specularMap() {
      return materialComponent.specularMap
    },
    set specularMap(value) {
      throw new Error('Cannot set specularMap of proxified object')
    },
    get alphaTest() {
      return materialComponent.alphaTest
    },
    set alphaTest(value) {
      throw new Error('Cannot set alphaTest of proxified object')
    },
    get opacity() {
      return materialComponent.opacity
    },
    set opacity(value) {
      throw new Error('Cannot set opacity of proxified object')
    },
    get side() {
      return materialComponent.side
    },
    set side(value) {
      throw new Error('Cannot set side of proxified object')
    },
    get alphaMode() {
      return materialComponent.alphaMode
    },
    set alphaMode(value) {
      throw new Error('Cannot set alphaMode of proxified object')
    },
    get alphaCutoff() {
      return materialComponent.alphaCutoff
    },
    set alphaCutoff(value) {
      throw new Error('Cannot set alphaCutoff of proxified object')
    },
    get vertexColors() {
      return materialComponent.vertexColors
    },
    set vertexColors(value) {
      throw new Error('Cannot set vertexColors of proxified object')
    },
    get flatShading() {
      return materialComponent.flatShading
    },
    set flatShading(value) {
      throw new Error('Cannot set flatShading of proxified object')
    }
  })
  state.set(entity, material)
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
