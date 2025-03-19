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

import { createEngine, createEntity, destroyEngine, removeEntity, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { startReactor } from '@ir-engine/hyperflux'
import { GLTFComponent, GLTFComponentFunctions } from './GLTFComponent'

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

    it.todo('should return false (return early) if `@param entity`.GLTFComponent is falsy', () => {
      let state: boolean = false
      const Reactor = () => {
        state = GLTFComponent.useSceneLoaded(testEntity)
        return null
      }
      expect(true).false
    })

    it.todo(
      'should return true when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true',
      () => {}
    )
    it.todo(
      'should return true when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false and entity.GLTFComponent.progress is 100',
      () => {}
    )
    it.todo(
      'should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false and entity.GLTFComponent.progress is not 100',
      () => {}
    )
  }) //:: useSceneLoaded

  describe('isSceneLoaded', () => {
    it.todo('should return false (return early) if `@param entity`.GLTFComponent is falsy', () => {})
    it.todo(
      'should return true when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns true',
      () => {}
    )
    it.todo(
      'should return true when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false and entity.GLTFComponent.progress is 100',
      () => {}
    )
    it.todo(
      'should return false when calling componentDependenciesLoaded with `@param entity`.GLTFComponent.dependencies returns false and entity.GLTFComponent.progress is not 100',
      () => {}
    )
  }) //:: isSceneLoaded

  describe('getInstanceID', () => {
    describe('when `@param entity` does not have a GLTFComponent ..', () => {
      it.todo('.. should return `@param entity`.SourceComponent if it is truthy', () => {})
      it.todo(".. should return '' if `@param entity`.SourceComponent is falsy", () => {})
    })
    describe('when `@param entity` has a GLTFComponent ..', () => {
      it.todo(".. should return '' if `@param entity`.UUIDComponent is falsy", () => {})
      it.todo(".. should return '' if `@param entity`.GLTFComponent is falsy", () => {})
      it.todo(
        '.. should return the result of SourceComponent.getSourceID with entity.(UUIDCOmponent, GLTFComponent.src) as arguments',
        () => {}
      )
    })
  }) //:: getInstanceID

  describe('useInstanceID', () => {
    describe('when `@param entity` does not have a GLTFComponent ..', () => {
      it.todo('.. should return `@param entity`.SourceComponent if it is truthy', () => {})
      it.todo(".. should return '' if `@param entity`.SourceComponent is falsy", () => {})
    })
    describe('when `@param entity` has a GLTFComponent ..', () => {
      it.todo(".. should return '' if `@param entity`.UUIDComponent is falsy", () => {})
      it.todo(".. should return '' if `@param entity`.GLTFComponent is falsy", () => {})
      it.todo(
        '.. should return the result of SourceComponent.getSourceID with entity.(UUIDCOmponent, GLTFComponent.src) as arguments',
        () => {}
      )
    })
  }) //:: useInstanceID

  describe('removeHashes', () => {
    it.todo('should return `@param url` with all its `?hash=...` instances removed', () => {})
  }) //:: removeHashes
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
  it.todo(
    'should throw an error if the first 4 bytes of `@param data` are not equal to BINARY_EXTENSION_HEADER_MAGIC',
    () => {}
  )
  it.todo(
    'should throw an error if the first 4 bytes of `@param data` are equal to BINARY_EXTENSION_HEADER_MAGIC and the uint32 at byte 8 is less than 2.0',
    () => {}
  )
  it.todo(
    'should decode and parse the BINARY_EXTENSION_CHUNK_TYPES.JSON chunk data into the result.json object',
    () => {}
  )
  it.todo('should copy the entire BINARY_EXTENSION_CHUNK_TYPES.BIN chunk data into the result.body object', () => {})
  it.todo('should throw an error if the BINARY_EXTENSION_CHUNK_TYPES.JSON chunk was not found', () => {})
}) //:: parseBinaryData

describe('useHasModelOrIndependentMesh', () => {
  it.todo('should return true if `@param entity` has a GLTFComponent', () => {})
  it.todo('should return true if `@param entity` has a GLTFComponent', () => {})
  it.todo(
    'should return true if `@param entity` has a MeshComponent and it does not have an ancestor with components [GLTFComponent, SceneComponent]',
    () => {}
  )
  it.todo('should return false if `@param entity` has a GLTFComponent and it does not have a MeshComponent', () => {})
  it.todo(
    'should return false if `@param entity` has components [GLTFComponent, MeshComponent] and has an ancestor with components [GLTFComponent, SceneComponent]',
    () => {}
  )
}) //:: useHasModelOrIndependentMesh

describe('getGLTFOptions', () => {
  // dep: `@param entity`.GLTFComponent
  // dep: `@param entity`.GLTFComponent.src
  // dep: `@param entity`.GLTFComponent.document
  // dep: AssetLoaderState.gltfLoader
  // dep: `@param entity`.GLTFComponent.body
  // dep: AssetLoaderState.gltfLoader.manager
  it.todo('should return an object that has `@param entity` in its .entity field', () => {})
  it.todo('should return an object that has `@param entity`.GLTFComponent.document in its .document field', () => {})
  it.todo('should return an object that has `@param entity`.GLTFComponent.src in its .documentID field', () => {})
  it.todo('should return an object that has `@param entity`.GLTFComponent.src in its .url field', () => {})
  it.todo(
    'should return an object that has the result of calling LoaderUtils.extractUrlBase with `@param entity`.GLTFComponent.src as arguments in its .path field',
    () => {}
  )
  it.todo('should return an object that has `@param entity`.GLTFComponent.body in its .body field', () => {})
  it.todo('should return an object that has an empty object in its .requestHeader field', () => {})
  it.todo('should return an object that has AssetLoaderState.gltfLoader.manager in its .manager field', () => {})
}) //:: getGLTFOptions
