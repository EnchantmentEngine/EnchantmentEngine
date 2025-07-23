import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from './emulator'

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { XRState } from '../../src/xr/XRState'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('WebXR-emulator', () => {
  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should be able to define and initialize a device', async () => {
    expect(getState(XRState).session).not.toBe(null)
    expect(getState(XRState).session).not.toBe(undefined)
  })
}) //:: WebXR-emulator
