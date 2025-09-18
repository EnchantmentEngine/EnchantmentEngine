import { EntitySchema, EntityUUID, WorldNetworkAction } from '@ir-engine/ecs'
import { defineAction, defineState, getMutableState, NetworkTopics, none, Schema } from '@ir-engine/hyperflux'

export class MountPointActions {
  static mountInteraction = defineAction(
    Schema.Object(
      {
        mounted: Schema.Bool(),
        targetMount: EntitySchema.EntityUUID(),
        mountedEntity: EntitySchema.EntityUUID()
      },
      {
        $id: 'ee.engine.interactions.MOUNT',
        metadata: {
          $topic: NetworkTopics.world
        }
      }
    )
  )
}

export const MountPointState = defineState({
  name: 'MountPointState',
  initial: () => ({
    mountsToMountedEntities: {} as Record<EntityUUID, EntityUUID>,
    mountedEntitiesToMounts: {} as Record<EntityUUID, EntityUUID>
  }),

  receptors: {
    onMountInteraction: MountPointActions.mountInteraction.receive((action) => {
      const state = getMutableState(MountPointState)
      if (action.mounted) {
        state.mountsToMountedEntities[action.targetMount].set(action.mountedEntity)
        state.mountedEntitiesToMounts[action.mountedEntity].set(action.targetMount)
      } else {
        state.mountsToMountedEntities[action.targetMount].set(none)
        state.mountedEntitiesToMounts[action.mountedEntity].set(none)
      }
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      const state = getMutableState(MountPointState)
      if (action.entityUUID in state.mountedEntitiesToMounts.value) {
        const mountUUID = state.mountedEntitiesToMounts[action.entityUUID].value
        if (mountUUID) {
          state.mountsToMountedEntities[mountUUID].set(none)
          state.mountedEntitiesToMounts[action.entityUUID].set(none)
        }
      }
    })
  }
})
