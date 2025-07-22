import { act, render } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect } from 'react'
import sinon from 'sinon'
import { DoneCallback, afterAll, afterEach, beforeAll, beforeEach, describe, it } from 'vitest'

import { ComponentType, destroyEngine } from '@ir-engine/ecs'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'

import { EngineState } from '@ir-engine/ecs'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import { initializeSpatialEngine } from '../initializeEngine'
import { RendererComponent } from './components/RendererComponent'
import { PerformanceManager, PerformanceState } from './PerformanceState'
import { RendererState } from './RendererState'
import { RenderSettingsState } from './WebGLRendererSystem'

describe('PerformanceState', () => {
  const mockRenderer = {
    canvas: {
      getContext: (context: string) => {
        return mockRenderer.renderContext as WebGLRenderingContext
      }
    },
    renderContext: {
      getParameter: (param: number): number => {
        return param
      },
      MAX_3D_TEXTURE_SIZE: 1000,
      MAX_TEXTURE_SIZE: 2000,
      MAX_TEXTURE_IMAGE_UNITS: 3000,
      MAX_ELEMENTS_INDICES: 4000,
      MAX_ELEMENTS_VERTICES: 5000
    }
  } as unknown as ComponentType<typeof RendererComponent>

  let screen
  let dpr

  beforeAll(() => {
    screen = globalThis.window.screen
    //@ts-ignore
    globalThis.window.screen = {
      availWidth: 2000,
      availHeight: 1000
    }
    dpr = globalThis.window.devicePixelRatio
    globalThis.window.devicePixelRatio = 3
  })

  afterAll(() => {
    globalThis.window.screen = screen
    globalThis.window.devicePixelRatio = dpr
  })

  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    getMutableState(EngineState).isEditing.set(false)
    getMutableState(RendererState).automatic.set(true)
    getMutableState(PerformanceState).merge({
      initialized: true,
      enabled: true
    })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Builds Performance State', async () => {
    await PerformanceManager.buildPerformanceState(mockRenderer, {
      renderer: 'nvidia corporation, nvidia geforce rtx 3070/pcie/sse2, '
    })
    const performanceState = getState(PerformanceState)
    assert(performanceState.max3DTextureSize === 1000)
    assert(performanceState.maxBufferSize === 54000000000)
    assert(performanceState.maxIndices === 8000)
    assert(performanceState.maxTextureSize === 2000)
    assert(performanceState.maxVerticies === 10000)
  })

  it('Increments performance offset', () =>
    new Promise((done: DoneCallback) => {
      const performanceState = getMutableState(PerformanceState)
      const initialOffset = performanceState.gpuPerformanceOffset.value

      const Reactor = () => {
        const performance = useHookstate(performanceState)

        useEffect(() => {
          if (initialOffset !== performance.gpuPerformanceOffset.value) {
            assert(performance.gpuPerformanceOffset.value === initialOffset + 1)
          }
        }, [performance.gpuPerformanceOffset])

        return <></>
      }

      const { rerender, unmount } = render(<Reactor />)
      const clock = sinon.useFakeTimers()
      act(async () => {
        PerformanceManager.decrementGPUPerformance()
        clock.tick(3000)
        rerender(<Reactor />)
        clock.restore()
      }).then(() => {
        unmount()
        done()
      })
    }))

  it('Increments performance tier', () =>
    new Promise((done: DoneCallback) => {
      const performanceState = getMutableState(PerformanceState)
      const initialTier = performanceState.gpuTier.value

      const Reactor = () => {
        const performance = useHookstate(performanceState)

        useEffect(() => {
          if (initialTier !== performance.gpuTier.value) {
            assert(performance.gpuTier.value === initialTier + 1)
          }
        }, [performanceState.gpuTier])

        return <></>
      }

      const { rerender, unmount } = render(<Reactor />)
      const clock = sinon.useFakeTimers()
      act(async () => {
        PerformanceManager.incrementGPUPerformance()
        clock.tick(3000)
        rerender(<Reactor />)
        clock.restore()
      }).then(() => {
        unmount()
        done()
      })
    }))

  it('Debounces performance offset', () =>
    new Promise((done: DoneCallback) => {
      const performanceState = getMutableState(PerformanceState)
      const initialOffset = performanceState.gpuPerformanceOffset.value
      const initialTier = performanceState.gpuTier.value

      const Reactor = () => {
        const performance = useHookstate(performanceState)

        useEffect(() => {
          if (initialOffset !== performance.gpuPerformanceOffset.value) {
            assert(performance.gpuPerformanceOffset.value === initialOffset + 1)
          }
          if (initialTier !== performance.gpuTier.value) {
            assert(performance.gpuTier.value === initialTier - 1)
          }
        }, [performance.gpuPerformanceOffset, performance.gpuTier])

        return <></>
      }

      const { rerender, unmount } = render(<Reactor />)
      const clock = sinon.useFakeTimers()
      act(async () => {
        // Decrementing performance state twice consecutively should only have one reactive change with the value off by 1 instead of 2
        PerformanceManager.decrementGPUPerformance()
        PerformanceManager.decrementGPUPerformance()
        clock.tick(3000)
        rerender(<Reactor />)
        clock.restore()
      }).then(() => {
        unmount()
        done()
      })
    }))

  it('Updates render settings reactively', () =>
    new Promise((done: DoneCallback) => {
      const performanceState = getMutableState(PerformanceState)
      const initialTier = performanceState.gpuTier.value
      let updatedTier = 5
      if (updatedTier === initialTier) updatedTier -= 1

      const renderSettings = getState(RenderSettingsState)
      const engineSettings = getState(RendererState)

      const Reactor = PerformanceState.reactor

      const { rerender, unmount } = render(<Reactor />)

      const { smaaPreset } = renderSettings
      const { shadowMapResolution } = engineSettings

      act(async () => {
        performanceState.gpuTier.set(updatedTier as any)
        rerender(<Reactor />)
      }).then(() => {
        assert(smaaPreset !== renderSettings.smaaPreset)
        assert(shadowMapResolution !== engineSettings.shadowMapResolution)
        unmount()
        done()
      })
    }))
})
