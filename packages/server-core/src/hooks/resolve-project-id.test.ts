import '../patchEngineNode'

import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers/lib'
import assert from 'assert'
import { afterAll, beforeAll, describe, it } from 'vitest'

import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { projectPath } from '@ir-engine/common/src/schema.type.module'
import { deleteFolderRecursive } from '@ir-engine/common/src/utils/fsHelperFunctions'
import appRootPath from 'app-root-path'
import path from 'path'
import { Application } from '../../declarations'
import { createFeathersKoaApp, tearDownAPI } from '../createApp'
import resolveProjectId from './resolve-project-id'

const mockHookContext = (app: Application, query?: Partial<{ project: string }>) => {
  return {
    app,
    params: {
      query
    }
  } as unknown as HookContext<Application>
}

describe('resolve-project-id', () => {
  let app: Application
  beforeAll(async () => {
    app = await createFeathersKoaApp()
    await app.setup()
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  it('should pass if project name is missing', async () => {
    const resolveProject = resolveProjectId()
    const hookContext = mockHookContext(app)
    const contextUpdated = await resolveProject(hookContext)
    assert.equal(contextUpdated, hookContext)
  })

  it('should fail if project is not found', async () => {
    const resolveProject = resolveProjectId()
    const hookContext = mockHookContext(app, { project: `Test #${Math.random()}` })
    await assert.rejects(async () => await resolveProject(hookContext), BadRequest)
  })

  it('should find project id by name', async () => {
    const resolveProject = resolveProjectId()
    const project = await app.service(projectPath).create({
      name: `testorg/project`
    })
    const hookContext = mockHookContext(app, { project: project.name })
    const contextUpdated = await resolveProject(hookContext)
    assert.equal(contextUpdated.params.query?.projectId, project.id)
    await app.service(projectPath).remove(project.id)
    const projectDir = path.resolve(appRootPath.path, `packages/projects/projects/${project.name}/`)
    deleteFolderRecursive(projectDir)
  })
})
