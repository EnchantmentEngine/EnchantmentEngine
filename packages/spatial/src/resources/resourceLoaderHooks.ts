import { useEffect } from 'react'
import { AudioLoader, Texture } from 'three'

import { Entity, UndefinedEntity } from '@ir-engine/ecs'
import { NO_PROXY, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'

import { Resource, ResourceAssetType, ResourceState, ResourceType } from './ResourceState'
import { FileLoader } from './loaders/base/FileLoader'
import { Loader } from './loaders/base/Loader'
import { parseStorageProviderURLs } from './parseSceneJSON'
import { loadResource } from './resourceLoaderFunctions'

const defaultLoaders = {
  fileLoader: new FileLoader(),
  audioLoader: new AudioLoader()
}

function useLoader<T extends ResourceAssetType>(
  url: string,
  resourceType: ResourceType,
  entity: Entity = UndefinedEntity,
  //Called when the asset url is changed, mostly useful for editor functions when changing an asset
  loader?: Loader,
  onUnload: (url: string) => void = (url: string) => {}
): [T | null, ErrorEvent | Error | null, ProgressEvent<EventTarget> | null, () => void] {
  const value = useHookstate<T | null>(null)
  const error = useHookstate<ErrorEvent | Error | null>(null)
  const progress = useHookstate<ProgressEvent<EventTarget> | null>(null)
  const entityResource = useHookstate<Resource[] | null>(null)
  url = parseStorageProviderURLs(url)

  const unload = () => {
    if (url && entityResource.value) {
      for (const resource of entityResource.value) {
        if (resource.id === url) {
          ResourceState.removeEntityResource(resource as Resource)
        }
      }
    }
  }

  useEffect(() => {
    return unload
  }, [])

  useImmediateEffect(() => {
    const _url = url
    if (!_url) return
    let completed = false

    const controller = new AbortController()
    loadResource<T>(
      _url,
      resourceType,
      entity,
      (response) => {
        completed = true
        value.set(response)
        entityResource.set(ResourceState.addEntityResource(entity, response))
      },
      (request) => {
        progress.set(request)
      },
      (err) => {
        // Effect was unmounted, can't set error state safely
        if (controller.signal.aborted) return
        completed = true
        error.set(err)
      },
      controller.signal,
      loader
    )

    return () => {
      if (!completed)
        controller.abort(
          `resourceHooks:useLoader Component loading ${resourceType} at url ${url} for entity ${entity} was unmounted`
        )

      // ResourceState.unload(_url, entity, uuid.value)
      value.set(null)
      progress.set(null)
      error.set(null)
      onUnload(_url)
    }
  }, [url])

  return [value.get(NO_PROXY) as T | null, error.get(NO_PROXY), progress.get(NO_PROXY), unload]
}

async function getLoader<T extends ResourceAssetType>(
  url: string,
  resourceType: ResourceType,
  entity: Entity = UndefinedEntity,
  loader?: Loader
): Promise<[T | null, () => void, ErrorEvent | Error | null]> {
  return new Promise((resolve) => {
    const controller = new AbortController()
    loadResource<T>(
      url,
      resourceType,
      entity,
      (response) => {
        const resources = ResourceState.addEntityResource(entity, response)
        const unload = () => {
          for (const resource of resources) ResourceState.removeEntityResource(resource)
        }
        resolve([response, unload, null])
      },
      (request) => {},
      (err) => {
        resolve([null, () => {}, err])
      },
      controller.signal,
      loader
    )
  })
}

/**
 *
 * Texture loader hook for use in React Contexts.
 * The asset will be loaded through the ResourceState in ResourceState.ts.
 * The asset will be unloaded and disposed when the component is unmounted or when onUnloadCallback is called.
 *
 * @param url The URL of the texture file to load
 * @param entity *Optional* The entity that is loading the texture, defaults to UndefinedEntity
 * @param params *Optional* LoadingArgs that are passed through to the asset loader
 * @param onUnload *Optional* A callback that is called when the URL is changed and the previous asset is unloaded, only needed for editor specific behavior
 * @returns Tuple of [Texture, Error, Progress, onUnloadCallback]
 */
export function useTexture(
  url: string,
  entity?: Entity,
  onUnload?: (url: string) => void,
  loader?: Loader
): [Texture | null, ErrorEvent | Error | null, ProgressEvent<EventTarget> | null, () => void] {
  return useLoader<Texture>(url, ResourceType.Texture, entity, loader, onUnload)
}

export function useFile(
  url: string,
  entity?: Entity,
  onUnload?: (url: string) => void,
  loader: Loader = defaultLoaders.fileLoader
): [ArrayBuffer | null, ErrorEvent | Error | null, ProgressEvent<EventTarget> | null, () => void] {
  return useLoader<ArrayBuffer>(url, ResourceType.File, entity, loader, onUnload)
}

/**
 *
 * Texture loader function for when you need to load an asset in a non-React context.
 * The asset will be loaded through the ResourceState in ResourceState.ts.
 * The asset will only be unloaded when onUnloadCallback is called, otherwise the asset will be leaked.
 *
 * @param url The URL of the texture file to load
 * @param entity *Optional* The entity that is loading the texture, defaults to UndefinedEntity
 * @param params *Optional* LoadingArgs that are passed through to the asset loader
 * @returns Promise of Tuple of [Texture, onUnloadCallback, Error]
 */
export async function getTextureAsync(
  url: string,
  entity?: Entity,
  loader?: Loader
): Promise<[Texture | null, () => void, ErrorEvent | Error | null]> {
  return getLoader<Texture>(url, ResourceType.Texture, entity, loader)
}

export async function getAudioAsync(
  url: string,
  entity?: Entity
): Promise<[AudioBuffer | null, () => void, ErrorEvent | Error | null]> {
  return getLoader<AudioBuffer>(url, ResourceType.Audio, entity)
}
