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

import { describe, expect, it } from 'vitest'

import { PresentationSystemGroup, SystemDefinitions, SystemUUID } from '@ir-engine/ecs'
import { EnvironmentSystem } from './EnvironmentSystem'

describe('IntensityReactor', () => {}) //:: IntensityReactor
describe('EnvMapSkyboxReactor', () => {}) //:: EnvMapSkyboxReactor
describe('EnvMapCubemapReactor', () => {}) //:: EnvMapCubemapReactor
describe('EnvmapProbesReactor', () => {}) //:: EnvmapProbesReactor

describe('EnvMapEquirectangularReactor', () => {
  describe('on mount', () => {
    describe('on cleanup', () => {
      it.todo('should set `@param props.entity`.MaterialStateComponent.material.envMap to null', () => {})
    })
  })
  describe('on change [envMapTexture]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.rootEntity`.EnvMapComponent.envMapSourceURL.envMapTexture is falsy',
      () => {}
    )
    it.todo(
      'should not do anything (return early) if `@param props.rootEntity`.EnvMapComponent.envMapSourceURL.envMapTexture.isTexture is falsy',
      () => {}
    )
    it.todo(
      'should set if `@param props.rootEntity`.EnvMapComponent.envMapSourceURL.envMapTexture.mapping to EquirectangularReflectionMapping',
      () => {}
    )
    it.todo(
      'should set `@param props.entity`.MaterialStateComponent.material.envMap to `@param props.rootEntity`.EnvMapComponent.envMapSourceURL.envMapTexture',
      () => {}
    )
  })

  /** @todo Revisit these statements. They are temporary (copy/pasted) and partially incorrect */
  describe('on change [error]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.rootEntity`.EnvMapComponent.envMapSourceEntityUUID.EnvMapBakeComponent.envMapOrigin.error is falsy',
      () => {}
    )
    it.todo('should set `@param props.entity`.MaterialStateComponent.material.envMap to null', () => {})
    it.todo(
      "should call addError with (bakeEntity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')",
      () => {}
    )
  })

  it.todo(
    'should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity',
    () => {}
  )
}) //:: EnvMapEquirectangularReactor

describe('EnvMapBakeReactor', () => {
  describe('on change [envMaptexture, envMapComponent.type]', () => {
    it.todo(
      'should not do anything if `@param props.rootEntity`.EnvMapBakeComponent.envMapOrigin.envMaptexture is falsy',
      () => {}
    )
    it.todo(
      'should set `@param props.rootEntity`.EnvMapBakeComponent.envMapOrigin.envMaptexture.mapping to EquirectangularReflectionMapping',
      () => {}
    )
    it.todo(
      'should set `@param props.entity`.MaterialStateComponent.material.envMap to `@param props.rootEntity`.EnvMapBakeComponent.envMapOrigin.envMaptexture',
      () => {}
    )
  })

  describe('on change [bakeComponent?.boxProjection]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.rootEntity`.EnvMapComponent.envMapSourceEntityUUID.EnvMapBakeComponent is falsy',
      () => {}
    )
    it.todo(
      'should not do anything (return early) if `@param props.rootEntity`.EnvMapComponent.envMapSourceEntityUUID.EnvMapBakeComponent.boxProjection is falsy',
      () => {}
    )
    it.todo(
      'should set `@param props.entity`.BoxProjectionPlugin.cubeMapPos to a new Uniform created from `@param props.rootEntity`.EnvMapComponent.envMapSourceEntityUUID.EnvMapBakeComponent.bakePositionOffset',
      () => {}
    )
    it.todo(
      'should set `@param props.entity`.BoxProjectionPlugin.bakePositionOffset to a new Uniform created from `@param props.rootEntity`.EnvMapComponent.envMapSourceEntityUUID.EnvMapBakeComponent.bakeScale',
      () => {}
    )
    describe('on cleanup', () => {
      it.todo('should remove BoxProjectionPlugin from `@param props.entity`', () => {})
    })
  })

  describe('on change [error]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.rootEntity`.EnvMapComponent.envMapSourceEntityUUID.EnvMapBakeComponent.envMapOrigin.error is falsy',
      () => {}
    )
    it.todo(
      "should call addError with (bakeEntity, EnvMapComponent, 'MISSING_FILE', 'EnvMap bake texture not found!')",
      () => {}
    )
  })

  it.todo(
    'should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity',
    () => {}
  )
}) //:: EnvMapBakeReactor

describe('EnvMapColorReactor', () => {
  describe('on mount', () => {
    describe('on cleanup ..', () => {
      it.todo('.. should set `@params props.entity`.MaterialStateComponent.material.envMap to null', () => {})
    })
  })

  describe('on change [envMapComponent.envMapSourceColor, materialComponent.material.uuid.value, envMapComponent.type]', () => {
    it.todo('should set `@params props.entity`.MaterialStateComponent.material.envMap.needsUpdate to true', () => {})
    it.todo(
      'should set `@params props.entity`.MaterialStateComponent.material.envMap.colorSpace to SRGBColorSpace',
      () => {}
    )
    it.todo(
      'should set `@params props.entity`.MaterialStateComponent.material.envMap.mapping to EquirectangularReflectionMapping',
      () => {}
    )
    it.todo('should set `@params props.entity`.MaterialStateComponent.material.envMap to a new texture', () => {})
    describe('on cleanup', () => {
      it.todo('.. should call `@params props.entity`.MaterialStateComponent.material.envMap.dispose', () => {})
    })
  })

  it.todo(
    'should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity',
    () => {}
  )
}) //:: EnvMapColorReactor

describe('EnvMapReactor', () => {
  describe('for every entity that has a MaterialStateComponent ..', () => {
    it.todo(
      ".. should call EnvMapSkyboxReactor with the entity as props.entity and entityContext as props.rootEntity when entityContext.EnvMapComponent.type is 'Skybox'",
      () => {}
    )
    it.todo(
      ".. should call EnvMapCubemapReactor with the entity as props.entity and entityContext as props.rootEntity when entityContext.EnvMapComponent.type is 'Cubemap'",
      () => {}
    )
    it.todo(
      ".. should call EnvMapEquirectangularReactor with the entity as props.entity and entityContext as props.rootEntity when entityContext.EnvMapComponent.type is 'Equirectangular'",
      () => {}
    )
    it.todo(
      ".. should call EnvMapColorReactor with the entity as props.entity and entityContext as props.rootEntity when entityContext.EnvMapComponent.type is 'Color'",
      () => {}
    )
    it.todo(
      ".. should call EnvMapBakeReactor with the entity as props.entity and entityContext as props.rootEntity when entityContext.EnvMapComponent.type is 'Bake'",
      () => {}
    )
    it.todo(
      ".. should call EnvmapProbesReactor with the entity as props.entity and entityContext as props.rootEntity when entityContext.EnvMapComponent.type is 'Probes'",
      () => {}
    )
  })
}) //:: EnvMapReactor

describe('EnvironmentSystem', () => {
  const System = SystemDefinitions.get(EnvironmentSystem)!

  it('should initialize the *System.uuid field with the expected value', () => {
    expect(System.uuid).toBe('ee.engine.EnvironmentSystem')
  })

  it('should initialize the *System with the expected SystemUUID value', () => {
    expect(EnvironmentSystem).toBe('ee.engine.EnvironmentSystem' as SystemUUID)
  })

  it('should initialize the ClientInputSystem.insert field with the expected value', () => {
    expect(System.insert).not.toBe(undefined)
    expect(System.insert!.after).not.toBe(undefined)
    expect(System.insert!.after!).toBe(PresentationSystemGroup)
  })

  /** @todo */
  describe('reactor', () => {
    it.todo('should call EnvMapReactor for every entity that has an EnvMapComponent', () => {})
  }) //:: reactor
}) //:: EnvironmentSystem
