import { GLTF } from '@gltf-transform/core'
import { createEntity, EntityID, setComponent, SourceID, UUIDComponent } from '@ir-engine/ecs'
import { LoadingManager } from 'three'
import { GLTFComponent } from '../../src/gltf/GLTFComponent'
import { DependencyCache, GLTFParserOptions } from '../../src/gltf/GLTFLoaderFunctions'

/**
 * Creates an empty GLTF object with only the required asset property filled in.
 * All array properties are undefined by default, as per the glTF spec which requires
 * arrays to either be undefined or have at least one element.
 *
 * @param generator Optional generator name, defaults to 'IREngine.MockGLTF'
 * @param version Optional version string, defaults to '2.0'
 * @returns An empty IGLTF object with required fields
 */
export function mockGLTF(generator = '@ir-engine/MockGLTF', version = '2.0'): GLTF.IGLTF {
  return {
    asset: {
      version,
      generator
    }
    // All other array properties are undefined by default, as per the glTF spec
  }
}

/**
 * Creates mock GLTFParserOptions for testing
 * @param gltf The GLTF object to use in the options
 * @param url Optional URL for the GLTF file, defaults to 'test.gltf'
 * @returns GLTFParserOptions object for testing
 */
export function mockGLTFOptions(gltf: GLTF.IGLTF, url = 'test.gltf'): GLTFParserOptions {
  const entity = createEntity()
  setComponent(entity, UUIDComponent, { entitySourceID: 'test' as SourceID, entityID: 'test' as EntityID })
  setComponent(entity, GLTFComponent, { src: url, document: gltf })

  // Ensure the dependency cache is set up for this URL
  const cacheKey = `${entity}${url}`
  if (!DependencyCache.has(cacheKey)) DependencyCache.set(cacheKey, new Map())

  return {
    url,
    document: gltf,
    entity,
    body: null,
    manager: new LoadingManager(),
    path: '',
    requestHeader: {},
    signal: new AbortController().signal
  }
}
