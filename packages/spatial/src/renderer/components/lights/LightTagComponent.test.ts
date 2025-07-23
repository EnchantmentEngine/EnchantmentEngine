import assert from 'assert'
import { describe, it } from 'vitest'
import { LightTagComponent } from './LightTagComponent'

describe('LightTagComponent', () => {
  describe('IDs', () => {
    it('should initialize the LightTagComponent.name field with the expected value', () => {
      assert.equal(LightTagComponent.name, 'LightTagComponent')
    })
  }) //:: IDs
})
