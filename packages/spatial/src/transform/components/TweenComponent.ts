import { Tween } from '@tweenjs/tween.js'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'

export const TweenComponent = defineComponent({
  name: 'TweenComponent',
  schema: Schema.Type<Tween<any>>()
})
