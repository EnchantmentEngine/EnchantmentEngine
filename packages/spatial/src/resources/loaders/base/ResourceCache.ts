import Dexie from 'dexie'
import { CompressedPixelFormat, PixelFormat, TextureDataType } from 'three'

/**
 * Normalize URL by removing hash parameters for consistent cache keys
 * @param url The URL with potential hash parameters
 * @returns The normalized URL without hash parameters
 */
export function normalizeURLForCache(url: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.delete('hash')
    return urlObj.toString()
  } catch (error) {
    console.warn('Error normalizing URL for cache:', error)
    return url
  }
}

/**
 * Extract hash from URL search parameters
 * @param url The URL with hash parameter
 * @returns The hash string or null if not found
 */
export function extractHashFromURL(url: string): string | null {
  const urlObj = new URL(url)
  return urlObj.searchParams.get('hash') || null
}

export interface TextureData {
  data: Array<any> | ArrayBuffer
  width: number
  height: number
  format: PixelFormat | CompressedPixelFormat
  type: TextureDataType
}

/**
 * ResourceCache using IndexedDB via Dexie
 * Provides storage for assets and resources with hash-based invalidation
 */
class ResourceCacheDatabase extends Dexie {
  resources: Dexie.Table<{ key: string; value: ArrayBuffer; timestamp: number }, string>
  textures: Dexie.Table<{ key: string; value: TextureData; timestamp: number }, string>
  gltfMetadata: Dexie.Table<{ url: string; hash: string; dependencies: string[]; timestamp: number }, string>

  constructor() {
    super('ir-engine-cache', { cache: 'disabled' })
    this.version(2).stores({
      resources: 'key',
      textures: 'key',
      gltfMetadata: 'url'
    })
  }

  /**
   * Store a resource in the cache
   * @param key The resource key
   * @param value The resource value
   */
  async putResource(key: string, value: ArrayBuffer): Promise<void> {
    await this.resources.put({
      key,
      value,
      timestamp: Date.now()
    })
  }

  /**
   * Get a resource from the cache
   * @param key The resource key
   * @returns The resource value or null if not found
   */
  async getResource(key: string): Promise<Response | null> {
    const resource = await this.resources.get(key)
    return resource ? new Response(resource.value) : null
  }

  /**
   * Check if a resource exists in the cache
   * @param key The resource key
   * @returns True if the resource exists
   */
  async hasResource(key: string): Promise<boolean> {
    return (await this.resources.get(key)) !== undefined
  }

  /**
   * Delete a resource from the cache
   * @param key The resource key
   */
  async deleteResource(key: string): Promise<void> {
    await this.resources.delete(key)
  }

  /**
   * Clear all resources from the cache
   */
  async clearResources(): Promise<void> {
    await this.resources.clear()
  }

  async putTexture(key: string, value: TextureData): Promise<void> {
    await this.textures.put({
      key,
      value,
      timestamp: Date.now()
    })
  }

  async getTexture(key: string): Promise<TextureData | undefined> {
    return (await this.textures.get(key))?.value
  }

  async hasTexture(key: string): Promise<boolean> {
    return (await this.textures.get(key)) !== undefined
  }

  async deleteTexture(key: string): Promise<void> {
    await this.textures.delete(key)
  }

  async clearTextures(): Promise<void> {
    await this.textures.clear()
  }

  /**
   * Store GLTF metadata for cache invalidation
   * @param url The GLTF URL (will be normalized to remove hash parameters)
   * @param hash The hash of the GLTF file (extracted from URL)
   * @param dependencies Array of dependency URLs referenced by this GLTF
   */
  async putGLTFMetadata(url: string, hash: string, dependencies: string[]): Promise<void> {
    const normalizedUrl = normalizeURLForCache(url)
    // Also normalize dependency URLs
    const normalizedDependencies = dependencies.map((dep) => normalizeURLForCache(dep))

    await this.gltfMetadata.put({
      url: normalizedUrl,
      hash,
      dependencies: normalizedDependencies,
      timestamp: Date.now()
    })
  }

  /**
   * Get GLTF metadata for cache validation
   * @param url The GLTF URL (will be normalized to remove hash parameters)
   * @returns The metadata or null if not found
   */
  async getGLTFMetadata(url: string): Promise<{ hash: string; dependencies: string[] } | null> {
    const normalizedUrl = normalizeURLForCache(url)
    const metadata = await this.gltfMetadata.get(normalizedUrl)
    return metadata ? { hash: metadata.hash, dependencies: metadata.dependencies } : null
  }

  /**
   * Invalidate all resources referenced by a GLTF file
   * @param url The GLTF URL (will be normalized to remove hash parameters)
   */
  async invalidateGLTFDependencies(url: string): Promise<void> {
    const normalizedUrl = normalizeURLForCache(url)
    const metadata = await this.getGLTFMetadata(normalizedUrl)
    if (!metadata) return

    let deletePromises = [] as Promise<void>[]
    for (let i = 0; i < metadata.dependencies.length; i++) {
      const depUrl = metadata.dependencies[i]
      deletePromises.push(this.deleteResource(depUrl))
      deletePromises.push(this.deleteTexture(depUrl))
    }

    deletePromises.push(this.deleteResource(normalizedUrl))

    await Promise.all(deletePromises)
    // Remove the GLTF metadata itself
    await this.gltfMetadata.delete(normalizedUrl)
  }

  /**
   * Check if a GLTF file's cache is still valid
   * @param url The GLTF URL (will be normalized to remove hash parameters)
   * @param currentHash The current hash of the GLTF file
   * @returns True if cache is valid, false if invalidated
   */
  async isGLTFCacheValid(url: string, currentHash: string): Promise<boolean> {
    const normalizedUrl = normalizeURLForCache(url)
    const metadata = await this.gltfMetadata.get(normalizedUrl)
    return metadata ? metadata.hash === currentHash : false
  }
}

export const ResourceCache = 'indexedDB' in self ? new ResourceCacheDatabase() : null

if (!ResourceCache) {
  console.warn(`ResourceCache not available, cannot offload texture data`)
}
