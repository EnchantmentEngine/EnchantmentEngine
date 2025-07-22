import assert from 'assert'
import { describe, it } from 'vitest'
import { TweenComponent } from './TweenComponent'

describe('TweenComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(TweenComponent.name, 'TweenComponent')
    })
  }) //:: Fields
}) //:: TweenComponent
