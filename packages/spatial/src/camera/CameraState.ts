import { defineAction, defineState, Schema } from '@ir-engine/hyperflux'

import { SpawnObjectActions } from '../transform/SpawnObjectActions'

export const CameraSettings = defineState({
  name: 'xre.engine.CameraSettings',
  initial: () => ({
    cameraRotationSpeed: 200
  })
})

export class CameraActions {
  static spawnCamera = defineAction(
    SpawnObjectActions.spawnObject.extend(
      Schema.Object(
        {},
        {
          $id: 'ee.engine.world.SPAWN_CAMERA'
        }
      )
    )
  )

  static fadeToBlack = defineAction(
    Schema.Object(
      {
        in: Schema.Bool({ default: true })
      },
      {
        $id: 'xre.engine.CameraActions.FadeToBlack'
      }
    )
  )
}
