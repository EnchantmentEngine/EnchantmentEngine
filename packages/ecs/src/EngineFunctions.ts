/** Functions to provide engine level functionalities. */

import { getMutableState, getState, HyperFlux } from '@ir-engine/hyperflux'

import { ECSState } from './ECSState'
import { executeSystem, SystemDefinitions, SystemUUID } from './SystemFunctions'
import {
  AnimationSystemGroup,
  DefaultSystemPipeline,
  InputSystemGroup,
  PresentationSystemGroup,
  SimulationSystemGroup
} from './SystemGroups'
import { nowMilliseconds } from './Timer'

/**
 * Execute systems on this world
 *
 * @param elapsedTime the current frame time in milliseconds (DOMHighResTimeStamp) relative to performance.timeOrigin
 */
export const executeSystems = (elapsedTime: number) => {
  const ecsState = getState(ECSState)
  ecsState.frameTime = performance.timeOrigin + elapsedTime

  const start = nowMilliseconds()

  const elapsedSeconds = elapsedTime / 1000
  ecsState.deltaSeconds = Math.max(0.001, Math.min(ecsState.maxDeltaSeconds, elapsedSeconds - ecsState.elapsedSeconds))
  ecsState.elapsedSeconds = elapsedSeconds

  executeSystem(InputSystemGroup)
  executeFixedSystem(SimulationSystemGroup)
  executeSystem(AnimationSystemGroup)
  executeSystem(PresentationSystemGroup)

  const end = nowMilliseconds()
  const duration = end - start
  if (duration > 150) {
    HyperFlux.store.logger('ecs:execute').warn(`Long frame execution detected. Duration: ${duration}`)
  }
  ecsState.lastSystemExecutionDuration = duration
}

/**
 * System for running simulation logic with fixed time intervals
 */
export const executeFixedSystem = (systemUUID: SystemUUID) => {
  const start = nowMilliseconds()
  let timeUsed = 0

  const ecsState = getMutableState(ECSState)
  const { frameTime, simulationTime, simulationTimestep } = getState(ECSState)

  let simulationDelay = frameTime - simulationTime

  const maxMilliseconds = 8

  // If the difference between simulationTime and frameTime becomes too large,
  // we should simply skip ahead.
  const maxSimulationDelay = 5000 // 5 seconds

  if (simulationDelay < simulationTimestep) {
    ecsState.simulationTime.set(Math.floor(frameTime / simulationTimestep) * simulationTimestep)
    // simulation time is already up-to-date with frame time, so do nothing
    return
  }

  let timeout = timeUsed > maxMilliseconds
  // let updatesLimitReached = false

  while (simulationDelay > simulationTimestep && !timeout) {
    // && !updatesLimitReached) {
    ecsState.simulationTime.set((t) => Math.floor((t + simulationTimestep) / simulationTimestep) * simulationTimestep)

    executeSystem(systemUUID)

    simulationDelay -= simulationTimestep
    timeUsed = nowMilliseconds() - start
    timeout = timeUsed > maxMilliseconds

    if (simulationDelay >= maxSimulationDelay) {
      // fast-forward if the simulation is too far behind
      ecsState.simulationTime.set((t) => Math.floor(frameTime / simulationTimestep) * simulationTimestep)
      break
    }
  }
}

export const getDAG = (systemUUIDs = DefaultSystemPipeline, depth = 0, out = [] as string[]) => {
  for (const systemUUID of systemUUIDs) {
    const system = SystemDefinitions.get(systemUUID)
    if (!system) return

    out.push(system.uuid)

    for (const preSystem of system.preSystems) {
      getDAG([preSystem], depth + 1, out)
    }
    console.log('-'.repeat(depth), system.uuid.split('.').pop())
    for (const subSystem of system.subSystems) {
      getDAG([subSystem], depth + 1, out)
    }
    for (const postSystem of system.postSystems) {
      getDAG([postSystem], depth + 1, out)
    }
  }
}
globalThis.getDAG = getDAG
