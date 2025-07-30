import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const SpawnPointComponent = defineComponent({
  name: 'SpawnPointComponent',
  jsonID: 'EE_spawn_point',
  schema: S.Object({
    permissionedUsers: S.Array(S.UserID())
  })
})
