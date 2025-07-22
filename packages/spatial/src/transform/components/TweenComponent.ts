import { Tween } from '@tweenjs/tween.js'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const TweenComponent = defineComponent({
  name: 'TweenComponent',
  schema: S.Type<Tween<any>>()
})
