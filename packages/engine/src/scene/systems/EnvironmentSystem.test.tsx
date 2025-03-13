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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEngine,
  createEntity,
  defineQuery,
  destroyEngine,
  EntityContext,
  EntityTreeComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  haveCommonAncestor,
  PresentationSystemGroup,
  removeEntity,
  setComponent,
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity
} from '@ir-engine/ecs'
import { ReactorRoot, startReactor, State } from '@ir-engine/hyperflux'
import { destroySpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import React from 'react'
import { MeshStandardMaterial, Texture } from 'three'
import { EnvMapComponent } from '../components/EnvmapComponent'
import { EnvironmentSystem, EnvironmentSystemReactors } from './EnvironmentSystem'

describe('IntensityReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on change [envMapComponent.envMapIntensity.value, material.uuid.value]', () => {
    it('should set `@param props.entity`.MaterialStateComponent.material.envMapIntensity to `@param props.rootEntity`.EnvMapComponent.envMapIntensity', () => {
      const Expected = 42
      const Initial = 21 // componentIntensity
      // 3. Set input & dependencies data
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent, { envMapIntensity: Expected })
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      const material = getMutableComponent(testEntity, MaterialStateComponent).material as State<MeshStandardMaterial>
      material.envMapIntensity.set(Initial)
      // 1. Sanity check (input & dependencies)
      const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMapIntensity // materialIntensity
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // 2. Run the process
      const root = startReactor(() => {
        return React.createElement(EnvironmentSystemReactors.IntensityReactor, {
          rootEntity: rootEntity,
          entity: testEntity
        })
      }) as ReactorRoot
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMapIntensity
      // 4. Check the result (output)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  })
}) //:: IntensityReactor

describe('EnvMapSkyboxReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on change [backgroundQuery, materialComponent.material.uuid.value]', () => {
    /** @todo Depends on the todo tests below */
    it.todo(
      'should not do anything (return early) if the first backgroundQuery[backgroundID] entity found does not have a BackgroundComponent',
      () => {
        const Expected = false
        // 3. Set input & dependencies data
        const parentEntity = createEntity()
        const backgroundEntity = createEntity()
        setComponent(backgroundEntity, EntityTreeComponent, { parentEntity: parentEntity })
        setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
        // setComponent(backgroundEntity, BackgroundComponent)
        // 1. Sanity check (input & dependencies)
        expect(haveCommonAncestor(testEntity, backgroundEntity)).toBeTruthy()
        expect(hasComponent(backgroundEntity, BackgroundComponent)).toBeFalsy()
        // 2. Run the process
        const result = true
        // 4. Check the result (output)
        expect(result).toBe(Expected)
        // 5? Cleanup (dependencies)
      }
    )

    it.todo(
      'should not do anything (return early) if the first backgroundQuery[backgroundID] entity found has a BackgroundComponent but its value is falsy',
      () => {}
    )

    /** @todo Why is it not running any of the useEffects ?? */
    it.todo(
      'should set `@param props.entity`.MaterialStateComponent.material.envMap to backgroundQuery[backgroundID].BackgroundComponent',
      () => {
        const Expected = new Texture()
        const Initial = new Texture()
        // 3. Set input & dependencies data
        const rootEntity = createEntity()
        const backgroundEntity = createEntity()
        setComponent(backgroundEntity, BackgroundComponent, Expected)
        setComponent(backgroundEntity, EntityTreeComponent, { parentEntity: rootEntity })
        setComponent(testEntity, EntityTreeComponent, { parentEntity: rootEntity })
        setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
        const material = getMutableComponent(testEntity, MaterialStateComponent).material as State<MeshStandardMaterial>
        material.envMap.set(Initial)
        const Reactor = () => {
          return React.createElement(EnvironmentSystemReactors.EnvMapSkyboxReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        // 1. Sanity check (input & dependencies)
        expect(haveCommonAncestor(testEntity, backgroundEntity)).toBeTruthy()
        expect(hasComponent(backgroundEntity, BackgroundComponent)).toBeTruthy()
        const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // 2. Run the process
        const root = startReactor(Reactor)
        const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        // 4. Check the result (output)
        expect(result).not.toBe(Initial)
        expect(result).toEqual(Expected)
        // 5? Cleanup (dependencies)
      }
    )
  })

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(EnvironmentSystemReactors.EnvMapSkyboxReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapSkyboxReactor

describe('EnvMapCubemapReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on mount', () => {
    describe('on cleanup', () => {
      /** @todo Why is it not running any of the useEffects ?? */
      it.todo('should set `@param props.entity`.MaterialStateComponent.material.envMap to null', () => {
        const Expected = null
        const Initial = new Texture()
        // 3. Set input & dependencies data
        const rootEntity = createEntity()
        setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
        const material = getMutableComponent(testEntity, MaterialStateComponent).material as State<MeshStandardMaterial>
        material.envMap.set(Initial)
        const Reactor = () => {
          return React.createElement(EnvironmentSystemReactors.EnvMapCubemapReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        // 1. Sanity check (input & dependencies)
        const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // 2. Run the process
        const root = startReactor(Reactor)
        root.stop()
        const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        // 4. Check the result (output)
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
        // 5? Cleanup (dependencies)
      })
    })
  })

  describe('on change [envMapComponent.envMapCubemapURL])', () => {
    it.todo(
      'should call loadCubeMapTexture with (`@param props.rootEntity`.EnvMapComponent.envMapCubemapURL, fn, undefined, fn)',
      () => {}
    )
  })

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(EnvironmentSystemReactors.EnvMapCubemapReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapCubemapReactor

describe('EnvmapProbesReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on mount', () => {
    describe('on cleanup', () => {
      it.todo('should set `@param props.entity`.MaterialStateComponent.material.envMap to null', () => {})
    })
  })

  describe('on change [probeQuery]', () => {
    it.todo(
      'should set `@param props.entity`.MaterialStateComponent.material.envMap to a new texture created from createReflectionProbeRenderTarget',
      () => {}
    )
    describe('on cleanup', () => {})
    it.todo('should call the `unload` function returned by createReflectionProbeRenderTarget', () => {})
  })

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(EnvironmentSystemReactors.EnvmapProbesReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvmapProbesReactor

describe('EnvMapEquirectangularReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

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

  describe('on change [error]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.rootEntity`.EnvMapComponent.envMapSourceURL.error is falsy',
      () => {}
    )
    it.todo('should set `@param props.entity`.MaterialStateComponent.material.envMap to null', () => {})
    it.todo(
      "should call addError with (bakeEntity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')",
      () => {}
    )
  })

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(EnvironmentSystemReactors.EnvMapEquirectangularReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapEquirectangularReactor

describe('EnvMapBakeReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

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

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(EnvironmentSystemReactors.EnvMapBakeReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapBakeReactor

describe('EnvMapColorReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

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

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(EnvironmentSystemReactors.EnvMapColorReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapColorReactor

describe('EnvMapReactor', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('for every entity that has a MaterialStateComponent ..', () => {
    /** @todo Why is the sub-reactor never called */
    it.todo(
      ".. should call EnvMapSkyboxReactor with the entity as props.entity and entityContext as props.rootEntity when entityContext.EnvMapComponent.type is 'Skybox'",
      () => {
        const Expected = 42
        // 3. Set input & dependencies data
        const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'EnvMapSkyboxReactor')
        setComponent(testEntity, EnvMapComponent)
        const Reactor = () => {
          return React.createElement(
            EntityContext.Provider,
            { value: testEntity },
            React.createElement(EnvironmentSystemReactors.EnvMapReactor, {})
          )
        }
        for (let id = 0; id < Expected; ++id) setComponent(createEntity(), MaterialStateComponent)
        const query = defineQuery([MaterialStateComponent])
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, EnvMapComponent)).toBeTruthy()
        expect(query().length).toBe(Expected)
        expect(resultSpy).not.toHaveBeenCalled()
        // 2. Run the process
        const root = startReactor(Reactor)
        const result = resultSpy.mock.calls.length
        // 4. Check the result (output)
        expect(resultSpy).toHaveBeenCalled()
        expect(result).toBe(Expected * 2 + 1)
      }
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

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      destroyEngine()
    })

    it('should call EnvMapReactor for every entity that has an EnvMapComponent', () => {
      const Expected = 42
      // 3. Set input & dependencies data
      const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'EnvMapReactor')
      const Reactor = () => {
        return React.createElement(System.reactor!, {})
      }
      for (let id = 0; id < Expected; ++id) setComponent(createEntity(), EnvMapComponent)
      const query = defineQuery([EnvMapComponent])
      // 1. Sanity check (input & dependencies)
      expect(query().length).toBe(Expected)
      expect(resultSpy).not.toHaveBeenCalled()
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = resultSpy.mock.calls.length
      // 4. Check the result (output)
      expect(result).toBe(Expected * 2 + 1)
    })
  }) //:: reactor
}) //:: EnvironmentSystem
