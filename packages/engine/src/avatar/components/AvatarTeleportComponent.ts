import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'
import { XRHandedness } from '../../grabbable/GrabbableComponent'

export const AvatarTeleportComponent = defineComponent({
  name: 'AvatarTeleportComponent',

  schema: Schema.Object({
    side: XRHandedness
  })
})
