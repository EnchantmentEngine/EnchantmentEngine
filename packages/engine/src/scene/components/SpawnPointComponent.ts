import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { Schema } from '@ir-engine/hyperflux'

export const SpawnPointComponent = defineComponent({
  name: 'SpawnPointComponent',
  jsonID: 'EE_spawn_point',
  schema: Schema.Object({
    permissionedUsers: Schema.Array(Schema.UserID())
  })
})
