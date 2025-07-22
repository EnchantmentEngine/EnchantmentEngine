import {
  defineSystem,
  Entity,
  EntityArrayBoundary,
  EntityTreeComponent,
  getComponent,
  hasComponent,
  PresentationSystemGroup,
  QueryReactor,
  useComponent,
  useEntityContext,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import { dispatchAction, NetworkState, ScenePeer, SceneUser, useHookstate } from '@ir-engine/hyperflux'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'

/**
 * For p2p networking, entities need to be spawned deterministically for the scene to be consistent across peers, since there is no host.
 * @todo we may replace ScenePeer with the InstanceID/NetworkID
 */
const SourcedEntityReactor = () => {
  const entity = useEntityContext()
  const parentEntity = useComponent(entity, EntityTreeComponent).parentEntity.value
  const parentUUID = UUIDComponent.use(parentEntity)

  useEffect(() => {
    const entityUUID = UUIDComponent.get(entity)
    return () => {
      dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID }))
    }
  }, [])

  useEffect(() => {
    if (!parentUUID) return
    const entityUUID = getComponent(entity, UUIDComponent)
    dispatchAction(
      WorldNetworkAction.spawnEntity({
        ownerID: SceneUser,
        entityID: entityUUID.entityID,
        entitySourceID: entityUUID.entitySourceID,
        parentUUID,
        $network: undefined,
        $topic: undefined,
        $user: SceneUser,
        $peer: ScenePeer
      })
    )
  }, [parentUUID])

  return null
}

const filterSpatialEntities = (entity: Entity) => hasComponent(entity, EntityTreeComponent)

const SourcedSceneReactor = () => {
  const entity = useEntityContext()
  const sourceID = UUIDComponent.getAsSourceID(entity)
  const sourcedEntities = UUIDComponent.useEntitiesBySource(sourceID)

  return (
    <EntityArrayBoundary
      entities={sourcedEntities.filter(filterSpatialEntities)}
      ChildEntityReactor={SourcedEntityReactor}
    />
  )
}

/**
 * @todo - we only want one level of depth currently, not each entity in nested models
 */
const SceneReactor = () => {
  const entity = useEntityContext()
  const sourceID = UUIDComponent.getAsSourceID(entity)
  const sourcedEntities = UUIDComponent.useEntitiesBySource(sourceID)

  return <EntityArrayBoundary entities={sourcedEntities} ChildEntityReactor={SourcedSceneReactor} />
}

const reactor = () => {
  const ready = useHookstate(NetworkState.worldNetworkState).value?.ready

  if (!ready) return null

  return <QueryReactor ChildEntityReactor={SourcedSceneReactor} Components={[SceneComponent, GLTFComponent]} />
}

export const SceneNetworkSystem = defineSystem({
  uuid: 'ir.engine.scene.SceneNetworkSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
