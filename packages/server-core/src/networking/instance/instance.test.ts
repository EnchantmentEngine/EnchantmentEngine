import '../../patchEngineNode'

import { Paginated } from '@feathersjs/feathers'
import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { LocationID, LocationType, RoomCode } from '@ir-engine/common/src/schemas/social/location.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import { createTestLocation } from '@ir-engine/server-core/tests/util/createTestLocation'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

const params = { isInternal: true } as any

const p2pEnabled = config['instance-server'].p2pEnabled

describe('instance.test', () => {
  let app: Application

  beforeAll(async () => {
    config['instance-server'].p2pEnabled = false

    app = await createFeathersKoaApp()
    await app.setup()

    testLocation = await createTestLocation(app, params)
  }, 60000)

  afterAll(async () => {
    config['instance-server'].p2pEnabled = p2pEnabled
    await tearDownAPI()
    destroyEngine()
  })

  let testLocation: LocationType
  let testInstance: InstanceType

  it('should create a server instance', async () => {
    const instance = (await app.service(instancePath).create({
      locationId: testLocation.id as LocationID,
      ipAddress: '1.2.3.4:1234',
      roomCode: '123456' as RoomCode
    })) as InstanceType

    assert.ok(instance)
    assert.equal(instance.locationId, testLocation.id)
    assert.equal(instance.currentUsers, 1) // server is counted as a user
    assert.equal(instance.ended, false)

    testInstance = instance
  })

  it('should get that instance', async () => {
    const instance = await app.service(instancePath).get(testInstance.id)

    assert.ok(instance)
    assert.ok(instance.roomCode)
    assert.equal(instance.id, testInstance.id)
  })

  it('should find instances for admin', async () => {
    const instances = (await app.service(instancePath).find({
      action: 'admin'
    } as any)) as Paginated<InstanceType>

    assert.equal(instances.total, 1)
    assert.equal(instances.data[0].id, testInstance.id)
  })

  it('should have "total" in find method', async () => {
    const item = await app.service(instancePath).find({
      action: 'admin'
    } as any)

    assert.ok('total' in item)
  })
})
