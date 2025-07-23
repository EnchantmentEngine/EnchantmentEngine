import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

const MotionCapturePoses = S.LiteralUnion(['sitting', 'standing'])

export const MotionCapturePoseComponent = defineComponent({
  name: 'MotionCapturePoseComponent',
  schema: S.Record(MotionCapturePoses, S.Object({ begun: S.Bool() }))
})
