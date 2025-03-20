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

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { GLTF } from '@gltf-transform/core'
import {
  createEngine,
  createEntity,
  destroyEngine,
  EntityTreeComponent,
  getAncestorWithComponents,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { getState, startReactor } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { BoxGeometry, Mesh } from 'three'
import { BINARY_EXTENSION_HEADER_MAGIC } from '../assets/loaders/gltf/GLTFExtensions'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { SourceComponent, SourceID } from '../scene/components/SourceComponent'
import {
  getGLTFOptions,
  GLTFComponent,
  GLTFComponentFunctions,
  parseBinaryData,
  useHasModelOrIndependentMesh
} from './GLTFComponent'

describe('GLTFComponent', () => {
  type ComponentDependencies = any

  describe('useDependenciesLoaded', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    it('should return the result of calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies', () => {
      const dependencies = { componentDependencies: {} } as ComponentDependencies
      const Expected = GLTFComponentFunctions.componentDependenciesLoaded(dependencies)

      setComponent(testEntity, GLTFComponent, { dependencies: dependencies })
      let state: boolean = false
      const Reactor = () => {
        state = GLTFComponent.useDependenciesLoaded(testEntity)
        return null
      }
      const before = state
      expect(before).not.toBe(Expected)

      const root = startReactor(Reactor)
      const result = state
      expect(result).toBe(Expected)
    })
  }) //:: useDependenciesLoaded

  describe('useSceneLoaded', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    it('should return false (return early) if `@param entity`.GLTFComponent is falsy', () => {
      const Expected = false

      let state: boolean = false
      const Reactor = () => {
        state = GLTFComponent.useSceneLoaded(testEntity)
        return null
      }

      const root = startReactor(Reactor)
      const result = state
      expect(result).toBe(Expected)
    })

    describe('when progress is 100 ..', () => {
      const progress = 100

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false', () => {
        const Expected = false

        const dependencies = { componentDependencies: { one: {} as any } } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        let state: boolean = false
        const Reactor = () => {
          state = GLTFComponent.useSceneLoaded(testEntity)
          return null
        }

        const root = startReactor(Reactor)
        const result = state
        expect(result).toBe(Expected)
      })

      it('should return true when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true', () => {
        const Expected = true

        const dependencies = { componentDependencies: {} } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeTruthy()

        let state: boolean = false
        const Reactor = () => {
          state = GLTFComponent.useSceneLoaded(testEntity)
          return null
        }

        const root = startReactor(Reactor)
        const result = state
        expect(result).toBe(Expected)
      })
    })

    describe('when progress is not 100 ..', () => {
      const progress = 100 - 1

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false', () => {
        const Expected = false

        const dependencies = { componentDependencies: { one: {} as any } } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).not.toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeFalsy()

        let state: boolean = false
        const Reactor = () => {
          state = GLTFComponent.useSceneLoaded(testEntity)
          return null
        }

        const root = startReactor(Reactor)
        const result = state
        expect(result).toBe(Expected)
      })

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true', () => {
        const Expected = false

        const dependencies = { componentDependencies: {} } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).not.toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeTruthy()

        let state: boolean = false
        const Reactor = () => {
          state = GLTFComponent.useSceneLoaded(testEntity)
          return null
        }

        const root = startReactor(Reactor)
        const result = state
        expect(result).toBe(Expected)
      })
    })
  }) //:: useSceneLoaded

  describe('isSceneLoaded', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    it('should return false (return early) if `@param entity`.GLTFComponent is falsy', () => {
      const Expected = false
      const result = GLTFComponent.isSceneLoaded(testEntity)
      expect(result).toBe(Expected)
    })

    describe('when progress is 100 ..', () => {
      const progress = 100

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false', () => {
        const Expected = false

        const dependencies = { componentDependencies: { one: {} as any } } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        const result = GLTFComponent.isSceneLoaded(testEntity)
        expect(result).toBe(Expected)
      })

      it('should return true when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true', () => {
        const Expected = true

        const dependencies = { componentDependencies: {} } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeTruthy()

        const result = GLTFComponent.isSceneLoaded(testEntity)
        expect(result).toBe(Expected)
      })
    })

    describe('when progress is not 100 ..', () => {
      const progress = 100 - 1

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false', () => {
        const Expected = false

        const dependencies = { componentDependencies: { one: {} as any } } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).not.toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeFalsy()

        const result = GLTFComponent.isSceneLoaded(testEntity)
        expect(result).toBe(Expected)
      })

      it('should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true', () => {
        const Expected = false

        const dependencies = { componentDependencies: {} } as ComponentDependencies
        setComponent(testEntity, GLTFComponent, { dependencies: dependencies, progress: progress })

        expect(hasComponent(testEntity, GLTFComponent)).true
        expect(getComponent(testEntity, GLTFComponent).progress).not.toBe(100)
        expect(
          GLTFComponentFunctions.componentDependenciesLoaded(getComponent(testEntity, GLTFComponent).dependencies)
        ).toBeTruthy()

        const result = GLTFComponent.isSceneLoaded(testEntity)
        expect(result).toBe(Expected)
      })
    })
  }) //:: isSceneLoaded

  describe('getInstanceID', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    describe('when `@param entity` does not have a GLTFComponent ..', () => {
      it('.. should return `@param entity`.SourceComponent if it is truthy', () => {
        const Expected = 'SomeSourceID' as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeFalsy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeTruthy()
        // 2. Run the process
        const result = GLTFComponent.getInstanceID(testEntity)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })

      it(".. should return '' if `@param entity`.SourceComponent is falsy", () => {
        const Expected = '' as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeFalsy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeFalsy()
        // 2. Run the process
        const result = GLTFComponent.getInstanceID(testEntity)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })
    })

    describe('when `@param entity` has a GLTFComponent ..', () => {
      it(".. should return '' if `@param entity`.UUIDComponent is falsy", () => {
        const Expected = '' as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent)
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(hasComponent(testEntity, UUIDComponent)).toBeFalsy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeFalsy()
        // 2. Run the process
        const result = GLTFComponent.getInstanceID(testEntity)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })

      it(".. should return '' if `@param entity`.GLTFComponent is falsy", () => {
        const Expected = '' as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent)
        getMutableComponent(testEntity, GLTFComponent).set(null as any)
        setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(hasComponent(testEntity, UUIDComponent)).toBeTruthy()
        expect(getComponent(testEntity, GLTFComponent)).toBeFalsy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeFalsy()
        // 2. Run the process
        const result = GLTFComponent.getInstanceID(testEntity)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })

      it('.. should return the result of SourceComponent.getSourceID with entity.(UUIDCOmponent, GLTFComponent.src) as arguments', () => {
        const uuid = UUIDComponent.generateUUID()
        const src = 'SomeSourcePath'
        const Expected = `${uuid}-${src}` as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent, { src: src })
        setComponent(testEntity, UUIDComponent, uuid)
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(hasComponent(testEntity, UUIDComponent)).toBeTruthy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeTruthy()
        // 2. Run the process
        const result = GLTFComponent.getInstanceID(testEntity)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })
    })
  }) //:: getInstanceID

  describe('useInstanceID', () => {
    let testEntity = UndefinedEntity
    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEngine()
    })

    describe('when `@param entity` does not have a GLTFComponent ..', () => {
      it('.. should return `@param entity`.SourceComponent if it is truthy', () => {
        const Expected = 'SomeSourceID' as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeFalsy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeTruthy()
        // 2. Run the process
        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })

      it(".. should return '' if `@param entity`.SourceComponent is falsy", () => {
        const Expected = '' as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeFalsy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeFalsy()
        // 2. Run the process
        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })
    })

    describe('when `@param entity` has a GLTFComponent ..', () => {
      it(".. should return '' if `@param entity`.UUIDComponent is falsy", () => {
        const Expected = '' as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent)
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(hasComponent(testEntity, UUIDComponent)).toBeFalsy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeFalsy()
        // 2. Run the process
        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })

      it(".. should return '' if `@param entity`.GLTFComponent is falsy", () => {
        const Expected = '' as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent)
        getMutableComponent(testEntity, GLTFComponent).set(null as any)
        setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(hasComponent(testEntity, UUIDComponent)).toBeTruthy()
        expect(getComponent(testEntity, GLTFComponent)).toBeFalsy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeFalsy()
        // 2. Run the process
        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })

      it('.. should return the result of SourceComponent.getSourceID with entity.(UUIDCOmponent, GLTFComponent.src) as arguments', () => {
        const uuid = UUIDComponent.generateUUID()
        const src = 'SomeSourcePath'
        const Expected = `${uuid}-${src}` as SourceID
        // 3. Set input & dependencies data
        setComponent(testEntity, SourceComponent, Expected)
        setComponent(testEntity, GLTFComponent, { src: src })
        setComponent(testEntity, UUIDComponent, uuid)
        // 1. Sanity check (input & dependencies)
        expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
        expect(hasComponent(testEntity, UUIDComponent)).toBeTruthy()
        expect(hasComponent(testEntity, SourceComponent)).toBeTruthy()
        expect(getComponent(testEntity, SourceComponent)).toBeTruthy()
        // 2. Run the process
        let result = '' as SourceID
        const Reactor = () => {
          result = GLTFComponent.useInstanceID(testEntity)
          return null
        }
        const root = startReactor(Reactor)
        // 4. Check the result (output)
        expect(result).toBe(Expected)
      })
    })
  }) //:: useInstanceID
}) //:: GLTFComponent

// ? componentDependenciesLoaded
// ? loadDependencies
// ? buildComponentDependencies
// ? useGLTFDocument
// ? ResourceReactor
// ? DependencyReactor
describe('GLTFComponentReactor', () => {
  // dep: entityContext
  // dep: entityContext.GLTFComponent
  describe('on change [gltfComponent.cameraOcclusion]', () => {
    it.todo(
      'should call ObjectLayerMaskComponent.disableLayer if entityContext.GLTFComponent.cameraOcclusion is falsy',
      () => {}
    )
    it.todo(
      'should call ObjectLayerMaskComponent.enableLayer if entityContext.GLTFComponent.cameraOcclusion is truthy',
      () => {}
    )
  }) //:: [gltfComponent.cameraOcclusion]

  // @todo How to check for useGLTFDocument(entityContext) ?

  describe('on change [gltfComponent.src]', () => {
    it.todo('should set AssetState[GLTFComponent.getInstanceID(entityContext)] to entityContext', () => {})
    describe('on cleanup', () => {
      it.todo('should set AssetState[GLTFComponent.getInstanceID(entityContext)] to none', () => {})
    })
  }) //:: [gltfComponent.src]

  describe('on change [gltfComponent.document]', () => {
    it.todo('should not do anything (return early) if entityContext.GLTFComponent.document is falsy', () => {})
    // dep: entityContext.GLTFComponent
    // dep: entityContext.GLTFComponent.src
    // dep: entityContext.GLTFComponent.document
    // dep: AssetLoaderState.gltfLoader
    // dep: entityContext.GLTFComponent.body
    // dep: AssetLoaderState.gltfLoader.manager
    // dep: entityContext.GLTFComponent.document.scene || 0
    it.todo('should remove the AnimationComponent of entityContext', () => {})

    // @todo How to run/check the code inside .then ?
    it.todo(
      'should call GLTFLoaderFunctions.loadScene with the generated glTF loader options and sceneIndex as arguments',
      () => {}
    )

    describe('on cleanup', () => {
      // @todo ?? testable ?? : should set documentLoaded to false
      it.todo(
        'should call GLTFLoaderFunctions.unloadScene with (entityContex.GLTFDocument.src, entityContext) as arguments',
        () => {}
      )
      // @todo ?? testable ?? : should set aborted to true
      it.todo('should call (closure)unloadEntities', () => {})
      it.todo('should set entityContext.GLTFComponent.progress to 0 if entityContext has a GLTFComponent', () => {})
    })
  }) //:: [gltfComponent.document]

  // dep: entityContext.GLTFComponent.dependencies
  // dep: entityContext.SceneComponent
  describe('on change [sceneLoaded, !!scene]', () => {
    it.todo('should not do anything (return early) if sceneLoaded is falsy', () => {})
    it.todo('should not do anything (return early) if scene is falsy', () => {})
    it.todo('should set a SceneComponent to entityContext with {active:true}', () => {})
  }) //:: [sceneLoaded, !!scene]

  describe('on cleanup', () => {
    describe('when entityContext.GLTFDocument.dependencies is truthy and componentDependenciesLoaded is falsy', () => {
      it.todo(
        'should call ResourceReactor with sourceID as props.documentID, entityContext as props.entity and documentLoaded as props.documentLoaded',
        () => {}
      )
      it.todo(
        'should call DependencyReactor with entityContext as key, entityContext as props.gltfComponentEntity and entityContext.GLTFDocument.dependencies as props.dependencies',
        () => {}
      )
    })
  })
}) //:: GLTFComponentReactor

describe('loadGLTFFile', () => {
  /** @todo How to test this functionality ? */
}) //:: loadGLTFFile

describe('parseBinaryData', () => {
  /** @todo Create with mockGLB instead */
  it('should throw an error if the first 4 bytes of `@param data` are not equal to BINARY_EXTENSION_HEADER_MAGIC', () => {
    // 3. Set input & dependencies data
    const data = new TextEncoder().encode('STAR')
    // 1. Sanity check (input & dependencies)
    expect(data.slice(0, 4)).not.toBe(BINARY_EXTENSION_HEADER_MAGIC)
    // 2. Run the process
    expect(() => {
      parseBinaryData(data)
    }).toThrowError()
  })

  /** @todo Create with mockGLB instead */
  it('should throw an error if the first 4 bytes of `@param data` are equal to BINARY_EXTENSION_HEADER_MAGIC and the uint32 at byte 4 is less than 2.0', () => {
    // 3. Set input & dependencies data
    const u32 = '\0\0\0\0'
    const data = new TextEncoder().encode(BINARY_EXTENSION_HEADER_MAGIC + u32 + u32)
    const view = new DataView(data.buffer)
    // 1. Sanity check (input & dependencies)
    expect(new TextDecoder().decode(data.slice(0, 4))).toBe(BINARY_EXTENSION_HEADER_MAGIC)
    expect(view.getUint32(4, true)).toBeLessThan(2.0)
    // 2. Run the process
    expect(() => {
      parseBinaryData(data)
    }).toThrowError()
  })

  /** @todo Create with mockGLB */
  it.todo(
    'should decode and parse the BINARY_EXTENSION_CHUNK_TYPES.JSON chunk data into the result.json object',
    () => {}
  )
  it.todo('should copy the entire BINARY_EXTENSION_CHUNK_TYPES.BIN chunk data into the result.body object', () => {})
  it.todo('should throw an error if the BINARY_EXTENSION_CHUNK_TYPES.JSON chunk was not found', () => {})
}) //:: parseBinaryData

describe('useHasModelOrIndependentMesh', () => {
  let testEntity = UndefinedEntity
  beforeEach(() => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEngine()
  })

  it('should return true if `@param entity` has a GLTFComponent', () => {
    const Expected = true
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent)
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    // 2. Run the process
    let result = !Expected
    const Reactor = () => {
      result = useHasModelOrIndependentMesh(testEntity)
      return null
    }
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return true if `@param entity` does not have a GLTFComponent, it has a MeshComponent and it does not have an ancestor with components [GLTFComponent, SceneComponent]', () => {
    const Expected = true
    // 3. Set input & dependencies data
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeFalsy()
    expect(hasComponent(testEntity, MeshComponent)).toBeTruthy()
    expect(getAncestorWithComponents(testEntity, [GLTFComponent, SceneComponent])).toBeFalsy()
    // 2. Run the process
    let result = !Expected
    const Reactor = () => {
      result = useHasModelOrIndependentMesh(testEntity)
      return null
    }
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return false if `@param entity` does not have a GLTFComponent, it has a MeshComponent and it has an ancestor with components [GLTFComponent, SceneComponent]', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const parentEntity = createEntity()
    setComponent(parentEntity, GLTFComponent)
    setComponent(parentEntity, SceneComponent)
    setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeFalsy()
    expect(hasComponent(testEntity, MeshComponent)).toBeTruthy()
    expect(getAncestorWithComponents(testEntity, [GLTFComponent, SceneComponent])).toBeTruthy()
    // 2. Run the process
    let result = !Expected
    const Reactor = () => {
      result = useHasModelOrIndependentMesh(testEntity)
      return null
    }
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return false if `@param entity` does not have a GLTFComponent, a MeshComponent or an ancestor with components [GLTFComponent, SceneComponent]', () => {
    const Expected = false
    // 3. Set input & dependencies data
    const parentEntity = createEntity()
    // setComponent(parentEntity, GLTFComponent)
    // setComponent(parentEntity, SceneComponent)
    // setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
    setComponent(testEntity, EntityTreeComponent, { parentEntity: parentEntity })
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeFalsy()
    expect(hasComponent(testEntity, MeshComponent)).toBeFalsy()
    expect(getAncestorWithComponents(testEntity, [GLTFComponent, SceneComponent])).toBeFalsy()
    // 2. Run the process
    let result = !Expected
    const Reactor = () => {
      result = useHasModelOrIndependentMesh(testEntity)
      return null
    }
    const root = startReactor(Reactor)
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: useHasModelOrIndependentMesh

describe('getGLTFOptions', () => {
  let testEntity = UndefinedEntity
  beforeEach(() => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEngine()
  })

  // dep: `@param entity`.GLTFComponent
  // dep: `@param entity`.GLTFComponent.src
  // dep: `@param entity`.GLTFComponent.document
  // dep: AssetLoaderState.gltfLoader
  // dep: `@param entity`.GLTFComponent.body
  // dep: AssetLoaderState.gltfLoader.manager
  it('should return an object that has `@param entity` in its .entity field', () => {
    const Expected = testEntity
    const gltf = {
      src: 'SomeTestSource',
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).src).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    expect(getState(AssetLoaderState)).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).body).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader.manager).toBeTruthy()
    // 2. Run the process
    const result = getGLTFOptions(testEntity).entity
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return an object that has `@param entity`.GLTFComponent.document in its .document field', () => {
    const Expected = {} as GLTF.IGLTF
    const gltf = {
      src: 'SomeTestSource',
      document: Expected,
      body: {} as ArrayBuffer
    }
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).src).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    expect(getState(AssetLoaderState)).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).body).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader.manager).toBeTruthy()
    // 2. Run the process
    const result = getGLTFOptions(testEntity).document
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return an object that has `@param entity`.instanceID in its .documentID field', () => {
    const uuid = UUIDComponent.generateUUID()
    const src = 'SomeSourcePath'
    const Expected = `${uuid}-${src}` as SourceID
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, Expected)
    setComponent(testEntity, UUIDComponent, uuid)
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).src).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    expect(getState(AssetLoaderState)).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).body).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader.manager).toBeTruthy()
    // 2. Run the process
    const result = getGLTFOptions(testEntity).documentID
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return an object that has `@param entity`.GLTFComponent.src in its .url field', () => {
    const uuid = UUIDComponent.generateUUID()
    const src = 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = src
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).src).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    expect(getState(AssetLoaderState)).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).body).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader.manager).toBeTruthy()
    // 2. Run the process
    const result = getGLTFOptions(testEntity).url
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return an object that has the result of calling LoaderUtils.extractUrlBase with `@param entity`.GLTFComponent.src as arguments in its .path field', () => {
    const uuid = UUIDComponent.generateUUID()
    const urlBase = 'http://some.domain.url/'
    const src = urlBase + 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = urlBase
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).src).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    expect(getState(AssetLoaderState)).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).body).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader.manager).toBeTruthy()
    // 2. Run the process
    const result = getGLTFOptions(testEntity).path
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return an object that has `@param entity`.GLTFComponent.body in its .body field', () => {
    const uuid = UUIDComponent.generateUUID()
    const urlBase = 'http://some.domain.url/'
    const src = urlBase + 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = {} as ArrayBuffer
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: Expected
    }
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).src).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    expect(getState(AssetLoaderState)).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).body).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader.manager).toBeTruthy()
    // 2. Run the process
    const result = getGLTFOptions(testEntity).body
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return an object that has an empty object in its .requestHeader field', () => {
    const uuid = UUIDComponent.generateUUID()
    const urlBase = 'http://some.domain.url/'
    const src = urlBase + 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = {}
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).src).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    expect(getState(AssetLoaderState)).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).body).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader.manager).toBeTruthy()
    // 2. Run the process
    const result = getGLTFOptions(testEntity).requestHeader
    // 4. Check the result (output)
    expect(result).toEqual(Expected)
    // 5? Cleanup (dependencies)
  })

  it('should return an object that has AssetLoaderState.gltfLoader.manager in its .manager field', () => {
    const uuid = UUIDComponent.generateUUID()
    const urlBase = 'http://some.domain.url/'
    const src = urlBase + 'SomeSourcePath'
    const sourceID = `${uuid}-${src}` as SourceID
    const Expected = getState(AssetLoaderState).gltfLoader.manager
    const gltf = {
      src: src,
      document: {} as GLTF.IGLTF,
      body: {} as ArrayBuffer
    }
    // 3. Set input & dependencies data
    setComponent(testEntity, GLTFComponent, { src: gltf.src, document: gltf.document, body: gltf.body })
    setComponent(testEntity, SourceComponent, sourceID)
    setComponent(testEntity, UUIDComponent, uuid)
    // 1. Sanity check (input & dependencies)
    expect(hasComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent)).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).src).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).document).toBeTruthy()
    expect(getState(AssetLoaderState)).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader).toBeTruthy()
    expect(getComponent(testEntity, GLTFComponent).body).toBeTruthy()
    expect(getState(AssetLoaderState).gltfLoader.manager).toBeTruthy()
    // 2. Run the process
    const result = getGLTFOptions(testEntity).manager
    // 4. Check the result (output)
    expect(result).toBe(Expected)
    // 5? Cleanup (dependencies)
  })
}) //:: getGLTFOptions
