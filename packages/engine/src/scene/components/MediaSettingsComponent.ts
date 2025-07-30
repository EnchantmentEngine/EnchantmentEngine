import { useEffect } from 'react'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import { getMutableState, getState } from '@ir-engine/hyperflux'

const DistanceModelTypeSchema = S.LiteralUnion(['exponential', 'inverse', 'linear'], { default: 'linear' })

export const MediaSettingsComponent = defineComponent({
  name: 'MediaSettingsComponent',
  jsonID: 'EE_media_settings',

  schema: S.Object({
    immersiveMedia: S.Bool(),
    refDistance: S.Number({ default: 20 }),
    rolloffFactor: S.Number({ default: 1 }),
    maxDistance: S.Number({ default: 10000 }),
    distanceModel: DistanceModelTypeSchema,
    coneInnerAngle: S.Number({ default: 360 }),
    coneOuterAngle: S.Number(),
    coneOuterGain: S.Number()
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
