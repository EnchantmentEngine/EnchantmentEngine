import '../../patchEngineNode'

import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { builderInfoPath } from '@ir-engine/common/src/schemas/projects/builder-info.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { engineVersion } from '../project/project-helper'

describe('builder-info.test', () => {
  let app: Application

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should get the builder info', async () => {
    const builderInfo = await app.service(builderInfoPath).get()
    assert.equal(builderInfo.engineVersion, engineVersion)
  })
})
