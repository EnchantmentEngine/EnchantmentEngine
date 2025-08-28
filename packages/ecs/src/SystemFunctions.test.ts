import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { defineState, getMutableState } from '@ir-engine/hyperflux'

import { ECSState } from './ECSState'
import { createEngine, destroyEngine } from './Engine'
import { executeSystems } from './EngineFunctions'
import { defineSystem } from './SystemFunctions'
import { SimulationSystemGroup } from './SystemGroups'

const MockState = defineState({
  name: 'MockState',
  initial: { count: 0 }
})

const execute = () => {
  getMutableState(MockState).count.set((c) => c + 1)
}

const MockSystem = defineSystem({
  uuid: 'test.MockSystem',
  insert: { with: SimulationSystemGroup },
  execute
})

describe('SystemFunctions', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can run multiple simulation ticks to catch up to elapsed time', async () => {
    const mockState = getMutableState(MockState)
    assert.equal(mockState.count.value, 0)

    const ticks = 3
    const simulationDelay = (ticks * 1001) / 60
    const ecsState = getMutableState(ECSState)
    ecsState.simulationTime.set(performance.timeOrigin - simulationDelay)
    executeSystems(0)
    assert.equal(mockState.count.value, ticks)
  })

  it('can skip simulation ticks to catch up to elapsed time', async () => {
    const mockState = getMutableState(MockState)
    const ecsState = getMutableState(ECSState)

    assert.equal(mockState.count.value, 0)

    const simulationDelay = 1000 * 60 // 1 minute should be too much to catch up to wihtout skipping
    ecsState.simulationTime.set(performance.timeOrigin - simulationDelay)
    executeSystems(0)

    assert(performance.timeOrigin - ecsState.simulationTime.value < ecsState.simulationTimestep.value)
    assert.equal(mockState.count.value, 1)
  })
})
