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

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export interface PositionalAudioInterface {
  refDistance: number
  rolloffFactor: number
  maxDistance: number
  distanceModel: DistanceModelType
  coneInnerAngle: number
  coneOuterAngle: number
  coneOuterGain: number
}

const distanceModel = S.LiteralUnion(['exponential', 'inverse', 'linear'], { default: 'inverse' })

export const PositionalAudioComponent = defineComponent({
  name: 'EE_positionalAudio',

  jsonID: 'EE_audio',

  schema: S.Object({
    distanceModel,
    rolloffFactor: S.Number({ default: 1 }),
    refDistance: S.Number({ default: 1 }),
    maxDistance: S.Number({ default: 40 }),
    coneInnerAngle: S.Number({ default: 360 }),
    coneOuterAngle: S.Number({ default: 360 }),
    coneOuterGain: S.Number()
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
