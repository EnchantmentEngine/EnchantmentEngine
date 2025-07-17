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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

// hack to make tests happy
import '../../EngineModule'

import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'

import { ABSOLUTE_URL_PROTOCOL_REGEX } from './AssetLoader'

/**
 * tests
 */
describe('AssetLoader', async () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('ABSOLUTE_URL_REGEX', () => {
    it('should match absolute URLs', () => {
      const positiveCases = ['http://example.com', 'https://example.com', 'ftp://example.com', '//example.com']

      positiveCases.forEach((url) => {
        assert.match(url, ABSOLUTE_URL_PROTOCOL_REGEX, `Expected '${url}' to match ABSOLUTE_URL_REGEX`)
      })
    })

    it('should not match relative URLs', () => {
      assert.doesNotMatch(
        'example.com',
        ABSOLUTE_URL_PROTOCOL_REGEX,
        `Expected 'example.com' to not match ABSOLUTE_URL_REGEX`
      )
    })
  })
})
