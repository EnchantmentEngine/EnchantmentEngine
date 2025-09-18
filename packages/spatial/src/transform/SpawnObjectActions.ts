import { WorldNetworkAction } from '@ir-engine/ecs'
import { defineAction, Schema } from '@ir-engine/hyperflux'

import { T } from '../schema/schemaFunctions'

export const SpawnObjectActions = {
  spawnObject: defineAction(
    WorldNetworkAction.spawnEntity.extend(
      Schema.Object(
        {
          position: Schema.Optional(T.Vec3()),
          rotation: Schema.Optional(T.Quaternion())
        },
        {
          $id: 'ee.engine.world.SPAWN_OBJECT'
        }
      )
    )
  )
}
