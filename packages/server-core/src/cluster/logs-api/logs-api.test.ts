import { Application } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { destroyEngine } from '@ir-engine/ecs'
import assert from 'assert'
import { createSandbox, SinonSandbox } from 'sinon'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createFeathersKoaApp, tearDownAPI } from '../../createApp'
import { AnalyticsLogResolver, AnalyticsLogValidator, BQLogValidator } from './analytics-logger'
import hooks from './logs-api.hooks'

describe('logs-api.hooks', () => {
  let app: Application
  let sandbox: SinonSandbox
  let mockContext

  beforeAll(async () => {
    sandbox = createSandbox()
    app = await createFeathersKoaApp()
    await app.setup()
    mockContext = {
      type: 'before',
      method: 'create',
      app,
      params: {},
      data: {}
    }
  })

  afterAll(async () => {
    await tearDownAPI()
    destroyEngine()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('copyDataToParam', () => {
    const copyDataToParam = (hooks.before.create as any)[1]

    it('should copy the specified property from context.data to context.params', async () => {
      mockContext.data = { action: 'testAction' }
      await copyDataToParam(mockContext)
      expect(mockContext.params.action).toBe('testAction')
    })

    it('should do nothing if context.data is missing', async () => {
      mockContext.data = undefined
      await copyDataToParam(mockContext)
      expect(mockContext.params.action).toBeUndefined()
    })

    it('should do nothing if the property is missing in context.data', async () => {
      mockContext.data = {}
      await copyDataToParam(mockContext)
      expect(mockContext.params.action).toBeUndefined()
    })
  })

  describe('before.create hooks', () => {
    const hasActionHook = (hooks.before.create as any)[0]
    const copyDataToParamHook = (hooks.before.create as any)[1]
    const isActionAnalyticsHook = (hooks.before.create as any)[2]

    it('should copy action to params if hasAction returns true', async () => {
      mockContext.data = { action: 'testAction' }
      await hasActionHook(mockContext)
      await copyDataToParamHook(mockContext)
      expect(mockContext.params.action).toBe('testAction')
    })

    it('should do nothing if hasAction returns false', async () => {
      mockContext.data = {}
      await hasActionHook(mockContext)
      await copyDataToParamHook(mockContext)
      expect(mockContext.params.action).toBeUndefined()
    })

    it('should run validation and resolution hooks if action is analytics', async () => {
      mockContext.data = { action: 'analytics', event_id: 'test', event_name: 'test' }
      mockContext.params.action = 'analytics'
      const validateDataSpy = sandbox.spy(schemaHooks, 'validateData')
      const resolveDataSpy = sandbox.spy(schemaHooks, 'resolveData')
      await isActionAnalyticsHook(mockContext)
      expect(validateDataSpy.calledWith(AnalyticsLogValidator)).toBeTruthy()
      expect(resolveDataSpy.calledWith(AnalyticsLogResolver)).toBeTruthy()
      expect(validateDataSpy.calledWith(BQLogValidator)).toBeTruthy()
    })

    it('should skip validation and resolution hooks if action is not analytics', async () => {
      mockContext.data = { action: 'notAnalytics' }
      mockContext.params.action = 'notAnalytics'
      const validateDataSpy = sandbox.spy(schemaHooks, 'validateData')
      const resolveDataSpy = sandbox.spy(schemaHooks, 'resolveData')
      await isActionAnalyticsHook(mockContext)
      expect(validateDataSpy.notCalled).toBeTruthy()
      expect(resolveDataSpy.notCalled).toBeTruthy()
    })

    it('should throw an error if data is invalid according to AnalyticsLogValidator', async () => {
      mockContext.data = { action: 'analytics' }
      mockContext.params.action = 'analytics'
      await assert.rejects(isActionAnalyticsHook(mockContext))
    })

    it('should throw an error if data is invalid according to BQLogValidator', async () => {
      mockContext.data = { action: 'analytics', event_id: 'test', event_name: 'test' }
      mockContext.params.action = 'analytics'
      const validateDataSpy = sandbox.spy(schemaHooks, 'validateData')
      const resolveDataSpy = sandbox.spy(schemaHooks, 'resolveData')
      await isActionAnalyticsHook(mockContext)
      expect(validateDataSpy.calledWith(BQLogValidator)).toBeTruthy()
      mockContext.data = { action: 'analytics', event_id: 'test', event_name: 'test', user_id: 'test' }
      mockContext.params.action = 'analytics'
      await isActionAnalyticsHook(mockContext)
    })

    it('should resolve data correctly with AnalyticsLogResolver', async () => {
      mockContext.data = { action: 'analytics', event_id: 'test', event_name: 'test' }
      mockContext.params.action = 'analytics'
      mockContext.params.user = { id: 'testUser' }
      const validateDataSpy = sandbox.spy(schemaHooks, 'validateData')
      const resolveDataSpy = sandbox.spy(schemaHooks, 'resolveData')
      await isActionAnalyticsHook(mockContext)
      expect(resolveDataSpy.calledWith(AnalyticsLogResolver)).toBeTruthy()
      expect(mockContext.data.user_id).toBe('testUser')
    })
  })
})
