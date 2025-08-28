import {
  defineComponent,
  ECSState,
  Entity,
  getOptionalComponent,
  PresentationSystemGroup,
  useComponent
} from '@ir-engine/ecs'
import { SystemUUID, useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { getState, NO_PROXY, Schema, SchemaDefinition, State, Static, useHookstate } from '@ir-engine/hyperflux'
import {
  MaterialPluginComponents,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { removePlugin, setPlugin } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import React, { useEffect } from 'react'
import { Color, Shader, Texture, Uniform, Vector2, Vector3, Vector4, WebGLRenderer } from 'three'

/**
 * A JSON Schema for a texture uniform.
 * - `string` for remote textures
 * - `null` for no texture
 */
export const TextureSchema = () =>
  Schema.Union([Schema.String(), Schema.Null(), Schema.Type<Texture>()], {
    default: null,
    metadata: { $isTexture: true }
  }) // @todo replace $isTexture with $id

export const isTextureUniform = (uniformSchema: SchemaDefinition) => !!uniformSchema.options?.metadata?.$isTexture

/**
 *
 * @usage
 * const MyPlugin = defineMaterialPlugin({
 *   name: 'MyPlugin',
 *
 *   jsonID: 'IR_material_custom',
 *
 *   uniforms: {
 *     time: 0,
 *     enabled: true
 *   },
 *
 *   onApply: (shader, renderer, uniforms) => {
 *     shader.fragmentShader = shader.fragmentShader.replace(
 *       'void main() {',
 *       `
 *         uniform float time;
 *         uniform bool enabled;
 *
 *         void main() {
 *       `
 *     )
 *       shader.uniforms.time.value = uniforms.time
 *       shader.uniforms.boolean.value = uniforms.boolean
 *   },
 *
 *   update: (deltaSeconds, uniforms) => {
 *     uniforms.float.value += deltaSeconds
 *   }
 * })
 **/

export type ValidUniformTypes = boolean | number | string | Vector2 | Vector3 | Vector4 | Color | Texture

export type UniformRecord = Record<string, ValidUniformTypes>

export const defineMaterialPlugin = <T extends SchemaDefinition>({
  name,
  jsonID,
  uniforms: uniformSchema,
  onApply,
  update,
  reactor: Reactor
}: {
  name: string
  jsonID: string
  uniforms: T
  onApply: (shader: Shader, renderer: WebGLRenderer) => void
  update?: (component: Static<T>, deltaSeconds: number) => void
  reactor?: (props: { entity: Entity; textureState: State<Record<string, Texture | null>> }) => any
}) => {
  const PluginComponent = defineComponent({
    name,

    jsonID,

    schema: uniformSchema,

    reactor: ({ entity }) => {
      /** Suspend context until material exists */
      const material = useComponent(entity, MaterialStateComponent).material

      const pluginState = useComponent(entity, PluginComponent) as UniformRecord

      const textureUniformState = useHookstate(
        () =>
          Object.fromEntries(
            Object.entries(uniformSchema.properties!)
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
            Object.entries(pluginState).map(([key, value]) => {
              if (isTextureUniform(uniformSchema.properties![key])) return [key, new Uniform(null)]
              return [key, new Uniform(value !== null && typeof value === 'object' && 'index' in value ? null : value)]
            })
          ) as Record<keyof UniformRecord, Uniform>
      ).get(NO_PROXY) as Record<keyof UniformRecord, Uniform>

      for (const key in textureUniforms) {
        const src = pluginState[key]
        const [texture] = useTexture(typeof src === 'string' ? src : '', entity)
        useEffect(() => {
          textureUniformState[key].nested('value').set(texture)
          textureState[key].set(texture)
        }, [texture])
      }

      useEffect(() => {
        const callback = (shader: Shader, renderer: WebGLRenderer) => {
          for (const key in uniforms) {
            shader.uniforms[key] = uniforms[key]
          }

          onApply(shader, renderer)
        }
        setPlugin(material, callback)
        return () => {
          removePlugin(material, callback)
        }
      }, [material])

      useExecute(
        () => {
          const uniformValues = getOptionalComponent(entity, PluginComponent)
          if (!uniformValues) return
          if (update) update(uniformValues, getState(ECSState).deltaSeconds)
          for (const key in uniforms) {
            uniforms[key].value = key in textureUniforms ? textureUniforms[key].value : uniformValues[key]
          }
        },
        { before: PresentationSystemGroup, uuid: makeMaterialPluginUpdateSystemID(name, entity) }
      )

      return Reactor ? <Reactor entity={entity} textureState={textureState} /> : null
    }
  })

  MaterialPluginComponents[name] = PluginComponent

  return PluginComponent
}

export const makeMaterialPluginUpdateSystemID = (pluginName: string, entity: Entity) =>
  (pluginName + 'MaterialPluginUpdateSystem' + entity) as SystemUUID
