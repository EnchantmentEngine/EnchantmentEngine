import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import { getMutableState, getState, Schema } from '@ir-engine/hyperflux'

const DistanceModelTypeSchema = Schema.LiteralUnion(['exponential', 'inverse', 'linear'], { default: 'linear' })

export const MediaSettingsComponent = defineComponent({
  name: 'MediaSettingsComponent',
  jsonID: 'EE_media_settings',

  schema: Schema.Object({
    immersiveMedia: Schema.Bool(),
    refDistance: Schema.Number({ default: 20 }),
    rolloffFactor: Schema.Number({ default: 1 }),
    maxDistance: Schema.Number({ default: 10000 }),
    distanceModel: DistanceModelTypeSchema,
    coneInnerAngle: Schema.Number({ default: 360 }),
    coneOuterAngle: Schema.Number(),
    coneOuterGain: Schema.Number()
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MediaSettingsComponent)

    for (const prop of Object.keys(getState(MediaSettingsState))) {
      useEffect(() => {
        if (component[prop] !== getState(MediaSettingsState)[prop])
          getMutableState(MediaSettingsState)[prop].set(component[prop])
      }, [component[prop]])
    }

    return null
  }
})
