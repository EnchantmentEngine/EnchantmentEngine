import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

export const TargetCameraRotationComponent = defineComponent({
  name: 'TargetCameraRotationComponent',

  schema: Schema.Object({
    phi: Schema.Number(),
    theta: Schema.Number(),
    time: Schema.Number()
  }),

  onInit: (entity, initial) => ({
    ...initial,
    phiVelocity: { value: 0 },
    thetaVelocity: { value: 0 }
  })
})
