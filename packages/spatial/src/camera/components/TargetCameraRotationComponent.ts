import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const TargetCameraRotationComponent = defineComponent({
  name: 'TargetCameraRotationComponent',

  schema: S.Object({
    phi: S.Number(),
    theta: S.Number(),
    time: S.Number()
  }),

  onInit: (entity, initial) => ({
    ...initial,
    phiVelocity: { value: 0 },
    thetaVelocity: { value: 0 }
  })
})
