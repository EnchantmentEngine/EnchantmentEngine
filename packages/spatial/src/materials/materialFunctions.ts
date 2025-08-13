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
