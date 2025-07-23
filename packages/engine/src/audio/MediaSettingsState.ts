import { defineState } from '@ir-engine/hyperflux'

export const MediaSettingsState = defineState({
  name: 'MediaSettingsState',
  initial: {
    immersiveMedia: false,
    refDistance: 1,
    rolloffFactor: 1,
    maxDistance: 10000,
    distanceModel: 'linear' as DistanceModelType,
    coneInnerAngle: 360,
    coneOuterAngle: 360,
    coneOuterGain: 0
  }
})
