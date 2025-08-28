import assert from 'assert'
import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

import { createEntity, removeEntity, setComponent, UndefinedEntity } from '@ir-engine/ecs'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'

import { createEngine } from '@ir-engine/ecs/src/Engine'
import { getState } from '@ir-engine/hyperflux'
import sinon from 'sinon'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { ResourceState } from './ResourceState'

describe('ResourceState', () => {
  describe('ResourceState state', () => {
    describe('reactor', () => {
      let testEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        testEntity = createEntity()
      })

      afterEach(() => {
        return destroyEngine()
      })

      it('should track mesh in state', async () => {
        // invoke state to start reactor
        getState(ResourceState)

        const mesh = new Mesh(new SphereGeometry(), new MeshBasicMaterial())

        setComponent(testEntity, MeshComponent, mesh)

        await vi.waitUntil(() => {
          // @ts-expect-error
          const meshResourceID = mesh.resourceID
          return getState(ResourceState).resources[meshResourceID]
        })

        // @ts-expect-error
        const meshResourceID = mesh.resourceID
        const meshAssetEntry = getState(ResourceState).resources[meshResourceID]
        assert(meshAssetEntry.entity === testEntity)
        assert(meshAssetEntry.asset === mesh)
        assert(meshAssetEntry.type === 'Mesh')

        // @ts-expect-error
        const geometryResourceID = mesh.geometry.resourceID
        const geometryAssetEntry = getState(ResourceState).resources[geometryResourceID]
        assert(geometryAssetEntry.entity === testEntity)
        assert(geometryAssetEntry.asset === mesh.geometry)
        assert(geometryAssetEntry.type === 'Geometry')

        // @ts-expect-error
        const materialResourceID = mesh.material.resourceID
        const materialAssetEntry = getState(ResourceState).resources[materialResourceID]
        assert(materialAssetEntry.entity === testEntity)
        assert(materialAssetEntry.asset === mesh.material)
        assert(materialAssetEntry.type === 'Material')

        const index = mesh.geometry.index
        // @ts-expect-error
        const indexResourceID = index.resourceID
        const indexAssetEntry = getState(ResourceState).resources[indexResourceID]
        assert(indexAssetEntry.entity === testEntity)
        assert(indexAssetEntry.asset === index)
        assert(indexAssetEntry.type === 'BufferAttribute')

        const attributes = mesh.geometry.attributes

        // @ts-expect-error
        const positionResourceID = attributes.position.resourceID
        const positionAssetEntry = getState(ResourceState).resources[positionResourceID]
        assert(positionAssetEntry.entity === testEntity)
        assert(positionAssetEntry.asset === attributes.position)
        assert(positionAssetEntry.type === 'BufferAttribute')

        // @ts-expect-error
        const normalResourceID = attributes.normal.resourceID
        const normalAssetEntry = getState(ResourceState).resources[normalResourceID]
        assert(normalAssetEntry.entity === testEntity)
        assert(normalAssetEntry.asset === attributes.normal)
        assert(normalAssetEntry.type === 'BufferAttribute')

        // @ts-expect-error
        const uvResourceID = attributes.uv.resourceID
        const uvAssetEntry = getState(ResourceState).resources[uvResourceID]
        assert(uvAssetEntry.entity === testEntity)
      })

      it('should dispose when component unmounts', async () => {
        // invoke state to start reactor
        getState(ResourceState)

        const mesh = new Mesh(new SphereGeometry(), new MeshBasicMaterial())
        const spy = sinon.spy()
        mesh.geometry.dispose = spy
        mesh.material.dispose = spy

        setComponent(testEntity, MeshComponent, mesh)

        await vi.waitUntil(() => {
          // @ts-expect-error
          const meshResourceID = mesh.resourceID
          return getState(ResourceState).resources[meshResourceID]
        })

        // @ts-expect-error
        const meshResourceID = mesh.resourceID

        const resources = getState(ResourceState).resources

        removeEntity(testEntity)

        await vi.waitUntil(() => {
          return !getState(ResourceState).resources[meshResourceID]
        })

        sinon.assert.calledTwice(spy)

        assert.equal(Object.keys(resources).length, 0)
      })
    })
  })
})
