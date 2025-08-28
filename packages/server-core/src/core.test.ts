import './patchEngineNode'

import assert from 'assert'
import { afterAll, describe, it } from 'vitest'

import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { createFeathersKoaApp, tearDownAPI } from './createApp'

describe('Core', () => {
  it('should initialise app', async () => {
    const app = await createFeathersKoaApp()
    await app.setup()
    assert.ok(app.isSetup)
  })
  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })
})
