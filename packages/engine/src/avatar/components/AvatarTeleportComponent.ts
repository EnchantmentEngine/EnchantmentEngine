import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { XRHandedness } from '../../grabbable/GrabbableComponent'

export const AvatarTeleportComponent = defineComponent({
  name: 'AvatarTeleportComponent',

  schema: S.Object({
    side: XRHandedness
  })
})
