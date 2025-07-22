import { beforeEach, describe, expect, it } from 'vitest'
import { copyDataToParam } from './logs-api.hooks'

describe('logs-api.hooks', () => {
  let mockContext

  beforeEach(async () => {
    mockContext = {
      type: 'before',
      method: 'create',
      app: {},
      params: {},
      data: {}
    }
  })

  describe('copyDataToParam', () => {
    it('should copy the specified property from context.data to context.params', async () => {
      mockContext.data = { action: 'testAction' }
      await copyDataToParam('action')(mockContext)
      expect(mockContext.params.action).toBe('testAction')
    })

    it('should do nothing if context.data is missing', async () => {
      mockContext.data = undefined
      await copyDataToParam('action')(mockContext)
      expect(mockContext.params.action).toBeUndefined()
    })

    it('should do nothing if the property is missing in context.data', async () => {
      mockContext.data = {}
      await copyDataToParam('action')(mockContext)
      expect(mockContext.params.action).toBeUndefined()
    })
  })
})
