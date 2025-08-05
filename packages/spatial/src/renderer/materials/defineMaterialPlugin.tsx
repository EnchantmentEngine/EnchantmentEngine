import {
  defineComponent,
  Entity,
  Schema,
  Static,
  SystemUUID,
  TObjectSchema,
  TProperties,
  useComponent
} from '@ir-engine/ecs'
import { State } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { Shader, Texture, WebGLRenderer } from 'three'
import { MaterialPluginComponents, MaterialStateComponent, UniformRecord, useUniforms } from './MaterialComponent'
import { removePlugin, setPlugin } from './materialFunctions'

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

export const defineMaterialPlugin = <T extends Schema>({
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

      const { textureState, uniforms } = useUniforms(
        entity,
        uniformSchema as TObjectSchema<TProperties>,
        pluginState,
        update
      )

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

      return Reactor ? <Reactor entity={entity} textureState={textureState} /> : null
    }
  })

  MaterialPluginComponents[name] = PluginComponent

  return PluginComponent
}

export const makeMaterialPluginUpdateSystemID = (pluginName: string, entity: Entity) =>
  (pluginName + 'MaterialPluginUpdateSystem' + entity) as SystemUUID
