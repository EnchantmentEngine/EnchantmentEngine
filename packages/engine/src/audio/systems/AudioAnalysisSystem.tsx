import { defineQuery, defineSystem, getComponent, PresentationSystemGroup, setComponent } from '@ir-engine/ecs'

import { AudioAnalysisComponent } from '../../scene/components/AudioAnalysisComponent'

const audioAnalysisQuery = defineQuery([AudioAnalysisComponent])

type VizRange = { start: number; end: number }
type VizMult = (comp) => number
const vizRanges: Map<VizRange, VizMult> = new Map([
  [{ start: 0 / 3, end: 1 / 3 }, (comp) => comp.bassMultiplier * (comp.bassEnabled ? 1 : 0)],
  [{ start: 1 / 3, end: 2 / 3 }, (comp) => comp.midMultiplier * (comp.midEnabled ? 1 : 0)],
  [{ start: 2 / 3, end: 3 / 3 }, (comp) => comp.trebleMultiplier * (comp.trebleEnabled ? 1 : 0)]
])

export const AudioAnalysisSystem = defineSystem({
  uuid: 'ee.engine.AudioAnalysisSystem',
  insert: { after: PresentationSystemGroup },
  execute: () => {
    for (const entity of audioAnalysisQuery()) {
      const analysisComponent = getComponent(entity, AudioAnalysisComponent)
      const session = analysisComponent.session
      if (session == null) {
        continue
      }
      const { analyser, frequencyData } = session
      const bufferLength = analyser.frequencyBinCount
      analyser.getByteFrequencyData(frequencyData)

      for (const [range, mult] of vizRanges) {
        const start = Math.floor(range.start * bufferLength)
        const end = Math.floor(range.end * bufferLength)
        const multiplier = mult(analysisComponent)
        for (let i = start; i < end; i++) {
          frequencyData[i] *= multiplier
        }
      }

      setComponent(entity, AudioAnalysisComponent, { session })
    }
  }
})
