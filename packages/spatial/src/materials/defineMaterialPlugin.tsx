import { defineComponent, Entity, SystemUUID, useComponent } from '@ir-engine/ecs'
import { SchemaDefinition, State, Static, TObjectSchema, TProperties } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { Shader, Texture, WebGLRenderer } from 'three'
import { MaterialComponent, MaterialPluginComponents, UniformRecord, useUniforms } from './MaterialComponent'
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
 *   onApply: (entity, shader, renderer) => {
 *     shader.fragmentShader = shader.fragmentShader.replace(
 *       'void main() {',
 *       `
 *         uniform float time;
 *         uniform bool enabled;
 *
 *         void main() {
 *       `
 *     )
 *   },
 *
 *   update: (deltaSeconds, uniforms) => {
 *     uniforms.float.value += deltaSeconds
 *   }
 * })
 **/

export const defineMaterialPlugin = <T extends SchemaDefinition, Extras = Record<string, unknown>>({
  name,
  jsonID,
  uniforms: uniformSchema,
  onApply,
  onSet,
  onRemove,
  update,
  reactor: Reactor,
  ...extensions
}: {
  name: string
  jsonID?: string
  uniforms: T
  onApply?: (entity: Entity, shader: Shader, renderer: WebGLRenderer) => void
  onSet?: (entity: Entity, component: Static<T>, json: any) => void
  onRemove?: (entity: Entity, component: Static<T>) => void
  update?: (component: Static<T>, deltaSeconds: number) => void
  reactor?: (props: { entity: Entity; textureState: State<Record<string, Texture | null>> }) => any
} & Extras) => {
  const PluginComponent = defineComponent({
    name,

    jsonID,

    schema: uniformSchema,

    onSet,

    onRemove,

    reactor: ({ entity }) => {
      const pluginState = useComponent(entity, PluginComponent) as UniformRecord

      const { textureState, uniforms } = useUniforms(
        entity,
        uniformSchema as TObjectSchema<TProperties>,
        pluginState,
        update
      )

      useEffect(() => {
        if (!onApply) return
        const callback = (shader: Shader, renderer: WebGLRenderer) => {
          for (const key in uniforms) {
            shader.uniforms[key] = uniforms[key]
          }

          onApply(entity, shader, renderer)
        }

        /** Suspend context until material exists */
        const material = MaterialComponent.get(entity)!
        setPlugin(material, callback)
        return () => {
          removePlugin(material, callback)
        }
      }, [])

      return Reactor ? <Reactor entity={entity} textureState={textureState} /> : null
    },

    ...extensions
  })

  MaterialPluginComponents[name] = PluginComponent

  return PluginComponent
}

export const makeMaterialPluginUpdateSystemID = (pluginName: string, entity: Entity) =>
  (pluginName + 'MaterialPluginUpdateSystem' + entity) as SystemUUID
