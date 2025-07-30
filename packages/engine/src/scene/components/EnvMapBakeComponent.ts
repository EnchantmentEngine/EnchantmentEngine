import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { Vector3_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

import { EnvMapBakeRefreshTypes } from '../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'

export const EnvMapBakeComponent = defineComponent({
  name: 'EnvMapBakeComponent',
  jsonID: 'EE_envmapbake',

  schema: S.Object({
    bakePositionOffset: T.Vec3(),
    bakeScale: T.Vec3(Vector3_One),
    bakeType: S.Enum(EnvMapBakeTypes, {
      $comment: "A string enum, ie. one of the following values: 'Realtime', 'Baked'",
      default: EnvMapBakeTypes.Baked
    }),
    resolution: S.Number({ default: 1024 }),
    refreshMode: S.Enum(EnvMapBakeRefreshTypes, {
      $comment: "A string enum, ie. one of the following values: 'OnAwake', 'EveryFrame'",
      default: EnvMapBakeRefreshTypes.OnAwake
    }),
    envMapOrigin: S.String({ default: '' }),
    boxProjection: S.Bool({ default: true })
  })
})
