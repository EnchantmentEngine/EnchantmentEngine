import { useHookstate } from '@hookstate/core'
import {
  Entity,
  EntityTreeComponent,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  entityExists,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'

/**
 *
 * GLTF loader hook for use in React Contexts.
 * Creates an entity with a GLTFComponent as a child of the provided parentEntity param
 * Returns the root entity of the GLTF after the GLTF has completed loading
 *
 * @param url The URL of the GLTF file to load
 * @param parentEntity The entity that is loading the GLTF
 * @returns Entity | null
 */
export function useGLTFComponent(url: string, parentEntity: Entity): Entity | null {
  const gltfEntityState = useHookstate(UndefinedEntity)
  const loaded = GLTFComponent.useSceneLoaded(gltfEntityState.value)

  useEffect(() => {
    if (!url || !parentEntity) return
    const gltfEntity = createEntity()
    setComponent(gltfEntity, EntityTreeComponent, { parentEntity })
    setComponent(gltfEntity, UUIDComponent, {
      entitySourceID: getComponent(parentEntity, UUIDComponent).entitySourceID,
      entityID: UUIDComponent.generate()
    })
    setComponent(gltfEntity, GLTFComponent, { src: url })
    gltfEntityState.set(gltfEntity)

    return () => {
      if (entityExists(gltfEntity)) {
        removeEntity(gltfEntity)
        gltfEntityState.set(UndefinedEntity)
      }
    }
  }, [parentEntity, url])

  return loaded ? gltfEntityState.value : null
}
