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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { assertVec } from '../../../../spatial/tests/util/assert'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../../../spatial/tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../../../spatial/tests/webxr/emulator'

import {
  AnimationSystemGroup,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getMutableComponent,
  removeEntity,
  setComponent,
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { TransformComponent, TransformSystem } from '@ir-engine/spatial'
import { Vector3_Back } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { CSM } from '@ir-engine/spatial/src/renderer/csm/CSM'
import { getShadowsEnabled } from '@ir-engine/spatial/src/renderer/functions/RenderSettingsFunction'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import { BoxGeometry, Material, Mesh, Quaternion, Raycaster, Vector3 } from 'three'
import { DropShadowComponent } from '../components/DropShadowComponent'
import {
  DropShadowSystem,
  ShadowSystem,
  ShadowSystemData,
  ShadowSystemFunctions,
  ShadowSystemState
} from './ShadowSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('ShadowSystemState', () => {
  describe('name', () => {
    it('should have the expected name', () => {
      const Expected = 'ee.engine.scene.ShadowSystemState'
      const result = ShadowSystemState.name
      expect(result).toBe(Expected)
    })
  }) //:: name

  describe('initial', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    /** @todo How to change the value of isMobileXRHeadset to true */
    it.todo('should have an accumulationBudget of 4 when isMobileXRHeadset is truthy', async () => {
      const Expected = 4
      // Set the data as expected
      // Sanity check before running
      expect(isMobileXRHeadset).toBeTruthy()
      // Run and Check the result
      const result = (await ShadowSystemState.initial()).priorityQueue.accumulationBudget
      expect(result).toEqual(Expected)
    })

    it('should have an accumulationBudget of 20 when isMobileXRHeadset is falsy', async () => {
      const Expected = 20
      // Sanity check before running
      expect(isMobileXRHeadset).toBeFalsy()
      // Run and Check the result
      const result = (await ShadowSystemState.initial()).priorityQueue.accumulationBudget
      expect(result).toEqual(Expected)
    })
  }) //:: initial
}) //:: ShadowSystemState

describe('EntityChildCSMReactor', () => {
  describe('on change [shadowComponent.receive, csm]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.rendererEntity`.RendererComponent.csm is falsy',
      () => {}
    )
    it.todo('should not do anything (return early) if entityContext.ShadowComponent.receive is falsy', () => {})
    it.todo('should not do anything (return early) if entityContext.ObjectComponent is falsy', () => {})
    it.todo(
      'should call `@param props.rendererEntity`.RendererComponent.csm.setupMaterial if entityContext.ObjectComponent.material is truthy',
      () => {}
    )
    describe('on cleanup ..', () => {
      it.todo(
        '.. should call `@param props.rendererEntity`.RendererComponent.csm.teardownMaterial if entityContext.ObjectComponent.material is truthy',
        () => {}
      )
    })
  })
}) //:: EntityChildCSMReactor

describe('EntityCSMReactor', () => {
  describe('on change [directionalLight, directionalLightComponent?.castShadow.value]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.light is falsy',
      () => {}
    )
    it.todo(
      'should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.castShadow is falsy',
      () => {}
    )
    it.todo(
      'should call `@param props.rendererEntity`.RendererComponent.csm.set with a newly created CSM instance',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.light to `@param props.entity`.DirectionalLightComponent.light',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.shadowMapSize to RendererState.shadowMapResolution',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.shadowBias to `@param props.entity`.DirectionalLightComponent.shadowBias',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.maxFar to `@param props.entity`.DirectionalLightComponent.cameraFar',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.lightIntensity to `@param props.entity`.DirectionalLightComponent.intensity',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.lightColor to `@param props.entity`.DirectionalLightComponent.color',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.cascades to `@param props.renderSettingsEntity`.RenderSettingsComponent.cascades',
      () => {}
    )
    describe('on cleanup ..', () => {
      it.todo('.. should dispose of `@param props.rendererEntity`.RendererComponent.csm and set it to `null`', () => {})
    })
  })

  describe('after SceneObjectSystem ..', () => {
    it.todo(
      'should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.light is falsy',
      () => {}
    )
    it.todo(
      'should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.castShadow is falsy',
      () => {}
    )
    it.todo('should set `@param props.entity`.DirectionalLightComponent.light.visible to false', () => {})
  })

  describe('on change [ rendererComponent.csm, shadowMapResolution, directionalLight, directionalLightComponent.shadowBias, directionalLightComponent.intensity, directionalLightComponent.color, directionalLightComponent.castShadow, directionalLightComponent.shadowRadius, directionalLightComponent.cameraFar ]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.rendererEntity`.RendererComponent.csm is falsy',
      () => {}
    )
    it.todo(
      'should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.light is falsy',
      () => {}
    )
    it.todo(
      'should not do anything (return early) if `@param props.entity`.DirectionalLightComponent.castShadow is falsy',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.shadowBias to `@param props.entity`.DirectionalLightComponent.light.shadow.bias',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.maxFar to `@param props.entity`.DirectionalLightComponent.cameraFar',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.shadowMapSize to RendererState.shadowMapResolution',
      () => {}
    )
    describe('for every light in the `@param props.rendererEntity`.RendererComponent.csm.lights list ..', () => {
      it.todo(
        '.. should set light.color to a new color from `@param props.entity`.DirectionalLightComponent.color',
        () => {}
      )
      it.todo('.. should set light.intensity to `@param props.entity`.DirectionalLightComponent.intensity', () => {})
      it.todo('.. should set all components of light.shadow.mapSize to RendererState.shadowMapResolution', () => {})
      it.todo(
        '.. should set light.shadow.radius to `@param props.entity`.DirectionalLightComponent.shadowRadius',
        () => {}
      )
    })
    it.todo('should set `@param props.rendererEntity`.RendererComponent.csm.needsUpdate to true', () => {})
  })

  describe('on change [csm, renderSettingsComponent.cascades]', () => {
    it.todo(
      'should not do anything (return early) if `@param props.rendererEntity`.RendererComponent.csm is falsy',
      () => {}
    )
    it.todo(
      'should set `@param props.rendererEntity`.RendererComponent.csm.cascades to `@param props.renderSettingsEntity`.RenderSettingsComponent.cascades',
      () => {}
    )
    it.todo('should set `@param props.rendererEntity`.RendererComponent.csm.needsUpdate to true', () => {})
  })

  describe('on cleanup ..', () => {
    it.todo(
      'should call EntityChildCSMReactor for every entity with components [ShadowComponent, ObjectComponent] and `@param props.rendererEntity` as a props argument',
      () => {}
    )
  })
}) //:: EntityCSMReactor

describe('CSMReactor', () => {
  describe('on change [xrLightProbeEntity.value, renderSettingsComponent.primaryLight]', () => {
    it.todo(
      'should set `@param props.renderSettingsEntity`.RenderSettingsComponent.primaryLight to XRLightProbeState.directionalLightEntity if `@param props.renderEntity` is ReferenceSpaceState.viewerEntity and XRLightProbeState.directionalLightEntity is truthy',
      () => {}
    )
    it.todo(
      '?? should set `@param props.renderSettingsEntity`.RenderSettingsComponent.primaryLight to ???itself??? if `@param props.renderSettingsEntity`.RenderSettingsComponent.primaryLight is truthy',
      () => {}
    )
    it.todo(
      'should set `@param props.renderSettingsEntity`.RenderSettingsComponent.primaryLight to UndefinedEntity otherwise',
      () => {}
    )
  })

  describe('on cleanup', () => {
    it.todo('should call EntityCSMReactor with (key,entity,rendererEntity,renderSettingsEntity)', () => {})
  })
}) //:: CSMReactor

describe('RenderSettingsQueryReactor', () => {
  it.todo('should return null if RendererEntity is falsy', () => {})
  it.todo('should return null if RendererEntity is not ReferenceSpaceState.viewerEntity', () => {})
  it.todo('should return null if RendererState.renderMode is RenderModes.UNLIT', () => {})
  it.todo('should return null if RendererState.renderMode is RenderModes.LIT', () => {})
  it.todo('should call CSMReactor with rendererEntity and renderSettingsEntity otherwise', () => {})
}) //:: RenderSettingsQueryReactor

/** @todo Drop Shadows do not currently work */
describe('DropShadowReactor', () => {}) //:: DropShadowReactor

describe('RendererShadowReactor', () => {
  describe('on change [useShadows, rendererComponent.renderer]', () => {
    it.todo('should not do anything (return early) if RendererComponent.renderer is falsy', () => {})
    it.todo(
      'should set entityContext.RendererComponent.shadowMap.enabled to the value of (use/get)ShadowsEnabled',
      () => {}
    )
    it.todo(
      'should set entityContext.RendererComponent.shadowMap.autoUpdate to the value of (use/get)ShadowsEnabled',
      () => {}
    )
  })
}) //:: RendererShadowReactor

describe('ShadowSystem', () => {
  const System = SystemDefinitions.get(ShadowSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.ShadowSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(ShadowSystem).toBe('ee.engine.ShadowSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(AnimationSystemGroup)
    })
  }) //:: Fields

  describe('execute', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    it('should not do anything if the result of getShadowsEnabled is falsy', () => {
      // Set the data as expected
      const resultSpy = vi.fn()
      setComponent(testEntity, RendererComponent)
      const csm = { update: resultSpy as any } as CSM
      getMutableComponent(testEntity, RendererComponent).csm.set(csm)
      getMutableState(RendererState).useShadows.set(false)
      // Sanity check before running
      expect(getShadowsEnabled()).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      System.execute()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    describe('for every entity that has a RendererComponent', () => {
      it('should call entity.RendererComponent.csm.update if entity.RendererComponent.csm is truthy', () => {
        // Set the data as expected
        const resultSpy = vi.fn()
        setComponent(testEntity, RendererComponent)
        const csm = { update: resultSpy as any } as CSM
        getMutableComponent(testEntity, RendererComponent).csm.set(csm)
        // Sanity check before running
        expect(getShadowsEnabled()).toBeTruthy()
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        System.execute()
        expect(resultSpy).toHaveBeenCalled()
        expect(resultSpy).toHaveBeenCalledTimes(1)
      })

      it('should not call entity.RendererComponent.csm.update if entity.RendererComponent.csm is falsy', () => {
        /* @note Just for test coverage %
         * Can't test that the function wasn't called if csm is falsy,
         * because assigning the function makes csm truthy.
         * */
        // Set the data as expected
        const resultSpy = vi.fn()
        setComponent(testEntity, RendererComponent)
        const csm = null
        getMutableComponent(testEntity, RendererComponent).csm.set(csm)
        // Sanity check before running
        expect(getShadowsEnabled()).toBeTruthy()
        expect(resultSpy).not.toHaveBeenCalled()
        // Run and Check the result
        System.execute()
        expect(resultSpy).not.toHaveBeenCalled()
      })
    })
  }) //:: execute

  /** @todo */
  describe('reactor', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      destroyEngine()
    })

    describe('when shadowTexture changes ..', () => {
      it.todo('.. should not do anything (return) if shadowTexture is falsy', () => {})
      it.todo('.. should set _shadowMaterial.map to shadowTexture', () => {})
      it.todo('.. should set _shadowMaterial.needsUpdate to true', () => {})
    })
    it.todo(
      'should render the RenderSettingsQueryReactor once for every entity that has a RenderSettingsComponent when useShadowsEnabled is truthy',
      () => {}
    )
    it.todo(
      'should render the DropShadowReactor once for every entity that has the components [VisibleComponent, ShadowComponent] when useShadowsEnabled is falsy and shadowTexture is truthy',
      () => {}
    )
    it.todo('should render the RendererShadowReactor once for every entity that has a RendererComponent', () => {})
  }) //:: reactor
}) //:: ShadowSystem

describe('DropShadowSystem', () => {
  const System = SystemDefinitions.get(DropShadowSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.DropShadowSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(DropShadowSystem).toBe('ee.engine.DropShadowSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(TransformSystem)
    })
  }) //:: Fields

  describe('execute', () => {
    beforeEach(async () => {
      createEngine()
    })

    afterEach(() => {
      destroyEngine()
    })

    it('should call ShadowSystemFunctions.updateDropShadowTransforms when the result of getShadowsEnabled is falsy', () => {
      // Set the data as expected
      const resultSpy = vi.spyOn(ShadowSystemFunctions, 'updateDropShadowTransforms')
      getMutableState(RendererState).useShadows.set(false)
      // Sanity check before running
      expect(getShadowsEnabled()).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      System.execute()
      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledTimes(1)
    })

    it('should not call ShadowSystemFunctions.updateDropShadowTransforms when the result of getShadowsEnabled is truthy', () => {
      // Set the data as expected
      const resultSpy = vi.spyOn(ShadowSystemFunctions, 'updateDropShadowTransforms')
      // Sanity check before running
      expect(getShadowsEnabled()).toBeTruthy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      System.execute()
      expect(resultSpy).not.toHaveBeenCalled()
    })
  }) //:: execute
}) //:: DropShadowSystem

describe('ShadowSystemFunctions', () => {
  describe('updateDropShadowTransforms', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    describe('for every entity in the ShadowSystemState.priorityEntities list ..', () => {
      let material = undefined as Material | undefined
      let sceneEntity = UndefinedEntity
      let priorityEntity = UndefinedEntity
      let dropShadowEntity = UndefinedEntity
      const center = new Vector3()

      beforeEach(() => {
        const sceneEntityPosition = new Vector3(0, 42, 0)
        sceneEntity = createEntity() // shadowIntersectionEntity : Intersect against
        setComponent(sceneEntity, MeshComponent, new Mesh(new BoxGeometry()))
        setComponent(sceneEntity, VisibleComponent)
        setComponent(sceneEntity, TransformComponent, { position: sceneEntityPosition })

        priorityEntity = createEntity() // shadowCasterEntity
        setComponent(priorityEntity, VisibleComponent)
        setComponent(priorityEntity, TransformComponent)
        setComponent(priorityEntity, DropShadowComponent, { entity: createEntity(), center: center })

        dropShadowEntity = getComponent(priorityEntity, DropShadowComponent).entity
        setComponent(dropShadowEntity, VisibleComponent)
        setComponent(dropShadowEntity, TransformComponent)
        material = new Material()
        setComponent(dropShadowEntity, ObjectComponent, new Mesh(new BoxGeometry(), material))
      })

      afterEach(() => {
        material = undefined
        center.set(0, 0, 0)
        removeEntity(sceneEntity)
        removeEntity(priorityEntity)
        removeEntity(dropShadowEntity)
        sceneEntity = UndefinedEntity
        priorityEntity = UndefinedEntity
        dropShadowEntity = UndefinedEntity
      })

      describe('.. when there is no intersection or intersection.face between the scene objects and a ray casted from entity.DropShadowComponent.entity.TransformComponent.position.world ...', () => {
        it('... should set entity.DropShadowComponent.entity.TransformComponent.scale to (0,0,0)', () => {
          const Expected = new Vector3(0, 0, 0)
          const Initial = new Vector3(5, 6, 7)

          // Set the input & dependencies data
          setComponent(dropShadowEntity, TransformComponent, { scale: Initial })
          const rayDir = ShadowSystemData.shadowDirection.clone()
          const rayPos = TransformComponent.getWorldPosition(priorityEntity, new Vector3()).add(center)
          const raycaster = new Raycaster(rayPos, rayDir)
          const sceneObjects = [getComponent(sceneEntity, MeshComponent)]
          const intersected = raycaster.intersectObjects(sceneObjects, false)[0]

          // Sanity check (input & dependencies)
          expect(intersected).toBeFalsy()
          const before = getComponent(dropShadowEntity, TransformComponent).scale
          assertVec.approxEq(before, Initial, 4)
          assertVec.anyApproxNotEq(before, Expected, 4)

          // Run the process
          ShadowSystemFunctions.updateDropShadowTransforms()
          const result = getComponent(dropShadowEntity, TransformComponent).scale

          // Check the result (output)
          assertVec.anyApproxNotEq(result, Initial, 3, 0.01)
          assertVec.approxEq(result, Expected, 3, 0.01)
        })
      })

      describe('.. when there is an intersection and intersection.face between the scene objects and a ray casted from entity.DropShadowComponent.entity.TransformComponent.position.world ...', () => {
        let material = undefined as Material | undefined
        let sceneEntity = UndefinedEntity
        let priorityEntity = UndefinedEntity
        let dropShadowEntity = UndefinedEntity
        const center = new Vector3()

        beforeEach(() => {
          const sceneEntityPosition = new Vector3(0, -1.5, 0)
          sceneEntity = createEntity() // shadowIntersectionEntity : Intersect against
          setComponent(sceneEntity, MeshComponent, new Mesh(new BoxGeometry()))
          setComponent(sceneEntity, VisibleComponent)
          setComponent(sceneEntity, TransformComponent, { position: sceneEntityPosition })

          priorityEntity = createEntity() // shadowCasterEntity
          setComponent(priorityEntity, VisibleComponent)
          setComponent(priorityEntity, TransformComponent)
          setComponent(priorityEntity, DropShadowComponent, { entity: createEntity(), center: center })

          dropShadowEntity = getComponent(priorityEntity, DropShadowComponent).entity
          setComponent(dropShadowEntity, VisibleComponent)
          setComponent(dropShadowEntity, TransformComponent)
          material = new Material()
          setComponent(dropShadowEntity, ObjectComponent, new Mesh(new BoxGeometry(), material))
        })

        afterEach(() => {
          material = undefined
          center.set(0, 0, 0)
          removeEntity(sceneEntity)
          removeEntity(priorityEntity)
          removeEntity(dropShadowEntity)
          sceneEntity = UndefinedEntity
          priorityEntity = UndefinedEntity
          dropShadowEntity = UndefinedEntity
        })

        it('... should set entity.DropShadowComponent.entity.ObjectComponent.material.opacity to the expected value', () => {
          const Expected = 0.6
          const Initial = 42_000

          // Set the input & dependencies data
          material!.opacity = Initial
          const rayDir = ShadowSystemData.shadowDirection.clone()
          const rayPos = TransformComponent.getWorldPosition(priorityEntity, new Vector3()).add(center)
          const raycaster = new Raycaster(rayPos, rayDir)
          const sceneObjects = [getComponent(sceneEntity, MeshComponent)]

          // Sanity check (input & dependencies)
          const intersected = raycaster.intersectObjects(sceneObjects, false)[0]
          expect(intersected).toBeTruthy()
          expect(intersected.face).toBeTruthy()
          const before = ((getComponent(dropShadowEntity, ObjectComponent) as Mesh).material as Material).opacity
          expect(before).toBe(Initial)
          expect(before).not.toBe(Expected)

          // Run the process
          ShadowSystemFunctions.updateDropShadowTransforms()
          const result = ((getComponent(dropShadowEntity, ObjectComponent) as Mesh).material as Material).opacity

          // Check the result (output)
          expect(result).not.toBe(Initial)
          expect(result).toBe(Expected)
        })

        it('... should set entity.DropShadowComponent.entity.TransformComponent.rotation to the expected value', () => {
          const Expected = new Quaternion(1, 2, 3, 4).normalize()
          const Initial = new Quaternion(5, 6, 7, 8).normalize()

          // Set the input & dependencies data
          const rayDir = ShadowSystemData.shadowDirection.clone()
          const rayPos = TransformComponent.getWorldPosition(priorityEntity, new Vector3()).add(center)
          const raycaster = new Raycaster(rayPos, rayDir)
          const sceneObjects = [getComponent(sceneEntity, MeshComponent)]
          const intersected = raycaster.intersectObjects(sceneObjects, false)[0]
          Expected.setFromUnitVectors(intersected.face?.normal!, Vector3_Back)
          setComponent(dropShadowEntity, TransformComponent, { rotation: Initial })

          // Sanity check (input & dependencies)
          expect(intersected).toBeTruthy()
          expect(intersected.face).toBeTruthy()
          const before = getComponent(dropShadowEntity, TransformComponent).rotation
          assertVec.approxEq(before, Initial, 4)
          assertVec.anyApproxNotEq(before, Expected, 4)

          // Run the process
          ShadowSystemFunctions.updateDropShadowTransforms()
          const result = getComponent(dropShadowEntity, TransformComponent).rotation

          // Check the result (output)
          assertVec.anyApproxNotEq(result, Initial, 4, 0.01)
          assertVec.approxEq(result, Expected, 4, 0.01)
        })

        it('... should set entity.DropShadowComponent.entity.TransformComponent.scale to the expected value', () => {
          const Expected = new Vector3(0, 0, 0)
          const Initial = new Vector3(5, 6, 7)

          // Set the input & dependencies data
          setComponent(dropShadowEntity, TransformComponent, { scale: Initial })
          const rayDir = ShadowSystemData.shadowDirection.clone()
          const rayPos = TransformComponent.getWorldPosition(priorityEntity, new Vector3()).add(center)
          const raycaster = new Raycaster(rayPos, rayDir)
          const sceneObjects = [getComponent(sceneEntity, MeshComponent)]
          const intersected = raycaster.intersectObjects(sceneObjects, false)[0]

          // Sanity check (input & dependencies)
          expect(intersected).toBeTruthy()
          expect(intersected.face).toBeTruthy()
          const before = getComponent(dropShadowEntity, TransformComponent).scale
          assertVec.approxEq(before, Initial, 4)
          assertVec.anyApproxNotEq(before, Expected, 4)

          // Run the process
          ShadowSystemFunctions.updateDropShadowTransforms()
          const result = getComponent(dropShadowEntity, TransformComponent).scale

          // Check the result (output)
          assertVec.anyApproxNotEq(result, Initial, 3, 0.01)
          assertVec.approxEq(result, Expected, 3, 0.01)
        })

        it('... should set entity.DropShadowComponent.entity.TransformComponent.position to the expected value', () => {
          const Expected = new Vector3(0, -0.99, 0)
          const Initial = new Vector3(5, 6, 7)

          // Set the input & dependencies data
          setComponent(dropShadowEntity, TransformComponent, { position: Initial })
          const rayDir = ShadowSystemData.shadowDirection.clone()
          const rayPos = TransformComponent.getWorldPosition(priorityEntity, new Vector3()).add(center)
          const raycaster = new Raycaster(rayPos, rayDir)
          const sceneObjects = [getComponent(sceneEntity, MeshComponent)]
          const intersected = raycaster.intersectObjects(sceneObjects, false)[0]

          // Sanity check (input & dependencies)
          expect(intersected).toBeTruthy()
          expect(intersected.face).toBeTruthy()
          const before = getComponent(dropShadowEntity, TransformComponent).position
          assertVec.approxEq(before, Initial, 4)
          assertVec.anyApproxNotEq(before, Expected, 4)

          // Run the process
          ShadowSystemFunctions.updateDropShadowTransforms()
          const result = getComponent(dropShadowEntity, TransformComponent).position

          // Check the result (output)
          assertVec.anyApproxNotEq(result, Initial, 3, 0.01)
          assertVec.approxEq(result, Expected, 3, 0.01)
        })
      })
    })
  }) //:: updateDropShadowTransforms
}) //:: ShadowSystemFunctions
