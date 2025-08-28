import { renderHook } from '@testing-library/react'
import assert from 'assert'
import { describe, it } from 'vitest'
import { useImmediateEffect } from '../src/hooks/useImmediateEffect'

describe('useImmediateEffect', () => {
  it('should call the effect function immediately', () => {
    let effectCalled = false
    const effect = () => {
      effectCalled = true
    }

    const { rerender } = renderHook((deps: number[]) => useImmediateEffect(effect, deps), {
      initialProps: []
    })

    rerender([])

    assert(effectCalled)
  })

  it('should call the cleanup function when dependencies change', () => {
    let cleanupCalled = false
    const effect = () => {
      return () => {
        cleanupCalled = true
      }
    }

    const { rerender } = renderHook<void, number[]>((deps: number[]) => useImmediateEffect(effect, deps), {
      initialProps: []
    })

    rerender([1, 2, 3])

    assert(cleanupCalled)
  })

  it('should not call the cleanup function when dependencies do not change', () => {
    let cleanupCalled = false
    const effect = () => {
      return () => {
        cleanupCalled = true
      }
    }

    const { rerender } = renderHook((deps: number[]) => useImmediateEffect(effect, deps), {
      initialProps: [1, 2, 3]
    })

    rerender([1, 2, 3])

    assert(!cleanupCalled)
  })
})
