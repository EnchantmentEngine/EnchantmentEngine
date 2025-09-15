import { EntityID, EntityUUID, SourceID, WorldNetworkAction } from '@ir-engine/ecs'
import { defineAction, Schema } from '@ir-engine/hyperflux'

import { Quaternion, Vector3 } from 'three'
import { T } from '../schema/schemaFunctions'

export const SpawnObjectActions = {
  spawnObject: defineAction(
    WorldNetworkAction.spawnEntity.extend(
      Schema.Object(
        {
          position: T.Vec3(),
          rotation: T.Quaternion()
        },
        {
          $id: 'ee.engine.world.SPAWN_OBJECT'
        }
      )
    )
  )
}

SpawnObjectActions.spawnObject({
  entityID: '' as EntityID,
  entitySourceID: '0' as SourceID,
  parentUUID: '0' as EntityUUID,
  position: new Vector3(),
  rotation: new Quaternion()
})
