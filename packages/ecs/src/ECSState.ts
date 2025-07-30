import { defineState } from '@ir-engine/hyperflux'

import { Timer } from './Timer'

export const ECSState = defineState({
  name: 'ECSState',
  initial: {
    timer: null! as ReturnType<typeof Timer>,
    periodicUpdateFrequency: 5 * 1000, // every 5 seconds
    simulationTimestep: 1000 / 60,
    frameTime: Date.now(),
    simulationTime: Date.now(),
    deltaSeconds: 0,
    maxDeltaSeconds: 0.1,
    elapsedSeconds: 0,
    lastSystemExecutionDuration: 0
  }
})
