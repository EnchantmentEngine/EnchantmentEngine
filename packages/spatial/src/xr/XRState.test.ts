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

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'
import { DepthDataTexture } from './DepthDataTexture'
import { XRAction, XRState } from './XRState'

const XRStateDefaults = {
  sessionActive: false,
  requestingSession: false,
  scenePosition: new Vector3(),
  sceneRotation: new Quaternion(),
  sceneScale: 1,
  sceneScaleAutoMode: true,
  sceneScaleTarget: 1,
  sceneRotationOffset: 0,
  scenePlacementMode: 'unplaced' as 'unplaced' | 'placing' | 'placed',
  supportedSessionModes: {
    inline: false,
    'immersive-ar': false,
    'immersive-vr': false
  },
  avatarCameraMode: 'auto' as 'auto' | 'attached' | 'detached',
  unassingedInputSources: [] as XRInputSource[],
  session: null as XRSession | null,
  sessionMode: 'none' as 'inline' | 'immersive-ar' | 'immersive-vr' | 'none',
  depthDataTexture: null as DepthDataTexture | null,
  is8thWallActive: false,
  viewerPose: null as XRViewerPose | null | undefined,
  userEyeHeight: 1.75,
  userHeightRatio: 1,
  xrFrame: null as XRFrame | null
}

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRAction', () => {
  describe('sessionChanged', () => {
    it('should initialize the .name field with the expected value', () => {
      expect(XRAction.sessionChanged.type).toBe('xre.xr.sessionChanged')
    })
  }) //:: XRAction.sessionChanged

  describe('vibrateController', () => {
    it('should initialize the .name field with the expected value', () => {
      expect(XRAction.vibrateController.type).toBe('xre.xr.vibrateController')
    })
  }) //:: XRAction.vibrateController
}) //:: XRAction

describe('XRState', () => {
  describe('Fields', () => {
    it('should initialize the .name field with the expected value', () => {
      expect(XRState.name).toBe('XRState')
    })
  }) //:: XRState Fields

  describe('initial', () => {
    it('should initialize the data with the expected values', () => {
      const result = XRState.initial()
      expect(result).deep.equal(XRStateDefaults)
    })
  }) //:: XRState.initial

  describe('getWorldScale', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should return the world scale of XRState by multiplying XRState.sceneScale by XRState.userHeightRatio', () => {
      const SceneScale = 21
      const UserHeightRatio = 2
      const Expected = 42
      // Set the data as expected
      getMutableState(XRState).sceneScale.set(SceneScale)
      getMutableState(XRState).userHeightRatio.set(UserHeightRatio)
      // Sanity check before running
      const before = getState(XRState)
      expect(before.sceneScale).toBe(SceneScale)
      expect(before.userHeightRatio).toBe(UserHeightRatio)
      // Run and Check the result
      const result = XRState.worldScale
      expect(result).toBe(Expected)
    })
  }) //:: XRState.worldScale.get

  /** @todo */
  describe('isMovementControlsEnabled', () => {}) //:: XRState.isMovementControlsEnabled
  describe('useMovementControlsEnabled', () => {}) //:: XRState.useMovementControlsEnabled
  describe('isCameraAttachedToAvatar', () => {}) //:: XRState.isCameraAttachedToAvatar
  describe('useCameraAttachedToAvatar', () => {}) //:: XRState.useCameraAttachedToAvatar
  describe('setTrackingSpace', () => {}) //:: XRState.setTrackingSpace
}) //:: XRState
