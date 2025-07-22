import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export const AvatarArmsTwistCorrectionComponent = defineComponent({
  name: 'AvatarArmsTwistCorrectionComponent',

  schema: S.Object({
    LeftHandBindRotationInv: T.Quaternion(),
    LeftArmTwistAmount: S.Number(),
    RightHandBindRotationInv: T.Quaternion(),
    RightArmTwistAmount: S.Number()
  })
})
