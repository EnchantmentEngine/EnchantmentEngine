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

import { Color } from 'three'
import { describe, expect, it } from 'vitest'
import {
  XRDetectedPlaneComponent,
  occlusionMat,
  placementHelperMaterial,
  shadowMaterial
} from './XRDetectedPlaneComponent'

describe('placementHelperMaterial', () => {
  it('should initialize Material.color with the expected value', () => {
    expect(placementHelperMaterial.color.getHex()).toBe(new Color('grey').getHex())
  })

  it('should initialize Material.wireframe with the expected value', () => {
    expect(placementHelperMaterial.wireframe).toBe(false)
  })

  it('should initialize Material.opacity with the expected value', () => {
    expect(placementHelperMaterial.opacity).toBe(0.5)
  })

  it('should initialize Material.transparent with the expected value', () => {
    expect(placementHelperMaterial.transparent).toBe(true)
  })
}) //:: placementHelperMaterial

describe('shadowMaterial', () => {
  it('should initialize Material.color with the expected value', () => {
    expect(shadowMaterial.color.getHex()).toBe(0x0a0a0a)
  })

  it('should initialize Material.opacity with the expected value', () => {
    expect(shadowMaterial.opacity).toBe(0.5)
  })

  it('should initialize Material.polygonOffset with the expected value', () => {
    expect(shadowMaterial.polygonOffset).toBe(true)
  })

  it('should initialize Material.polygonOffsetFactor with the expected value', () => {
    expect(shadowMaterial.polygonOffsetFactor).toBe(-0.01)
  })
}) //:: shadowMaterial

describe('occlusionMat', () => {
  it('should initialize Material.colorWrite with the expected value', () => {
    expect(occlusionMat.colorWrite).toBe(false)
  })

  it('should initialize Material.polygonOffset with the expected value', () => {
    expect(occlusionMat.polygonOffset).toBe(true)
  })

  it('should initialize Material.polygonOffsetFactor with the expected value', () => {
    expect(occlusionMat.polygonOffsetFactor).toBe(-0.01)
  })
}) //:: occlusionMat

describe('XRDetectedPlaneComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRDetectedPlaneComponent.name).toBe('XRDetectedPlaneComponent')
    })
  }) //:: Fields

  /** @todo */
  describe('createGeometryFromPolygon', () => {}) //:: createGeometryFromPolygon
  describe('updatePlaneGeometry', () => {}) //:: updatePlaneGeometry
  describe('updatePlanePose', () => {}) //:: updatePlanePose
  describe('foundPlane', () => {}) //:: foundPlane

  /** @todo */
  describe('reactor', () => {}) //:: reactor
}) //:: XRDetectedPlaneComponent
