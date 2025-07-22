import { InstancedBufferAttribute } from 'three'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const InstancingComponent = defineComponent({
  name: 'InstancingComponent',
  jsonID: 'EE_instancing',

  schema: S.Object({
    instanceMatrix: S.Class(() => new InstancedBufferAttribute(new Float32Array(16), 16))
  })
})
