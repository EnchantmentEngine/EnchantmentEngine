import { GLTF } from '@gltf-transform/core'
import { Object3D } from 'three'

import { getState } from '@ir-engine/hyperflux'
import { DomainConfigState } from '@ir-engine/spatial/src/resources/DomainConfigState'
import { pathIndentifiers } from '@ir-engine/spatial/src/resources/parseSceneJSON'

export const getCacheRegex = (fileServer: string) => {
  return new RegExp(`${fileServer}\/projects`)
}

/**
 * Handles encoding and decoding scene path symbols from gltfs
 * @param gltf
 * @param mode 'encode' or 'decode'
 */
export const handleScenePaths = (gltf: GLTF.IGLTF, mode: 'encode' | 'decode') => {
  const cloudDomain = getState(DomainConfigState).cloudDomain
  const cacheRe = getCacheRegex(cloudDomain)
  const symbolRe = /__\$project\$__/
  const frontier = [...(gltf.scenes ?? []), ...(gltf.nodes ?? [])]
  while (frontier.length > 0) {
    const elt = frontier.pop()
    if (typeof elt === 'object' && elt !== null) {
      for (const [k, v] of Object.entries(elt)) {
        if (!!v && typeof v === 'object' && !(v as Object3D).isObject3D) {
          frontier.push(v)
        }
        if (mode === 'encode') {
          if (typeof v === 'string' && cacheRe.test(v)) {
            elt[k] = v.replace(cacheRe, pathIndentifiers.sceneRelative)
          }
        }
        if (mode === 'decode') {
          if (typeof v === 'string' && symbolRe.test(v)) {
            elt[k] = v.replace(symbolRe, `${cloudDomain}/projects`)
          }
        }
      }
    }
  }
  return gltf
}
