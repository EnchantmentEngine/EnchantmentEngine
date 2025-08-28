import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { getState, setInitialState } from '@ir-engine/hyperflux'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { MediaSettingsState } from './MediaSettingsState'

describe('MediaSettingsState.ts', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('Should set the initial name to MediaSettingsState', () => {
    assert.equal(MediaSettingsState.name, 'MediaSettingsState')
  })

  it('Should set the initial data correctly', () => {
    setInitialState(MediaSettingsState)
    const assertDatasetsEquals = (actual, expected) => {
      for (const [key, value] of Object.entries(actual)) {
        assert.equal(actual[key], expected[key])
      }
    }
    const expectedInitialData = {
      immersiveMedia: false,
      refDistance: 1,
      rolloffFactor: 1,
      maxDistance: 10000,
      distanceModel: 'linear' as DistanceModelType,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0
    }
    const initialData = getState(MediaSettingsState)
    assertDatasetsEquals(initialData, expectedInitialData)
  })
})
