import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export const AvatarArmsTwistCorrectionComponent = defineComponent({
  name: 'AvatarArmsTwistCorrectionComponent',

  schema: Schema.Object({
    LeftHandBindRotationInv: T.Quaternion(),
    LeftArmTwistAmount: Schema.Number(),
    RightHandBindRotationInv: T.Quaternion(),
    RightArmTwistAmount: Schema.Number()
  })
})
