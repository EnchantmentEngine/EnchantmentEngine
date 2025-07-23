import {
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { Color, CubeTexture, Fog, FogExp2, Texture } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { BackgroundComponent, EnvironmentMapComponent, FogComponent, SceneComponent } from './SceneComponents'

describe('SceneComponent', () => {
  describe('IDs', () => {
    it('should initialize the SceneComponent.name field with the expected value', () => {
      assert.equal(SceneComponent.name, 'SceneComponent')
    })
  }) //:: IDs
})

type BackgroundComponentData = Color | Texture | CubeTexture
const BackgroundComponentDefaults = undefined! as BackgroundComponentData

function assertBackgroundComponentEq(A: BackgroundComponentData, B: BackgroundComponentData) {
  assert.equal(Boolean(A), Boolean(B))
  assert.deepEqual(A, B)
}

function assertBackgroundComponentNotEq(A: BackgroundComponentData, B: BackgroundComponentData) {
  assert.notDeepEqual(A, B)
}

describe('BackgroundComponent', () => {
  describe('IDs', () => {
    it('should initialize the BackgroundComponent.name field with the expected value', () => {
      assert.equal(BackgroundComponent.name, 'BackgroundComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, BackgroundComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, BackgroundComponent as any) as Color | Texture | CubeTexture
      assertBackgroundComponentEq(data, BackgroundComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, BackgroundComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized BackgroundComponent', () => {
      const before = getComponent(testEntity, BackgroundComponent as any) as Color | Texture | CubeTexture
      setComponent(testEntity, BackgroundComponent, new Color('#123456'))
      const after = getComponent(testEntity, BackgroundComponent as any) as Color | Texture | CubeTexture
      assertBackgroundComponentNotEq(before, after)
    })
  }) //:: onSet
}) //:: BackgroundComponent

const EnvironmentMapComponentDefaults = null! as Texture

function assertEnvironmentMapComponentEq(A: Texture, B: Texture) {
  assert.deepEqual(A, B)
}

function assertEnvironmentMapComponentNotEq(A: Texture, B: Texture) {
  assert.notDeepEqual(A, B)
}

describe('EnvironmentMapComponent', () => {
  describe('IDs', () => {
    it('should initialize the EnvironmentMapComponent.name field with the expected value', () => {
      assert.equal(EnvironmentMapComponent.name, 'EnvironmentMapComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, EnvironmentMapComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, EnvironmentMapComponent)
      assertEnvironmentMapComponentEq(data, EnvironmentMapComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, EnvironmentMapComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized EnvironmentMapComponent', () => {
      const before = getComponent(testEntity, EnvironmentMapComponent)
      setComponent(testEntity, EnvironmentMapComponent, new Texture({} as OffscreenCanvas, 303))
      const after = getComponent(testEntity, EnvironmentMapComponent)
      assertEnvironmentMapComponentNotEq(before, after)
    })
  }) //:: onSet
}) //:: EnvironmentMapComponent

type FogData = Fog | FogExp2
const FogComponentDefaults = undefined! as FogData

function assertFogComponentEq(A: FogData, B: FogData) {
  assert.equal(Boolean(A), Boolean(B))
  if (!A && !B) return
  const a = {
    name: (A !== null && A.name) || A,
    color: (A !== null && A.color) || A,
    json: (A !== null && A.toJSON) || A
  }
  const b = {
    name: (B !== null && B.name) || B,
    color: (B !== null && B.color) || B,
    json: (B !== null && B.toJSON) || B
  }
  assert.equal(a.name, b.name)
  assert.deepEqual(a.color, b.color)
  assert.deepEqual(a.json, b.json)
}

function assertFogComponentNotEq(A: FogData, B: FogData) {
  assert.notDeepEqual(A, B)
}

describe('FogComponent', () => {
  describe('IDs', () => {
    it('should initialize the FogComponent.name field with the expected value', () => {
      assert.equal(FogComponent.name, 'FogComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, FogComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, FogComponent)
      assertFogComponentEq(data, FogComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, FogComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized FogComponent', () => {
      const before = getComponent(testEntity, FogComponent)
      setComponent(testEntity, FogComponent, { name: 'testFog' } as FogData)
      const after = getComponent(testEntity, FogComponent)
      assertFogComponentNotEq(before, after)
    })
  }) //:: onSet
}) //:: FogComponent
