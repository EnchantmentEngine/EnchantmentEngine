import '../../patchEngineNode'

import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { projectsPath } from '@ir-engine/common/src/schemas/projects/projects.schema'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

describe('projects.test', () => {
  let app: Application

  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should find the projects', async () => {
    const foundProjects = await app.service(projectsPath).find()
    assert.notEqual(
      foundProjects.findIndex((project) => project === 'enchantmentengine/default-project'),
      -1
    )
  })
})
