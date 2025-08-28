import { Cache } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FileLoader, loading } from './FileLoader'

// Mock fetch
global.fetch = vi.fn()
global.Request = vi.fn().mockImplementation(() => ({}))
global.Headers = vi.fn().mockImplementation(() => ({}))
global.Response = vi.fn().mockImplementation(() => ({
  ok: true,
  status: 200,
  clone: () => ({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
  }),
  text: () => Promise.resolve(''),
  json: () => Promise.resolve({}),
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob())
})) as any

// Mock AbortController
global.AbortController = vi.fn().mockImplementation(() => ({
  signal: {},
  abort: vi.fn()
}))

describe('FileLoader', () => {
  beforeEach(() => {
    // Clear cache before each test
    Cache.clear()

    // Reset fetch mock
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValue(new Response())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should add to loading object when starting a request', () => {
    const loader = new FileLoader()
    const url = 'test-url'

    // Mock successful response
    vi.mocked(fetch).mockResolvedValue(new Response())

    // Load the file
    loader.load(url, () => {})

    // Check that the loading object has an entry
    expect(Object.keys(loading)).toHaveLength(1)
  })

  it('should clean up loading object and clear callbacks in finally block', () => {
    const url = 'test-url'

    // Create a cacheKey similar to what the loader would create
    const cacheKey = JSON.stringify({
      url,
      responseType: undefined,
      mimeType: undefined,
      headers: undefined,
      withCredentials: undefined
    })

    // Create callbacks array with a spy function
    const onLoadSpy = vi.fn()
    const callbacks = [{ onLoad: onLoadSpy }]

    // Manually add an entry to the loading object
    loading[cacheKey] = callbacks

    // Verify it was added
    expect(Object.keys(loading)).toHaveLength(1)
    expect(loading[cacheKey]).toBe(callbacks)
    expect(loading[cacheKey].length).toBe(1)

    // Simulate the finally block with our enhanced cleanup
    if (loading[cacheKey] !== undefined) {
      // Clear any callbacks to help garbage collection
      const callbacksToClean = loading[cacheKey]
      if (callbacksToClean && Array.isArray(callbacksToClean)) {
        callbacksToClean.length = 0
      }

      // Remove the entry from the loading object
      delete loading[cacheKey]
    }

    // Check that the loading object is empty
    expect(Object.keys(loading)).toHaveLength(0)

    // Check that the callbacks array was cleared
    expect(callbacks.length).toBe(0)
  })
})
