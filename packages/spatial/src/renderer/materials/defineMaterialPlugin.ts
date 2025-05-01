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
  defineComponent,
  ECSState,
  getComponent,
  PresentationSystemGroup,
  Schema,
  Static,
  useComponent
} from '@ir-engine/ecs'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { getState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { removePlugin, setPlugin } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { useEffect } from 'react'
import { Color, Material, Shader, Texture, Uniform, Vector2, Vector3, Vector4, WebGLRenderer } from 'three'
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

export const defineMaterialPlugin = <T extends Schema>({
  name,
  jsonID,
  uniforms: uniformSchema,
  onApply,
  update
}: {
  name: string
  jsonID: string
  uniforms: T
  onApply: (shader: Shader, renderer: WebGLRenderer) => void
  update: (component: Static<T>, deltaSeconds: number) => void
}) => {
  const PluginComponent = defineComponent({
    name,

    jsonID,

    schema: uniformSchema,

    reactor: ({ entity }) => {
      /** Suspend context until material exists */
      const material = useComponent(entity, MaterialStateComponent).material.value as Material

      const uniforms = useHookstate(
        () =>
          Object.fromEntries(
            Object.entries(getComponent(entity, PluginComponent) as UniformRecord).map(([key, value]) => [
              key,
              new Uniform(value)
            ])
          ) as Record<keyof Static<T>, Uniform>
      ).get(NO_PROXY) as Record<keyof Static<T>, Uniform>

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
          const uniformValues = getComponent(entity, PluginComponent)
          update(uniformValues, getState(ECSState).deltaSeconds)
          for (const key in uniforms) {
            uniforms[key].value = uniformValues[key]
          }
        },
        { before: PresentationSystemGroup }
      )

      return null
    }
  })

  return PluginComponent
}
