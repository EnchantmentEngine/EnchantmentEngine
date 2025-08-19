import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { Schema } from '@ir-engine/hyperflux'

const MotionCapturePoses = Schema.LiteralUnion(['sitting', 'standing'])

export const MotionCapturePoseComponent = defineComponent({
  name: 'MotionCapturePoseComponent',
  schema: Schema.Record(MotionCapturePoses, Schema.Object({ begun: Schema.Bool() }))
})
