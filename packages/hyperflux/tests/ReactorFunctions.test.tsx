import '@hookstate/core' // required for hookstate to override react properly work - see https://github.com/avkonst/hookstate/issues/412

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React, { useEffect, useLayoutEffect } from 'react'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { createHyperStore, hookstate, ReactorReconciler, startReactor, stopAllReactors, useHookstate } from '..'

describe('ReactorFunctions', () => {
  beforeEach(() => {
    createHyperStore({
      getDispatchTime: () => 0
    })
  })

  afterEach(() => {
    return stopAllReactors()
  })

  it('should be able to run effects asynchronously', async () => {
    let renderCount = 0
    let layoutEffectCount = 0
    let effectCount = 0

    const effectTrigger = hookstate(0)

    const reactorRoot = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      renderCount++

      useLayoutEffect(() => {
        layoutEffectCount++
      }, [trigger])

      useEffect(() => {
        effectCount++
      }, [trigger])

      return null
    })

    assert.equal(renderCount, 0) // rendered
    assert.equal(layoutEffectCount, 0) // layout effect run
    assert.equal(effectCount, 0) // async effect did not run

    // empty tag to allow scheduler to render
    const tag = <></>

    const { rerender, unmount } = render(tag)

    await act(() => rerender(tag))

    assert.equal(renderCount, 1) // no change if state unchanged render
    assert.equal(layoutEffectCount, 1) // no change if state unchanged layout effect run
    assert.equal(effectCount, 1) // no change if state unchanged effect run

    effectTrigger.set(1)

    await act(() => rerender(tag))

    assert.equal(renderCount, 2)
    assert.equal(layoutEffectCount, 2)
    assert.equal(effectCount, 2)

    unmount()
  })

  it('should be able to run effects synchronously', async () => {
    let renderCount = 0
    let layoutEffectCount = 0
    let effectCount = 0

    const effectTrigger = hookstate(0)

    const reactorRoot = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      renderCount++

      useLayoutEffect(() => {
        layoutEffectCount++
      }, [trigger])

      useEffect(() => {
        effectCount++
      }, [trigger])

      return null
    })

    assert.equal(renderCount, 0)
    assert.equal(layoutEffectCount, 0)
    assert.equal(effectCount, 0)

    ReactorReconciler.flushSync(() => reactorRoot.run())

    assert.equal(renderCount, 1)
    assert.equal(layoutEffectCount, 1)
    assert.equal(effectCount, 1)

    effectTrigger.set(1)

    ReactorReconciler.flushSync(() => reactorRoot.run())

    assert.equal(renderCount, 2)
    assert.equal(layoutEffectCount, 2)
    assert.equal(effectCount, 2)
  })

  it('should not update unrelated reactor when forcing run synchronously', async () => {
    createHyperStore({
      getDispatchTime: () => 0
    })

    let renderCount = 0
    let layoutEffectCount = 0
    let effectCount = 0
    let render2Count = 0
    let layoutEffect2Count = 0
    let effect2Count = 0

    const effectTrigger = hookstate(0)

    const reactorRoot = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      renderCount++

      useLayoutEffect(() => {
        layoutEffectCount++
      }, [trigger])

      useEffect(() => {
        effectCount++
      }, [trigger])

      return null
    })

    const reactorRoot2 = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      render2Count++

      useLayoutEffect(() => {
        layoutEffect2Count++
      }, [trigger])

      useEffect(() => {
        effect2Count++
      }, [trigger])

      return null
    })

    assert.equal(renderCount, 0)
    assert.equal(layoutEffectCount, 0)
    assert.equal(effectCount, 0)
    assert.equal(render2Count, 0)
    assert.equal(layoutEffect2Count, 0)
    assert.equal(effect2Count, 0)

    ReactorReconciler.flushSync(() => reactorRoot.run())

    assert.equal(renderCount, 1)
    assert.equal(layoutEffectCount, 1)
    assert.equal(effectCount, 1)
    assert.equal(render2Count, 0)
    assert.equal(layoutEffect2Count, 0)
    assert.equal(effect2Count, 0)

    effectTrigger.set(1)

    ReactorReconciler.flushSync(() => reactorRoot.run())

    assert.equal(renderCount, 2)
    assert.equal(layoutEffectCount, 2)
    assert.equal(effectCount, 2)
    assert.equal(render2Count, 0)
    assert.equal(layoutEffect2Count, 0)
    assert.equal(effect2Count, 0)

    reactorRoot.stop()
    reactorRoot2.stop()
  })

  it('should be able to run nested effects synchronously', async () => {
    let renderCount = 0
    let nestedRenderCount = 0
    let layoutEffectCount = 0
    let effectCount = 0

    const effectTrigger = hookstate({} as Record<string, number>)

    const NestedReactor = ({ label }: { label: string }) => {
      const trigger = useHookstate(effectTrigger[label])
      nestedRenderCount++

      useLayoutEffect(() => {
        layoutEffectCount++
      }, [trigger])

      useEffect(() => {
        effectCount++
      }, [trigger])

      return null
    }

    const reactorRoot = startReactor(() => {
      const trigger = useHookstate(effectTrigger)
      renderCount++

      return (
        <>
          {trigger.keys.map((key) => {
            return <NestedReactor key={key} label={key} />
          })}
        </>
      )
    })

    assert.equal(renderCount, 0)
    assert.equal(layoutEffectCount, 0)
    assert.equal(nestedRenderCount, 0)
    assert.equal(effectCount, 0)

    effectTrigger.set({ a: 0 })

    ReactorReconciler.flushSync(() => reactorRoot.run())

    assert.equal(renderCount, 1)
    assert.equal(layoutEffectCount, 1)
    assert.equal(nestedRenderCount, 1)
    assert.equal(effectCount, 1)

    effectTrigger.a.set(1)

    ReactorReconciler.flushSync(() => reactorRoot.run())

    assert.equal(renderCount, 2)
    assert.equal(layoutEffectCount, 2)
    assert.equal(nestedRenderCount, 2)
    assert.equal(effectCount, 2)

    effectTrigger.b.set(0)

    ReactorReconciler.flushSync(() => reactorRoot.run())

    assert.equal(renderCount, 3)
    assert.equal(layoutEffectCount, 3)
    assert.equal(nestedRenderCount, 4)
    assert.equal(effectCount, 3)
  })
})
