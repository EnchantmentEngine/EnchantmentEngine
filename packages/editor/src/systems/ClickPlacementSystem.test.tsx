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

import { UndefinedEntity } from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { EditorHelperState, PlacementMode } from '../services/EditorHelperState'
import { ClickPlacementState } from './ClickPlacementSystem'

describe('ClickPlacementSystem', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('ClickPlacementState', () => {
    it('should initialize with correct default values', () => {
      const state = getState(ClickPlacementState)

      expect(state.placementEntity).toBe(UndefinedEntity)
      expect(state.selectedAsset).toBe('')
      expect(state.yawOffset).toBe(0)
      expect(state.pitchOffset).toBe(0)
      expect(state.rollOffset).toBe(0)
      expect(state.maxDistance).toBe(25)
      expect(state.metadata).toEqual({})
    })

    it('should validate placeable assets correctly', () => {
      // Test GLTF files
      expect(ClickPlacementState.isPlaceableAsset('test.gltf')).toBe(true)
      expect(ClickPlacementState.isPlaceableAsset('test.glb')).toBe(true)

      // Test image files
      expect(ClickPlacementState.isPlaceableAsset('test.png')).toBe(true)
      expect(ClickPlacementState.isPlaceableAsset('test.jpg')).toBe(true)

      // Test video files
      expect(ClickPlacementState.isPlaceableAsset('test.mp4')).toBe(true)

      // Test audio files
      expect(ClickPlacementState.isPlaceableAsset('test.mp3')).toBe(true)

      // Test volumetric files
      expect(ClickPlacementState.isPlaceableAsset('test.uvol')).toBe(true)

      // Test unsupported files
      expect(ClickPlacementState.isPlaceableAsset('test.pdf')).toBe(false)
      expect(ClickPlacementState.isPlaceableAsset('test.txt')).toBe(false)
      expect(ClickPlacementState.isPlaceableAsset('')).toBe(false)
    })

    it('should set selected asset for valid placeable assets', () => {
      const clickState = getMutableState(ClickPlacementState)

      ClickPlacementState.setSelectedAsset('test.gltf')
      expect(clickState.selectedAsset.value).toBe('test.gltf')

      ClickPlacementState.setSelectedAsset('test.png')
      expect(clickState.selectedAsset.value).toBe('test.png')
    })

    it('should not set selected asset for invalid assets', () => {
      const clickState = getMutableState(ClickPlacementState)
      const editorHelperState = getMutableState(EditorHelperState)

      // Set to click placement mode to trigger warning
      editorHelperState.placementMode.set(PlacementMode.CLICK)

      const initialAsset = clickState.selectedAsset.value
      ClickPlacementState.setSelectedAsset('test.pdf')

      // Should not change the selected asset
      expect(clickState.selectedAsset.value).toBe('')
    })

    it('should reset selected asset', () => {
      const clickState = getMutableState(ClickPlacementState)

      clickState.selectedAsset.set('test.gltf')
      expect(clickState.selectedAsset.value).toBe('test.gltf')

      ClickPlacementState.resetSelectedAsset()
      expect(clickState.selectedAsset.value).toBe('')
    })

    it('should set asset metadata', () => {
      const clickState = getMutableState(ClickPlacementState)
      const metadata = {
        thumbnail: 'thumb.png',
        name: 'Test Asset',
        type: 'Model',
        author: 'Test Author',
        dateCreated: '2023-01-01',
        fileSize: '1MB',
        dimensions: { height: 1, width: 1, depth: 1 },
        mesh: 'test.gltf',
        resources: 'resources',
        tags: ['test']
      }

      ClickPlacementState.setSelectedAssetData(metadata)
      expect(clickState.metadata.value).toEqual(metadata)
    })
  })
})
