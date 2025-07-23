/**
 * guessContentType function to get contentType from url.
 *
 * @param  {any} url
 * @return {string}     [contentType]
 */
import { CommonKnownContentTypes } from './CommonKnownContentTypes'

export function guessContentType(url: string): string {
  const contentPath = new URL(url).pathname
  //check for xre gltf extension
  if (/\.material\.gltf$/.test(contentPath)) {
    return CommonKnownContentTypes.material
  } else if (/\.prefab\.gltf$/.test(contentPath)) {
    return CommonKnownContentTypes.prefab
  } else if (/\.lookdev\.gltf$/.test(contentPath)) {
    return CommonKnownContentTypes.lookdev
  }
  const extension = contentPath.split('.').pop()!
  return CommonKnownContentTypes[extension]
}
