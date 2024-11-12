import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { createEngine, destroyEngine } from './Engine'
import { createEntity, entityExists } from './EntityFunctions'

describe('EntityFunctions', async () => {
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  describe('createEntity', () => {
    it('create basic entity'),
      () => {
        const entity = createEntity()
        assert.equal(entityExists(entity), true)
      }
  })
})
