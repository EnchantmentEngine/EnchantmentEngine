import { EntitySchema, EntityUUID, WorldNetworkAction } from '@ir-engine/ecs'
import { defineAction, defineState, getMutableState, NetworkTopics, none, Schema } from '@ir-engine/hyperflux'

// Prototype shim for defineEventSource, local to this file while we iterate on the API shape
const defineEventSource = <T>(spec: T): T => spec

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

export const MountPointsState = defineEventSource({
  name: 'MountPointsState',

  initial: {
    mountsToMountedEntities: {} as Record<EntityUUID, EntityUUID>,
    mountedEntitiesToMounts: {} as Record<EntityUUID, EntityUUID>
  },

  events: {
    mountInteraction: {
      schema: {
        type: 'object',
        properties: {
          mounted: { type: 'boolean' },
          targetMount: { type: 'string', format: 'uuid' },
          mountedEntity: { type: 'string', format: 'uuid' }
        },
        required: ['mounted', 'targetMount', 'mountedEntity'],
        additionalProperties: false
      },
      // Prototype declarative form: JSON-Schema validation plus a transform plan
      validate: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        allOf: [
          {
            if: { properties: { event: { properties: { mounted: { const: true } } } } },
            then: {
              allOf: [
                { '$ir/exists': { not: true, path: '/state/mountsToMountedEntities/{event.targetMount}' } },
                { '$ir/exists': { not: true, path: '/state/mountedEntitiesToMounts/{event.mountedEntity}' } }
              ]
            }
          },
          {
            if: { properties: { event: { properties: { mounted: { const: false } } } } },
            then: {
              allOf: [
                {
                  '$ir/equals': {
                    left: { path: '/state/mountsToMountedEntities/{event.targetMount}' },
                    right: { valueFrom: 'event.mountedEntity' }
                  }
                },
                {
                  '$ir/equals': {
                    left: { path: '/state/mountedEntitiesToMounts/{event.mountedEntity}' },
                    right: { valueFrom: 'event.targetMount' }
                  }
                }
              ]
            }
          }
        ]
      } as any,
      transform: {
        atomic: true,
        when: [
          {
            if: { properties: { event: { properties: { mounted: { const: true } } } } },
            then: {
              ops: [
                {
                  op: 'set',
                  path: '/mountsToMountedEntities/{event.targetMount}',
                  value: { valueFrom: 'event.mountedEntity' }
                },
                {
                  op: 'set',
                  path: '/mountedEntitiesToMounts/{event.mountedEntity}',
                  value: { valueFrom: 'event.targetMount' }
                }
              ]
            }
          },
          {
            if: { properties: { event: { properties: { mounted: { const: false } } } } },
            then: {
              ops: [
                { op: 'remove', path: '/mountsToMountedEntities/{event.targetMount}' },
                { op: 'remove', path: '/mountedEntitiesToMounts/{event.mountedEntity}' }
              ]
            }
          }
        ]
      } as any
    },

    destroyObject: {
      schema: WorldNetworkAction.destroyEntity.schema,
      transform: {
        atomic: true,
        variables: {
          mountUUID: { get: '/mountedEntitiesToMounts/{event.entityUUID}' }
        },
        when: [
          {
            if: { '$ir/exists': { path: '/state/mountedEntitiesToMounts/{event.entityUUID}' } },
            then: {
              ops: [
                { op: 'remove', path: '/mountsToMountedEntities/{vars.mountUUID}' },
                { op: 'remove', path: '/mountedEntitiesToMounts/{event.entityUUID}' }
              ]
            }
          }
        ]
      } as any
    }
  }
})

// can access action definition via
// MountPointsState.mountInteraction.action

// can dispatch actions via
// dispatchAction(MountPointsState.mountInteraction({ mounted: true, targetMount: 'uuid1', mountedEntity: 'uuid2' }))
