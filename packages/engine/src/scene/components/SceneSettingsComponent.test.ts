import {
  createEngine,
  createEntity,
  destroyEngine,
  EntityID,
  getComponent,
  setComponent,
  SourceID,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { afterEach, assert, beforeEach, describe, it } from 'vitest'
import { SceneSettingsComponent } from './SceneSettingsComponent'

describe('SceneSettingsComponent', () => {
  let entity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    setComponent(entity, UUIDComponent, { entitySourceID: 'source' as string as SourceID, entityID: 'id' as EntityID })
  })

  afterEach(() => {
    destroyEngine()
  })

  it('Should set the name to SceneSettingsComponent', () => {
    assert.equal(SceneSettingsComponent.name, 'SceneSettingsComponent')
  })
  it('Should set the jsonID to EE_scene_settings', () => {
    assert.equal(SceneSettingsComponent.jsonID, 'EE_scene_settings')
  })
  it('Should set the initial data of the component correctly', () => {
    // Loop through datasets and compare values
    const assertDatasetsEquals = (actual, expected) => {
      for (const [key, value] of Object.entries(actual)) {
        assert.equal(actual[key], expected[key])
      }
    }

    setComponent(entity, SceneSettingsComponent)
    const entityUUID = getComponent(entity, UUIDComponent).entityID
    const initialData = {
      thumbnailURL: '',
      loadingScreenURL: '',
      primaryColor: '#000000',
      backgroundColor: '#FFFFFF',
      alternativeColor: '#000000',
      sceneKillHeight: -10,
      spectateEntity: UndefinedEntity
    }
    const initialComponent = getComponent(entity, SceneSettingsComponent)
    // Check initial setting
    assertDatasetsEquals(initialData, initialComponent)

    const changedData = {
      thumbnailURL: 'url1',
      loadingScreenURL: 'url2',
      primaryColor: '#000001',
      backgroundColor: '#FFFFFG',
      alternativeColor: '#000001',
      sceneKillHeight: -1,
      spectateEntity: entityUUID
    }
    setComponent(entity, SceneSettingsComponent, changedData)
    const changedComponent = getComponent(entity, SceneSettingsComponent)
    // Check if data changed correctly
    assertDatasetsEquals(changedData, changedComponent)
  })
})
