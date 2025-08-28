import '../../patchEngineNode'

import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { invalidationPath } from '@ir-engine/common/src/schemas/media/invalidation.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

const pathName1 = '/path/to/file1'
const pathName2 = '/path/to/file2'
const fileName1 = '/path/to/file3.jpg'

describe('invalidation.test', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
    await app.service(invalidationPath).remove(null, {
      query: {}
    })
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  let createdPath1, createdPath2, createdFile1
  it('creates one invalidation entry', async () => {
    createdPath1 = await app.service(invalidationPath).create({
      path: pathName1
    })

    assert.ok(createdPath1)
    assert.strictEqual(createdPath1.path, pathName1)
  })

  it('creates multiple invalidation entries', async () => {
    ;[createdPath2, createdFile1] = await app.service(invalidationPath).create([
      {
        path: pathName2
      },
      {
        path: fileName1
      }
    ])

    assert.ok(createdPath2)
    assert.strictEqual(createdPath2.path, pathName2)
    assert.ok(createdFile1)
    assert.strictEqual(createdFile1.path, fileName1)
  })

  it('gets an invalidation', async () => {
    await assert.doesNotReject(async () => await app.service(invalidationPath).get(createdPath1.id))
    const path1 = await app.service(invalidationPath).get(createdPath1.id)
    assert.notEqual(path1, null)
    assert.equal(path1.path, pathName1)
  })

  it('Finds all invalidations', async () => {
    const invalidations = await app.service(invalidationPath).find({
      query: {
        $sort: {
          createdAt: -1
        }
      }
    })
    assert.equal(invalidations.total, 3)
  })

  it('Removes an invalidation', async () => {
    await app.service(invalidationPath).remove(createdPath1.id)
    const invalidations = await app.service(invalidationPath).find({
      query: {
        $sort: {
          createdAt: -1
        }
      }
    })
    assert.equal(invalidations.total, 2)
  })
})
