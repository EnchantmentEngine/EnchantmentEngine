import { createEngine, createEntity, destroyEngine } from '@ir-engine/ecs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createMediaControlsView } from './MediaControlsUI'

describe('MediaControlsUI', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should not createMediaControlsView in nodejs(isClient False)', () => {
    const entity = createEntity()
    expect(() => createMediaControlsView(entity)).toThrow()
  })
})
