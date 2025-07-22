
import { Color, Material, Mesh, Shader, Texture } from 'three'

import { Entity, getComponent, getMutableComponent, hasComponent } from '@ir-engine/ecs'

import { getState } from '@ir-engine/hyperflux'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialPrototypeDefinitions,
  MaterialStateComponent,
  PrototypeArgument,
  SerializedTexture
} from './MaterialComponent'

export const formatMaterialArgs = (args: any, defaultArgs?: PrototypeArgument) => {
  if (!args) return args
  return Object.fromEntries(
    Object.entries(args)
      .map(([k, v]: [string, any]) => {
        if (!!defaultArgs && defaultArgs[k]) {
          switch (defaultArgs[k].type) {
            case 'color':
              return [k, v ? ((v as Color).isColor ? v : new Color(v)) : undefined]
          }
        }
        const tex = v as Texture
        if (tex?.isTexture) return [k, tex.source.data !== undefined ? v : undefined]
        if (v === '') return [k, undefined]
        return [k, v]
      })
      .filter(([_, v]) => v !== undefined)
  )
}

export const setMeshMaterial = (groupEntity: Entity, newMaterialEntities: Entity[]) => {
  if (!groupEntity) return
  if (!hasComponent(groupEntity, MeshComponent)) return
  if (newMaterialEntities.length === 0) return

  const mesh = getComponent(groupEntity, MeshComponent) as Mesh
  const fallbackMaterial = MaterialStateComponent.fallbackMaterial()
  if (!Array.isArray(mesh.material)) {
    const materialEntity = newMaterialEntities[0] ?? fallbackMaterial
    if (!materialEntity || !hasComponent(materialEntity, MaterialStateComponent)) return
    mesh.material = getComponent(materialEntity, MaterialStateComponent).material
  } else {
    for (let i = 0; i < (mesh.material as Material[]).length; i++) {
      const materialEntity = newMaterialEntities[i] ?? fallbackMaterial
      if (!materialEntity || !hasComponent(materialEntity, MaterialStateComponent)) continue
      mesh.material[i] = getComponent(materialEntity, MaterialStateComponent).material
    }
  }
}

type MaterialCallback = (shader: Shader, renderer: any) => void

export const setPlugin = (material: Material, callback: MaterialCallback) => {
  if (hasPlugin(material, callback)) removePlugin(material, callback)
  material.onBeforeCompile = callback
  material.needsUpdate = true // @warning This is actually a setter (with no getter) that calls ++material.version
}

export const hasPlugin = (material: Material, callback: MaterialCallback) =>
  Boolean(material.plugins?.length && !!material.plugins.find((plugin) => plugin.toString() === callback.toString()))

export const removePlugin = (material: Material, callback: MaterialCallback) => {
  const pluginIndex = material.plugins?.findIndex((plugin) => plugin === callback)
  if (pluginIndex !== undefined && pluginIndex >= 0) material.plugins?.splice(pluginIndex, 1)
}

export const getMaterialIndices = (entity: Entity, materialEntity: Entity): number[] => {
  if (!hasComponent(entity, MaterialInstanceComponent)) return [] as number[]
  const materialEntities = getComponent(entity, MaterialInstanceComponent).entities
  return materialEntities
    .map((currentEntity, index) => (currentEntity === materialEntity ? index : undefined))
    .filter((x) => x !== undefined) as number[]
}

export const setupMaterialParameters = (entity: Entity, type: string, properties: { [_: string]: any }) => {
  const params = {} as Record<string, any>
  Object.entries(properties).map(([k, v]) => {
    if (!properties[k]) return
    if (typeof v === 'function') return
    if (v.isTexture) {
      const url = v.userData?.url ?? v.userData?.src
      if (url) params[k] = { source: url, channel: v.channel, repeat: v.repeat, offset: v.offset } as SerializedTexture
      return
    }
    if (v.isColor) {
      params[k] = new Color(v).getHex()
      return
    }
    if (typeof v === 'object') return
    params[k] = v
  })
  getMutableComponent(entity, MaterialStateComponent).parameters.merge(params)
  return params
}

export const getMaterialParameterDefaults = (type: string) => {
  const prototype = getState(MaterialPrototypeDefinitions)[type]
  return Object.fromEntries(Object.entries(prototype.arguments).map(([k, v]) => [k, v.default]))
}

export const getMaterialParameterKeys = (type: string) => {
  const prototype = getState(MaterialPrototypeDefinitions)[type]
  if (!prototype) return []
  return Object.keys(prototype.arguments)
}
