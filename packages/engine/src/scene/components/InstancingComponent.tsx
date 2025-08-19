import { InstancedBufferAttribute } from 'three'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  jsonID: 'EE_instancing',

  schema: Schema.Object({
    instanceMatrix: Schema.Class(() => new InstancedBufferAttribute(new Float32Array(16), 16))
  })
})
