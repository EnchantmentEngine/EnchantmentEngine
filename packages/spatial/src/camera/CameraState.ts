import { definePrefab } from '@ir-engine/ecs'
import { defineAction, defineState, Schema } from '@ir-engine/hyperflux'
import { NameComponent } from '../common/NameComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { CameraComponent } from './components/CameraComponent'

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

export const CameraPrefab = definePrefab({
  components: [CameraComponent, TransformComponent, NameComponent]
})
