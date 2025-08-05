import { Material, Shader } from 'three'

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

// export const setupMaterialParameters = (entity: Entity, type: string, properties: { [_: string]: any }) => {
//   const params = {} as Record<string, any>
//   Object.entries(properties).map(([k, v]) => {
//     if (!properties[k]) return
//     if (typeof v === 'function') return
//     if (v.isTexture) {
//       const url = v.userData?.url ?? v.userData?.src
//       if (url) params[k] = { source: url, channel: v.channel, repeat: v.repeat, offset: v.offset } as SerializedTexture
//       return
//     }
//     if (v.isColor) {
//       params[k] = new Color(v).getHex()
//       return
//     }
//     if (typeof v === 'object') return
//     params[k] = v
//   })
//   setComponent(entity, MaterialStateComponent, {
//     parameters: { ...getComponent(entity, MaterialStateComponent).parameters, ...params }
//   })
//   return params
// }
