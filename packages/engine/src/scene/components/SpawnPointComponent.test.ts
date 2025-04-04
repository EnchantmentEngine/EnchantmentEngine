import { getChildrenWithComponents, getComponent, setComponent } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { assert, describe, expect } from 'vitest'
import { it } from '../util/testUtil'
import { SpawnPointComponent } from './SpawnPointComponent'

describe('SpawnPointComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(SpawnPointComponent.name, 'SpawnPointComponent')
    })

    it('should initialize the *Component.jsonID field with the expected value', () => {
      assert.equal(SpawnPointComponent.jsonID, 'EE_spawn_point')
    })
  })
  describe('reactor', () => {
    it('should initialize a child helper entity', ({ entity }) => {
      setComponent(entity, SpawnPointComponent)
      getComponent(entity, SpawnPointComponent)
      const helper = getChildrenWithComponents(entity, [TransformComponent])
      expect(helper).toBeTruthy()
    })
  })
})
