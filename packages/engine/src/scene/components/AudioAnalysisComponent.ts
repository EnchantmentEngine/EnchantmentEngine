import { useEffect } from 'react'

import { defineComponent, setComponent, useComponent, useEntityContext, useOptionalComponent } from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { AudioNodeGroups, MediaComponent, MediaElementComponent } from './MediaComponent'

export type AudioAnalysisSession = {
  analyser: AnalyserNode
  frequencyData: Uint8Array
}

export const AudioAnalysisComponent = defineComponent({
  name: 'EE_audio_analyzer',
  jsonID: 'audio-analyzer',

  schema: S.Object({
    src: S.String(),
    session: S.Type<AudioAnalysisSession | null>(),
    bassEnabled: S.Bool({ default: true }),
    midEnabled: S.Bool({ default: true }),
    trebleEnabled: S.Bool({ default: true }),
    bassMultiplier: S.Number({ default: 1 }),
    midMultiplier: S.Number({ default: 1 }),
    trebleMultiplier: S.Number({ default: 1 })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const audioAnaylsisComponent = useComponent(entity, AudioAnalysisComponent)
    const posAudio = useOptionalComponent(entity, PositionalAudioComponent)
    const mediaElement = useOptionalComponent(entity, MediaElementComponent)
    const existingSystem = useComponent(entity, MediaComponent)

    useEffect(() => {
      setComponent(entity, VisibleComponent)
      setComponent(entity, NameComponent, 'AudioAnalysis')
      setComponent(entity, TransformComponent)
    }, [])

    useEffect(() => {
      setComponent(entity, AudioAnalysisComponent, { src: existingSystem?.paths[0] })
    }, [existingSystem.paths])

    useEffect(() => {
      if (!posAudio || !mediaElement?.element) return

      const element = mediaElement.element as HTMLAudioElement
      element.onplay = () => {
        const audioObject = AudioNodeGroups.get(element)

        if (audioObject) {
          const audioContext = audioObject.source.context
          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 2 ** 5
          audioObject.source.connect(analyser)
          setComponent(entity, AudioAnalysisComponent, {
            session: {
              analyser,
              frequencyData: new Uint8Array(analyser.frequencyBinCount)
            }
          })
        }
      }
    }, [audioAnaylsisComponent, posAudio, mediaElement])

    return null
  }
})
