import { defineComponent, S } from '@ir-engine/ecs'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { Vector3 } from 'three'

export const AgentComponent = defineComponent({
  name: 'AgentComponent',
  schema: S.Object({
    interestPoint: T.Vec3(new Vector3()),
    interest: S.Number(),
    direction: T.Vec3(new Vector3())
  })
})

export const AgentVolumeComponent = defineComponent({
  name: 'AgentVolumeComponent',
  schema: S.Object({
    sizeX: S.Number({ default: 6 }),
    sizeZ: S.Number({ default: 6 }),
    avatarList: S.Array(S.String()),
    avatarCount: S.Number({ default: 10 }),
    avatarEntities: S.Array(S.EntityUUID())
  })
})
