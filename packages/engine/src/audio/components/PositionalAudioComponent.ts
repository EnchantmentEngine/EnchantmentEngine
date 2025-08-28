import { useEffect } from 'react'

import {
  defineComponent,
  getAuthoringCounterpart,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import {
  AudioNodeGroups,
  MediaComponent,
  MediaElementComponent
} from '@ir-engine/engine/src/scene/components/MediaComponent'

import { Schema } from '@ir-engine/hyperflux'

export interface PositionalAudioInterface {
  refDistance: number
  rolloffFactor: number
  maxDistance: number
  distanceModel: DistanceModelType
  coneInnerAngle: number
  coneOuterAngle: number
  coneOuterGain: number
}

const distanceModel = Schema.LiteralUnion(['exponential', 'inverse', 'linear'], { default: 'inverse' })

export const PositionalAudioComponent = defineComponent({
  name: 'EE_positionalAudio',

  jsonID: 'EE_audio',

  schema: Schema.Object({
    distanceModel,
    rolloffFactor: Schema.Number({ default: 1 }),
    refDistance: Schema.Number({ default: 1 }),
    maxDistance: Schema.Number({ default: 40 }),
    coneInnerAngle: Schema.Number({ default: 360 }),
    coneOuterAngle: Schema.Number({ default: 360 }),
    coneOuterGain: Schema.Number()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const audio = useComponent(entity, PositionalAudioComponent)
    const mediaElement = useOptionalComponent(entity, MediaElementComponent)

    useEffect(() => {
      const authEntity = getAuthoringCounterpart(entity)
      if (authEntity) {
        setComponent(authEntity, MediaComponent)
      }
    }, [])

    useEffect(() => {
      if (!mediaElement?.element) return
      const audioNodes = AudioNodeGroups.get(mediaElement.element)
      if (!audioNodes?.panner) return
      audioNodes.panner.refDistance = audio.refDistance
      audioNodes.panner.rolloffFactor = audio.rolloffFactor
      audioNodes.panner.maxDistance = audio.maxDistance
      audioNodes.panner.distanceModel = audio.distanceModel
      audioNodes.panner.coneInnerAngle = audio.coneInnerAngle
      audioNodes.panner.coneOuterAngle = audio.coneOuterAngle
      audioNodes.panner.coneOuterGain = audio.coneOuterGain
    }, [
      audio.refDistance,
      audio.rolloffFactor,
      audio.maxDistance,
      audio.distanceModel,
      audio.coneInnerAngle,
      audio.coneOuterAngle,
      audio.coneOuterGain
    ])

    return null
  }
})
