/**
 * Captures org name, project name and asset path from a URL.
 * For eg: `https://example.com/projects/enchantmentengine/default-project/assets/animations/locomotion.glb` will capture following groups
 * - `ir-engine` => Group 1
 * - `default-project` => Group 2
 * - `assets/animations/locomotion.glb` => Group 3
 */
export const STATIC_ASSET_REGEX =
  /^(?:.*\/(?:projects|static-resources)\/([^\/]*)\/([^\/]*)\/((?:assets\/|public\/).*)$)/

export function getBasePath(path: string) {
  const regex = new RegExp(`(.*/(?:projects|static-resources)/[^/]*)`)
  return regex.exec(path)![0]
}

export function getFileDirectory(path: string) {
  return /^https:\/\/[^/]+\/[^/]+\/(.+?)\/[^/]+\.*$/.exec(path)?.[1] ?? ''
}

export function getFileName(path: string) {
  return path.split(/[\\/]/).pop()?.split('?')[0] ?? ''
}

export function getRelativeURI(path: string) {
  return STATIC_ASSET_REGEX.exec(path)?.[3] ?? ''
}

export function getProjectName(path: string) {
  const match = STATIC_ASSET_REGEX.exec(path)
  if (!match?.length) return ''
  const [, orgName, projectName] = match!
  return `${orgName}/${projectName}`
}

export function modelResourcesPath(modelName: string) {
  return `model-resources/${modelName.split('.').at(-2)!}`
}
