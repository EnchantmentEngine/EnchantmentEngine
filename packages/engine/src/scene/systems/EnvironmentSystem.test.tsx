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

/**
 * @warning These next few lines affect this entire test file.
 * */
const loadCubeMapTextureSpy = vi.hoisted(() => vi.fn())
vi.mock('../constants/Util', async (Original) => {
  return { ...((await Original()) as any), loadCubeMapTexture: loadCubeMapTextureSpy }
})
const createReflectionProbeRenderTargetSpy = vi.hoisted(() =>
  vi.fn((_entity: Entity, _probes: Entity[]): [Texture, () => void] => [new Texture(), () => []])
)
vi.mock('../functions/reflectionProbeFunctions', async (Original) => {
  return { ...((await Original()) as any), createReflectionProbeRenderTarget: createReflectionProbeRenderTargetSpy }
})
// @note This useTextureSpy breaks a lot of tests. Needs a better implementation
// const useTextureSpy = vi.hoisted(() => vi.fn())
// vi.mock('../../assets/functions/resourceLoaderHooks', async (Original) => {
//   return { ...((await Original()) as any), useTexture: useTextureSpy}
// })
/** @warning end */

import {
  createEngine,
  createEntity,
  defineQuery,
  destroyEngine,
  Entity,
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
import { none, ReactorRoot, startReactor, State } from '@ir-engine/hyperflux'
import { destroySpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import React from 'react'
import {
  CubeReflectionMapping,
  EquirectangularReflectionMapping,
  MeshStandardMaterial,
  NoColorSpace,
  SRGBColorSpace,
  Texture,
  UVMapping
} from 'three'
import { EnvMapComponent } from '../components/EnvmapComponent'
import { ErrorComponent } from '../components/ErrorComponent'
import { addError } from '../functions/ErrorFunctions'
import { EnvironmentSystem, EnvironmentSystemFunctions, EnvironmentSystemReactors } from './EnvironmentSystem'

type SomeEnvMapReactor = typeof EnvironmentSystemReactors.EnvMapCubemapReactor
function shouldClearMaterialEnvMap(reactor: SomeEnvMapReactor, entity: Entity): void {
  // 3. Set input & dependencies data
  const rootEntity = createEntity()
  setComponent(rootEntity, EnvMapComponent)
  setComponent(entity, MaterialStateComponent, { material: new MeshStandardMaterial() })
  const Reactor = () => {
    return React.createElement(reactor, {
      entity: entity,
      rootEntity: rootEntity
    })
  }
  const resultSpy = vi.spyOn(EnvironmentSystemFunctions, 'clearMaterialEnvMap')
  // 1. Sanity check (input & dependencies)
  expect(resultSpy).not.toHaveBeenCalled()
  // 2. Run the process
  const root = startReactor(Reactor)
  expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
  root.stop()
  // 4. Check the result (output)
  expect(resultSpy).toHaveBeenCalled()
  // 5? Cleanup (dependencies)
}

describe('IntensityReactor', () => {
  const testReactor = EnvironmentSystemReactors.IntensityReactor
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
        return React.createElement(testReactor, {
          rootEntity: rootEntity,
          entity: testEntity
        })
      }) as ReactorRoot
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMapIntensity
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  })
}) //:: IntensityReactor

describe('EnvMapSkyboxReactor', () => {
  const testReactor = EnvironmentSystemReactors.EnvMapSkyboxReactor
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
    it('should not do anything (return early) if there are no entities that have a BackgroundComponent  backgroundQuery.find()=>undefined', () => {
      const Initial = new Texture()
      // 3. Set input & dependencies data
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      const backgroundEntity = createEntity()
      // setComponent(backgroundEntity, BackgroundComponent, new Texture())
      setComponent(backgroundEntity, EntityTreeComponent, { parentEntity: rootEntity })
      setComponent(testEntity, EntityTreeComponent, { parentEntity: rootEntity })
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      const material = getMutableComponent(testEntity, MaterialStateComponent).material as State<MeshStandardMaterial>
      material.envMap.set(Initial)
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      // 1. Sanity check (input & dependencies)
      expect(haveCommonAncestor(testEntity, backgroundEntity)).toBeTruthy()
      expect(hasComponent(backgroundEntity, BackgroundComponent)).toBeFalsy()
      const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
      expect(before).toBe(Initial)
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).toBe(Initial)
      // 5? Cleanup (dependencies)
    })

    it('should not do anything (return early) if the first backgroundQuery[backgroundID] entity found has a BackgroundComponent but its value is falsy', () => {
      const Initial = new Texture()
      // 3. Set input & dependencies data
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      const backgroundEntity = createEntity()
      setComponent(backgroundEntity, EntityTreeComponent, { parentEntity: rootEntity })
      setComponent(backgroundEntity, BackgroundComponent)
      getMutableComponent(backgroundEntity, BackgroundComponent).set(none)
      setComponent(testEntity, EntityTreeComponent, { parentEntity: rootEntity })
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      const material = getMutableComponent(testEntity, MaterialStateComponent).material as State<MeshStandardMaterial>
      material.envMap.set(Initial)
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      // 1. Sanity check (input & dependencies)
      expect(haveCommonAncestor(testEntity, backgroundEntity)).toBeTruthy()
      expect(hasComponent(backgroundEntity, BackgroundComponent)).toBeTruthy()
      const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
      expect(before).toBe(Initial)
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).toBe(Initial)
      // 5? Cleanup (dependencies)
    })

    it('should set `@param props.entity`.MaterialStateComponent.material.envMap to backgroundQuery[backgroundID].BackgroundComponent', () => {
      const Expected = new Texture()
      const Initial = new Texture()
      // 3. Set input & dependencies data
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      const backgroundEntity = createEntity()
      setComponent(backgroundEntity, BackgroundComponent, Expected)
      setComponent(backgroundEntity, EntityTreeComponent, { parentEntity: rootEntity })
      setComponent(testEntity, EntityTreeComponent, { parentEntity: rootEntity })
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      const material = getMutableComponent(testEntity, MaterialStateComponent).material as State<MeshStandardMaterial>
      material.envMap.set(Initial)
      const Reactor = () => {
        return React.createElement(testReactor, {
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
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toEqual(Expected)
      // 5? Cleanup (dependencies)
    })
  })

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(testReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapSkyboxReactor

describe('EnvMapCubemapReactor', () => {
  const testReactor = EnvironmentSystemReactors.EnvMapCubemapReactor
  let testEntity = UndefinedEntity

  beforeEach(() => {
    loadCubeMapTextureSpy.mockClear()
    createEngine()
    mockSpatialEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    loadCubeMapTextureSpy.mockClear()
    removeEntity(testEntity)
    destroySpatialEngine()
    destroyEngine()
  })

  describe('on mount', () => {
    describe('on cleanup', () => {
      it('should call EnvironmentSystemFunctions.clearMaterialEnvMap with props.entity as argument', () => {
        shouldClearMaterialEnvMap(testReactor, testEntity)
      })
    })
  })

  describe('on change [envMapComponent.envMapCubemapURL])', () => {
    it('should call loadCubeMapTexture', () => {
      // 3. Set input & dependencies data
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      // 1. Sanity check (input & dependencies)
      expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
      // 2. Run the process
      const root = startReactor(Reactor)
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(loadCubeMapTextureSpy).toHaveBeenCalled()
    })

    it('should call loadCubeMapTexture passing `@param props.rootEntity`.EnvMapComponent.envMapCubemapURL as its first argument', async () => {
      const Expected = 'SomeSourceURL'
      // 3. Set input & dependencies data
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent, { envMapCubemapURL: Expected })
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
      // 2. Run the process
      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(loadCubeMapTextureSpy).toHaveBeenCalled()
      const lastCall = loadCubeMapTextureSpy.mock.calls.at(-1)!
      const envMapCubemapURL = lastCall[0]
      const onLoad = lastCall[1]
      const onProgress = lastCall[2]
      const onError = lastCall[3]
      const result = envMapCubemapURL
      // 4. Check the result (output)
      expect(result).toBe(Expected)
    })

    describe('onLoad', () => {
      it('should set `@param texture`.mapping to the value of threejs/CubeReflectionMapping', () => {
        const Expected = CubeReflectionMapping
        const Initial = UVMapping
        // 3. Set input & dependencies data
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent)
        const material = new MeshStandardMaterial({ envMap: new Texture(undefined, Initial) })
        setComponent(testEntity, MaterialStateComponent, { material: material })
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
        const root = startReactor(Reactor)
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(loadCubeMapTextureSpy).toHaveBeenCalled()
        const lastCall = loadCubeMapTextureSpy.mock.calls.at(-1)!
        const envMapCubemapURL = lastCall[0]
        const onLoad = lastCall[1]
        const onProgress = lastCall[2]
        const onError = lastCall[3]
        const texture = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        // 1. Sanity check (input & dependencies)
        expect(texture).toBeTruthy()
        const before = texture?.mapping
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // 2. Run the process
        onLoad(texture)
        const result = texture?.mapping
        // 4. Check the result (output)
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('should set `@param texture`.colorSpace to the value of threejs/SRGBColorSpace', () => {
        const Expected = SRGBColorSpace
        const Initial = NoColorSpace
        // 3. Set input & dependencies data
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent)
        const material = new MeshStandardMaterial({
          envMap: new Texture(
            undefined /* image?: TexImageSource | OffscreenCanvas, */,
            undefined /* mapping?: Mapping, */,
            undefined /* wrapS?: Wrapping, */,
            undefined /* wrapT?: Wrapping, */,
            undefined /* magFilter?: MagnificationTextureFilter, */,
            undefined /* minFilter?: MinificationTextureFilter, */,
            undefined /* format?: PixelFormat, */,
            undefined /* type?: TextureDataType, */,
            undefined /* anisotropy?: number, */,
            Initial /* colorSpace?: ColorSpace, */
          )
        })
        setComponent(testEntity, MaterialStateComponent, { material: material })
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
        const root = startReactor(Reactor)
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(loadCubeMapTextureSpy).toHaveBeenCalled()
        const lastCall = loadCubeMapTextureSpy.mock.calls.at(-1)!
        const envMapCubemapURL = lastCall[0]
        const onLoad = lastCall[1]
        const onProgress = lastCall[2]
        const onError = lastCall[3]
        const texture = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        // 1. Sanity check (input & dependencies)
        expect(texture).toBeTruthy()
        const before = texture?.colorSpace
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // 2. Run the process
        onLoad(texture)
        const result = texture?.colorSpace
        // 4. Check the result (output)
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      it('should set (closure)entity.MaterialStateComponent.material.envMap to `@param texture`', () => {
        const Expected = new Texture()
        const Initial = new Texture()
        // 3. Set input & dependencies data
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent)
        const material = new MeshStandardMaterial({ envMap: Initial })
        setComponent(testEntity, MaterialStateComponent, { material: material })
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
        const root = startReactor(Reactor)
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(loadCubeMapTextureSpy).toHaveBeenCalled()
        const lastCall = loadCubeMapTextureSpy.mock.calls.at(-1)!
        const envMapCubemapURL = lastCall[0]
        const onLoad = lastCall[1]
        const onProgress = lastCall[2]
        const onError = lastCall[3]
        // 1. Sanity check (input & dependencies)
        const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        // 2. Run the process
        onLoad(Expected)
        const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        // 4. Check the result (output)
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
      })

      /** @todo What is the correct way to check for the removeError case ? */
      it.todo("should call removeError for (closure)entity.EnvMapComponent with 'MISSING_FILE' as the error id", () => {
        // 3. Set input & dependencies data
        const TestErrorHandle = 'MISSING_FILE'
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent)
        setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
        const root = startReactor(Reactor)
        addError(testEntity, EnvMapComponent, TestErrorHandle)
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(loadCubeMapTextureSpy).toHaveBeenCalled()
        const lastCall = loadCubeMapTextureSpy.mock.calls.at(-1)!
        const envMapCubemapURL = lastCall[0]
        const onLoad = lastCall[1]
        const onProgress = lastCall[2]
        const onError = lastCall[3]
        // 1. Sanity check (input & dependencies)
        const before = hasComponent(testEntity, ErrorComponent)
        expect(before).toBeTruthy()
        // 2. Run the process
        onLoad((getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap)
        const result = hasComponent(testEntity, ErrorComponent)
        // 4. Check the result (output)
        expect(result).toBeFalsy()
      })

      it('should not do anything if `@param texture` is falsy', () => {
        const Initial = new Texture()
        // 3. Set input & dependencies data
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent)
        const material = new MeshStandardMaterial({ envMap: Initial })
        setComponent(testEntity, MaterialStateComponent, { material: material })
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
        const root = startReactor(Reactor)
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(loadCubeMapTextureSpy).toHaveBeenCalled()
        const lastCall = loadCubeMapTextureSpy.mock.calls.at(-1)!
        const envMapCubemapURL = lastCall[0]
        const onLoad = lastCall[1]
        const onProgress = lastCall[2]
        const onError = lastCall[3]
        // 1. Sanity check (input & dependencies)
        const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        expect(before).toBe(Initial)
        // 2. Run the process
        onLoad(undefined)
        const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        // 4. Check the result (output)
        expect(result).toBe(Initial)
      })
    })

    it('should call loadCubeMapTexture passing undefined to its onProgress function', async () => {
      const Expected = undefined
      // 3. Set input & dependencies data
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent, { envMapCubemapURL: 'SomeURL' })
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
      // 2. Run the process
      const root = startReactor(Reactor)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(loadCubeMapTextureSpy).toHaveBeenCalled()
      const lastCall = loadCubeMapTextureSpy.mock.calls.at(-1)!
      const envMapCubemapURL = lastCall[0]
      const onLoad = lastCall[1]
      const onProgress = lastCall[2]
      const onError = lastCall[3]
      const result = onProgress
      // 4. Check the result (output)
      expect(result).toBe(Expected)
    })

    describe('onError', () => {
      it('should set (closure)entity.MaterialStateComponent.envMap to null', () => {
        const Expected = null
        const Initial = new Texture()
        // 3. Set input & dependencies data
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent, { envMapCubemapURL: 'SomeURL' })
        setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial({ envMap: Initial }) })
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        expect(loadCubeMapTextureSpy).not.toHaveBeenCalled()
        const root = startReactor(Reactor)
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(loadCubeMapTextureSpy).toHaveBeenCalled()
        const lastCall = loadCubeMapTextureSpy.mock.calls.at(-1)!
        const envMapCubemapURL = lastCall[0]
        const onLoad = lastCall[1]
        const onProgress = lastCall[2]
        const onError = lastCall[3]
        // 1. Sanity check (input & dependencies)
        const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        expect(before).not.toBeNull()
        expect(before).not.toBeUndefined()
        expect(before).not.toBe(Expected)
        // 2. Run the process
        onError()
        const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })

      /** @todo What is the correct way to check for the addError case ? */
      it.todo(
        "should add an error to (closure)entity's EnvMapComponent with a value of ('MISSING_FILE', 'Skybox texture could not be found!')",
        () => {}
      )
    })
  })

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(testReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapCubemapReactor

describe('EnvmapProbesReactor', () => {
  const testReactor = EnvironmentSystemReactors.EnvmapProbesReactor
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
      it('should call EnvironmentSystemFunctions.clearMaterialEnvMap with props.entity as argument', () => {
        shouldClearMaterialEnvMap(testReactor, testEntity)
      })
    })
  })

  describe('on change [probeQuery]', () => {
    it('should set `@param props.entity`.MaterialStateComponent.material.envMap to a new texture created from createReflectionProbeRenderTarget', () => {
      const Expected = new Texture()
      const Initial = new Texture()
      // 3. Set input & dependencies data
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial({ envMap: Initial }) })
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      const unloadSpy = vi.fn()
      const createReflectionProbeRenderTargetMock = (_entity: Entity, _probes: Entity[]): [Texture, () => void] => [
        Expected,
        unloadSpy
      ]
      createReflectionProbeRenderTargetSpy.mockImplementationOnce(createReflectionProbeRenderTargetMock)
      // 1. Sanity check (input & dependencies)
      const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    describe('on cleanup', () => {
      it('should call the `unload` function returned by createReflectionProbeRenderTarget', () => {
        // 3. Set input & dependencies data
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent)
        setComponent(testEntity, MaterialStateComponent, {
          material: new MeshStandardMaterial({ envMap: new Texture() })
        })
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        const resultSpy = vi.fn()
        const createReflectionProbeRenderTargetMock = (_entity: Entity, _probes: Entity[]): [Texture, () => void] => [
          new Texture(),
          resultSpy
        ]
        createReflectionProbeRenderTargetSpy.mockImplementationOnce(createReflectionProbeRenderTargetMock)
        // 1. Sanity check (input & dependencies)
        expect(resultSpy).not.toHaveBeenCalled()
        // 2. Run the process
        const root = startReactor(Reactor)
        expect(resultSpy).not.toHaveBeenCalled()
        root.stop()
        // 4. Check the result (output)
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(resultSpy).toHaveBeenCalled()
        // 5? Cleanup (dependencies)
      })
    })
  })

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(testReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvmapProbesReactor

describe('EnvMapEquirectangularReactor', () => {
  const testReactor = EnvironmentSystemReactors.EnvMapEquirectangularReactor
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
      it('should call EnvironmentSystemFunctions.clearMaterialEnvMap with props.entity as argument', () => {
        shouldClearMaterialEnvMap(testReactor, testEntity)
      })
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

    /** @todo Overrides the output of useTexture, but the component does not get the result??? */
    it.todo(
      'should set `@param props.rootEntity`.EnvMapComponent.envMapSourceURL.envMapTexture.mapping to EquirectangularReflectionMapping',
      () => {
        const Expected = EquirectangularReflectionMapping
        const Initial = UVMapping
        // 3. Set input & dependencies data
        const material = new MeshStandardMaterial({ envMap: new Texture(/* image=*/ undefined, /* mapping=*/ Initial) })
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent)
        setComponent(testEntity, MaterialStateComponent, { material: material })
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        const ExpectedTexture = new Texture(/* image=*/ undefined, /* mapping=*/ Expected)
        useTextureSpy.mockImplementation((_url, _entity) => [ExpectedTexture, () => {}])
        // 1. Sanity check (input & dependencies)
        const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
          ?.mapping
        expect(before).toBe(Initial)
        expect(before).not.toBe(Expected)
        expect(useTextureSpy).not.toHaveBeenCalled()
        // 2. Run the process

        console.log((getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap)
        const root = startReactor(Reactor)
        // ?? null ?? Why ??
        console.log((getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap)

        const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
          ?.mapping
        // 4. Check the result (output)
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        expect(useTextureSpy).toHaveBeenCalled()
        expect(result).not.toBe(Initial)
        expect(result).toBe(Expected)
        // 5? Cleanup (dependencies)
        useTextureSpy.mockClear()
      }
    )

    /** @todo How to override the output of useTexture without getting null ?? */
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
      return React.createElement(testReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapEquirectangularReactor

describe('EnvMapBakeReactor', () => {
  const testReactor = EnvironmentSystemReactors.EnvMapBakeReactor
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
      it('should call EnvironmentSystemFunctions.clearMaterialEnvMap with props.entity as argument', () => {
        shouldClearMaterialEnvMap(testReactor, testEntity)
      })
    })
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
      return React.createElement(testReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith({ entity: testEntity, rootEntity: rootEntity }, {})
  })
}) //:: EnvMapBakeReactor

describe('EnvMapColorReactor', () => {
  const testReactor = EnvironmentSystemReactors.EnvMapColorReactor
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
      it('should call EnvironmentSystemFunctions.clearMaterialEnvMap with props.entity as argument', () => {
        shouldClearMaterialEnvMap(testReactor, testEntity)
      })
    })
  })

  describe('on change [envMapComponent.envMapSourceColor, materialComponent.material.uuid.value, envMapComponent.type]', () => {
    it('should increment `@params props.entity`.MaterialStateComponent.material.envMap.version by one (aka set.needsUpdate)', () => {
      const Initial = 0
      const Expected = Initial + 1
      // 3. Set input & dependencies data
      const envMap = new Texture()
      envMap.version = Initial
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial({ envMap: envMap }) })
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      // 1. Sanity check (input & dependencies)
      const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap?.version
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap?.version
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should set `@params props.entity`.MaterialStateComponent.material.envMap.colorSpace to SRGBColorSpace', () => {
      const Expected = SRGBColorSpace
      const Initial = NoColorSpace
      // 3. Set input & dependencies data
      const envMap = new Texture()
      envMap.colorSpace = Initial
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial({ envMap: envMap }) })
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      // 1. Sanity check (input & dependencies)
      const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        ?.colorSpace
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        ?.colorSpace
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should set `@params props.entity`.MaterialStateComponent.material.envMap.mapping to EquirectangularReflectionMapping', () => {
      const Expected = EquirectangularReflectionMapping
      const Initial = UVMapping
      // 3. Set input & dependencies data
      const envMap = new Texture()
      envMap.mapping = Initial
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial({ envMap: envMap }) })
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      // 1. Sanity check (input & dependencies)
      const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap?.mapping
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap?.mapping
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
      // 5? Cleanup (dependencies)
    })

    it('should set `@params props.entity`.MaterialStateComponent.material.envMap to a new texture', () => {
      const Initial = new Texture()
      // 3. Set input & dependencies data
      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial({ envMap: Initial }) })
      const rootEntity = createEntity()
      setComponent(rootEntity, EnvMapComponent)
      const Reactor = () => {
        return React.createElement(testReactor, {
          entity: testEntity,
          rootEntity: rootEntity
        })
      }
      // 1. Sanity check (input & dependencies)
      const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
      expect(before).toBe(Initial)
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).not.toBe(Initial)
      // 5? Cleanup (dependencies)
    })

    describe('on cleanup', () => {
      /** @todo The .dispose function spy is assigned. Why doesn't it work ?? */
      it.todo('.. should call `@params props.entity`.MaterialStateComponent.material.envMap.dispose', () => {
        const Initial = new Texture()
        // 3. Set input & dependencies data
        const resultSpy = vi.fn()
        Object.assign(Initial, { dispose: resultSpy })
        setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial({ envMap: Initial }) })
        const rootEntity = createEntity()
        setComponent(rootEntity, EnvMapComponent)
        const Reactor = () => {
          return React.createElement(testReactor, {
            entity: testEntity,
            rootEntity: rootEntity
          })
        }
        // 1. Sanity check (input & dependencies)
        expect(resultSpy).not.toHaveBeenCalled()
        const before = (getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial).envMap
        expect(before).toBe(Initial)
        // 2. Run the process
        const root = startReactor(Reactor)
        expect(resultSpy).not.toHaveBeenCalled()
        expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
        root.stop()
        // 4. Check the result (output)
        expect(resultSpy).toHaveBeenCalled()
        // 5? Cleanup (dependencies)
      })
    })
  })

  it('should call IntensityReactor with `@params props.entity` as props.entity and `@params props.rootEntity` as props.rootEntity', () => {
    // 3. Set input & dependencies data
    const rootEntity = createEntity()
    setComponent(rootEntity, EnvMapComponent)
    setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
    const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'IntensityReactor')
    const Reactor = () => {
      return React.createElement(testReactor, {
        entity: testEntity,
        rootEntity: rootEntity
      })
    }
    // 1. Sanity check (input & dependencies)
    expect(resultSpy).not.toHaveBeenCalled()
    // 2. Run the process
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
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

  const testReactor = EnvironmentSystemReactors.EnvMapReactor

  describe('for every entity that has a MaterialStateComponent ..', () => {
    it(".. should call EnvMapSkyboxReactor with the entity as props.entity and entityContext as props.rootEntity when entityContext.EnvMapComponent.type is 'Skybox'", () => {
      const Expected = 42
      // 3. Set input & dependencies data
      const resultSpy = vi.spyOn(EnvironmentSystemReactors, 'EnvMapSkyboxReactor')
      setComponent(testEntity, EnvMapComponent)
      const Reactor = () => {
        return React.createElement(EntityContext.Provider, { value: testEntity }, React.createElement(testReactor, {}))
      }
      for (let id = 0; id < Expected; ++id) {
        const entity = createEntity()
        setComponent(entity, MaterialStateComponent)
        setComponent(entity, EntityTreeComponent, { parentEntity: testEntity })
      }
      const query = defineQuery([MaterialStateComponent])
      // 1. Sanity check (input & dependencies)
      expect(hasComponent(testEntity, EnvMapComponent)).toBeTruthy()
      expect(query().length).toBe(Expected)
      expect(resultSpy).not.toHaveBeenCalled()
      // 2. Run the process
      const root = startReactor(Reactor)
      const result = resultSpy.mock.calls.length
      // 4. Check the result (output)
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(resultSpy).toHaveBeenCalled()
      expect(result).toBe(Expected)
    })

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
      expect(root.reflection().hasSuspendedOrTimeoutInTree).toBeFalsy()
      expect(result).toBe(Expected * 2)
    })
  }) //:: reactor
}) //:: EnvironmentSystem

describe('EnvironmentSystemFunctions', () => {
  describe('clearMaterialEnvMap', () => {
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

    it('should set `@param entity`.MaterialStateComponent.material.envMap to null if it has a value', () => {
      const Expected = null
      const Initial = new Texture()

      setComponent(testEntity, MaterialStateComponent, { material: new MeshStandardMaterial() })
      const material = getMutableComponent(testEntity, MaterialStateComponent).material as State<MeshStandardMaterial>
      material.envMap.set(Initial)

      EnvironmentSystemFunctions.clearMaterialEnvMap(testEntity)
      const resultMaterial = getComponent(testEntity, MaterialStateComponent).material as MeshStandardMaterial
      const result = resultMaterial.envMap
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  }) //:: clearMaterialEnvMap
}) //:: EnvironmentSystemFunctions
