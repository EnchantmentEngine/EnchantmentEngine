import { defineAction, defineState, Schema } from '@ir-engine/hyperflux'

export const CameraSettings = defineState({
  name: 'xre.engine.CameraSettings',
  initial: () => ({
    cameraRotationSpeed: 200
  })
})

export class CameraActions {
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
