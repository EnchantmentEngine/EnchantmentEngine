import assert from 'assert'
import { describe, it } from 'vitest'
import { LookAtComponent } from './LookAtComponent'

describe('LookAtComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(LookAtComponent.name, 'LookAtComponent')
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      assert.equal(LookAtComponent.jsonID, 'IR_lookAt')
    })
  }) //:: Fields
}) //:: LookAtComponent
