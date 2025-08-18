import {
  defineComponent,
  ECSState,
  Entity,
  getOptionalComponent,
  PresentationSystemGroup,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { SystemUUID, useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { getState, NO_PROXY, SchemaDefinition, Static, useHookstate } from '@ir-engine/hyperflux'
import {
  MaterialPluginComponents,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import React, { useEffect } from 'react'
import { Color, Texture, Vector2, Vector3, Vector4 } from 'three'
import { code, texture, uniform } from 'three/tsl'
import { NodeMaterial } from 'three/webgpu'

export type ValidNodeUniformTypes = boolean | number | string | Vector2 | Vector3 | Vector4 | Color | Texture

export type NodeUniformRecord = Record<string, ValidNodeUniformTypes>

const isTextureUniform = (uniformSchema: SchemaDefinition) => !!uniformSchema.options?.metadata?.$isTexture

export const defineNodeMaterialPlugin = <T extends SchemaDefinition>({
  name,
  jsonID,
  uniforms: uniformSchema,
  wgslCode,
  onApplyNode,
  update,
  reactor: Reactor
}: {
  name: string
  jsonID: string
  uniforms: T
  wgslCode?: string
  onApplyNode: (material: NodeMaterial, uniforms: Record<string, any>) => void
  update?: (material: NodeMaterial, component: Static<T>, deltaSeconds: number) => void
  reactor?: any
}) => {
  const PluginComponent = defineComponent({
    name,
    jsonID,
    schema: uniformSchema,

    onSet: (_, component, json) => {
      if (!json) return
      Object.entries(json).forEach(([key, value]) => {
        ;(component as any)[key].set(value)
      })
    }
  })

  MaterialPluginComponents[name] = PluginComponent

  const makeMaterialPluginUpdateSystemID = (pluginName: string, entity: Entity): SystemUUID =>
    ('MaterialPlugin' + pluginName + entity) as SystemUUID

  PluginComponent.reactor = () => {
    const entity = useEntityContext()
    const materialComponent = useComponent(entity, MaterialStateComponent)
    const material = materialComponent.material

    if (!(material instanceof NodeMaterial)) {
      console.warn(`${name}: Plugin can only be applied to NodeMaterial instances`)
      return null
    }

    const textureUniforms = useHookstate({} as Record<string, { value: Texture | null }>)
    const uniforms = useHookstate({} as Record<string, { value: ValidNodeUniformTypes }>)

    useEffect(() => {
      Object.entries(uniformSchema).forEach(([key, schema]) => {
        if (isTextureUniform(schema)) {
          textureUniforms[key].set({ value: null })
        } else {
          uniforms[key].set({ value: (schema as any).default })
        }
      })
    }, [])

    Object.entries(uniformSchema).forEach(([key, schema]) => {
      if (isTextureUniform(schema)) {
        const component = getOptionalComponent(entity, PluginComponent)
        const texturePath = component?.[key]
        const [texture] = useTexture(texturePath, entity)
        useEffect(() => {
          textureUniforms[key].set({ value: texture })
        }, [texture])
      }
    })

    useEffect(() => {
      try {
        const currentUniforms = uniforms.get(NO_PROXY)
        const currentTextureUniforms = textureUniforms.get(NO_PROXY)
        const uniformValues: Record<string, any> = {}

        Object.entries(currentUniforms).forEach(([key, uniform]) => {
          uniformValues[key] = uniform?.value ?? (uniformSchema[key] as any)?.default ?? null
        })

        Object.entries(currentTextureUniforms).forEach(([key, uniform]) => {
          uniformValues[key] = uniform?.value ?? null
        })

        const componentValues = getOptionalComponent(entity, PluginComponent)
        if (componentValues) {
          Object.entries(componentValues).forEach(([key, value]) => {
            if (key !== 'entity') {
              // Skip the entity property
              uniformValues[key] = value
            }
          })
        }

        console.log(`${name}: Applying with uniforms:`, uniformValues)

        onApplyNode(material as NodeMaterial, uniformValues)

        if (wgslCode && material instanceof NodeMaterial) {
          material.userData = material.userData || {}
          material.userData.customWGSL = wgslCode
          material.userData.hasCustomWGSL = true
          try {
            const customWGSLNode = code(wgslCode)
            material.userData.customWGSLNode = customWGSLNode
          } catch (error) {
            console.warn('WGSL code could not be compiled, using TSL nodes instead:', error)
          }
        }

        material.needsUpdate = true
      } catch (error) {
        console.error(`${name}: Error applying node material plugin:`, error)
      }
    }, [material, uniforms, textureUniforms])

    useExecute(
      () => {
        const uniformValues = getOptionalComponent(entity, PluginComponent)
        if (!uniformValues) return
        if (update) update(material, uniformValues, getState(ECSState).deltaSeconds)

        const uniformsValue = uniforms.get(NO_PROXY)
        for (const key in uniformsValue) {
          if (uniformValues && typeof uniformValues === 'object' && key in uniformValues) {
            uniforms[key].set({ value: (uniformValues as any)[key] })
          }
        }
      },
      { before: PresentationSystemGroup, uuid: makeMaterialPluginUpdateSystemID(name, entity) }
    )

    return Reactor ? <Reactor entity={entity} /> : null
  }

  return PluginComponent
}

export const createUniformNode = (value: ValidNodeUniformTypes) => {
  if (typeof value === 'number') return uniform(value)
  if (typeof value === 'boolean') return uniform(value ? 1 : 0)
  if (value instanceof Vector2) return uniform(value)
  if (value instanceof Vector3) return uniform(value)
  if (value instanceof Vector4) return uniform(value)
  if (value instanceof Color) return uniform(value)
  if (value instanceof Texture) return texture(value)
  return uniform(value)
}

export const createWGSLFunctionNode = (wgslCode: string) => {
  return code(wgslCode)
}
