import { useEffect } from 'react'
import { describe, expect, it } from 'vitest'
import { startReactor } from '../../src/functions/ReactorFunctions'
import { createHyperStore } from '../../src/functions/StoreFunctions'
import { flushAll } from './flushAll'

describe('flushAll', () => {
  it('should flush all tasks', async () => {
    createHyperStore({
      getDispatchTime: () => 0
    })

    const start = Date.now()

    let flushed = 0

    for (let i = 0; i < 1000; i++) {
      const reactor = startReactor(() => {
        const x = [] as number[]
        // mock an expensive operation
        for (let j = 0; j < 10000; j++) {
          x.push(Math.random() / x.length)
        }

        useEffect(() => {
          const x = [] as number[]
          // mock an expensive operation
          for (let j = 0; j < 10000; j++) {
            x.push(Math.random() / x.length)
          }

          flushed++
        }, [])
        return null
      })
    }

    await flushAll()

    console.info(`Time taken: ${Date.now() - start}ms`)

    expect(flushed).toBe(1000)
  })
})
