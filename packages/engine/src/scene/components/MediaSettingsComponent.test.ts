import { UndefinedEntity, createEngine, createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { getState, setInitialState } from '@ir-engine/hyperflux'
import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { MediaSettingsState } from '../../audio/MediaSettingsState'
import { MediaSettingsComponent } from './MediaSettingsComponent'

describe('MediaSettingsComponent.ts', () => {
  const assertDatasetsEquals = (actual, expected) => {
    for (const [key, value] of Object.entries(actual)) {
      assert.equal(actual[key], expected[key])
    }
  }

  let entity = UndefinedEntity
  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('Should set the name to MediaSettingsComponent', () => {
    assert.equal(MediaSettingsComponent.name, 'MediaSettingsComponent')
  })
  it('Should set the jsonID to EE_media_settings', () => {
    assert.equal(MediaSettingsComponent.jsonID, 'EE_media_settings')
  })
  it('Should set the initial data correctly', () => {
    setComponent(entity, MediaSettingsComponent)
    const actualInitialData = getComponent(entity, MediaSettingsComponent)
    const expectedInitialData = {
      immersiveMedia: false,
      refDistance: 20,
      rolloffFactor: 1,
      maxDistance: 10000,
      distanceModel: 'linear',
      coneInnerAngle: 360,
      coneOuterAngle: 0,
      coneOuterGain: 0
    }
    // Check initial value set
    assertDatasetsEquals(actualInitialData, expectedInitialData)
    const distanceValue: 'exponential' | 'inverse' | 'linear' | undefined = 'inverse'
    const expectedChangedData = {
      immersiveMedia: true,
      refDistance: 2,
      rolloffFactor: 1,
      maxDistance: 10030,
      distanceModel: distanceValue,
      coneInnerAngle: 60,
      coneOuterAngle: 9,
      coneOuterGain: 43
    }
    setComponent(entity, MediaSettingsComponent, expectedChangedData)
    const changedData = getComponent(entity, MediaSettingsComponent)
    // Check that data is set correctly on change
    assertDatasetsEquals(changedData, expectedChangedData)
  })

  it('Should update the MediaSettingsState to the match the values of MediaSettingsComponent', async () => {
    setInitialState(MediaSettingsState)
    setComponent(entity, MediaSettingsComponent)
    await flushAll()
    const initialComponentValues = getComponent(entity, MediaSettingsComponent)
    const initialStateValues = getState(MediaSettingsState)
    // Check that the props in state are updated to match those on component when component is called
    assertDatasetsEquals(initialComponentValues, initialStateValues)
    // Reusing code from above test case
    const distanceValue: 'exponential' | 'inverse' | 'linear' | undefined = 'inverse'
    const expectedChangedData = {
      immersiveMedia: true,
      refDistance: 2,
      rolloffFactor: 1,
      maxDistance: 10030,
      distanceModel: distanceValue,
      coneInnerAngle: 60,
      coneOuterAngle: 9,
      coneOuterGain: 43
    }
    setComponent(entity, MediaSettingsComponent, expectedChangedData)
    await flushAll()
    const updatedByUseffect = getState(MediaSettingsState)
    // Check that the state props also updates on prop change inside component and not just on component call
    assertDatasetsEquals(updatedByUseffect, expectedChangedData)
  })
})
