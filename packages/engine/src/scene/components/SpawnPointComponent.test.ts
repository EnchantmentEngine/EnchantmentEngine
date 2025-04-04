/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

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
