import '../../patchEngineNode'

import assert from 'assert'
import { v4 as uuidv4 } from 'uuid'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { locationSettingPath } from '@ir-engine/common/src/schemas/social/location-setting.schema'
import { LocationID, locationPath, LocationType } from '@ir-engine/common/src/schemas/social/location.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { LocationParams } from './location.class'

const params = { isInternal: true } as LocationParams

describe('location.test', () => {
  let app: Application
  const locations: any[] = []

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should create a new location', async () => {
    const name = `Test Location ${uuidv4()}`

    const scene = await app.service(staticResourcePath).find({
      query: {
        key: 'projects/ir-engine/default-project/public/scenes/default.gltf'
      }
    })

    const item = await app.service(locationPath).create(
      {
        name,
        sceneId: scene.data[0].id,
        maxUsersPerInstance: 5,
        locationSetting: {
          locationType: 'public',
          audioEnabled: true,
          videoEnabled: true,
          faceStreamingEnabled: false,
          screenSharingEnabled: false,
          locationId: '' as LocationID
        },
        isLobby: false,
        isFeatured: false
      },
      params
    )

    assert.ok(item)
    assert.equal(item.name, name)
    locations.push(item)
  })

  it('should get the new location', async () => {
    const item = await app.service(locationPath).get(locations[0].id)

    assert.ok(item)
    assert.equal(item.name, locations[0].name)
    assert.equal(item.slugifiedName, locations[0].slugifiedName)
    assert.equal(item.isLobby, locations[0].isLobby)
  })

  it('should be able to update the location', async () => {
    const newName = `Update Test Location ${uuidv4()}`
    const locationSetting = await app.service(locationSettingPath).create({
      locationType: 'public',
      audioEnabled: true,
      videoEnabled: true,
      faceStreamingEnabled: false,
      screenSharingEnabled: false,
      locationId: locations[0].id
    })

    locationSetting.audioEnabled = true
    locationSetting.videoEnabled = true
    locationSetting.faceStreamingEnabled = false
    locationSetting.screenSharingEnabled = false

    const item = (await app
      .service(locationPath)
      .patch(locations[0].id, { name: newName, locationSetting })) as any as LocationType

    assert.ok(item)
    assert.equal(item.name, newName)

    locations[0].name = newName
  })

  it('should be able to delete the location', async () => {
    await app.service(locationPath).remove(locations[0].id)

    const item = await app.service(locationPath).find({ query: { id: locations[0].id } })

    assert.equal(item.total, 0)
  })
})
