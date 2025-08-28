import '../../patchEngineNode'

import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { afterAll, beforeAll, describe } from 'vitest'
import { Application } from '../../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'

// import { generateAvatarThumbnail } from './generateAvatarThumbnail'
// import fs from 'fs'
// import path from 'path'
// import appRootPath from 'app-root-path'

// const debugThumbnail = false

// causes CI/CD weirdness
describe('avatar-helper', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })
})
