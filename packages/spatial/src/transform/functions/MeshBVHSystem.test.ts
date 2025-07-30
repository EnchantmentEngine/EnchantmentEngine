import { createEngine, createEntity, destroyEngine, setComponent, SystemDefinitions } from '@ir-engine/ecs'
import { startReactor } from '@ir-engine/hyperflux'
import { BoxGeometry, MathUtils, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { destroySpatialEngine, destroySpatialViewer } from '../../initializeEngine'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { TransformComponent } from '../components/TransformComponent'
import { MeshBVHSystem } from './MeshBVHSystem'

const meshBVHReactor = SystemDefinitions.get(MeshBVHSystem)!.reactor!

describe('MeshBVHSystem', () => {
  beforeEach(() => {
    createEngine()
    mockSpatialEngine()
  })

  afterEach(() => {
    destroySpatialEngine()
    destroySpatialViewer()
    return destroyEngine()
  })

  const randInt = (min = 1, max = 15) => MathUtils.randInt(min, max)

  it('should create a BVH for each mesh component in the simulation layer', async () => {
    const box1 = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial())
    const one = createEntity()
    setComponent(one, MeshComponent, box1)

    const box2 = new Mesh(new BoxGeometry(0.2, 0.7, 0.5), new MeshBasicMaterial())
    const two = createEntity()
    setComponent(two, MeshComponent, box2)

    const box3 = new Mesh(new BoxGeometry(1.0, 0.3, 0.9), new MeshBasicMaterial())
    const three = createEntity()
    setComponent(three, MeshComponent, box3)

    startReactor(meshBVHReactor)

    const boxes = [box1, box2, box3]

    await vi.waitUntil(() => boxes.every((box) => box.geometry.boundsTree), { timeout: 10000 })

    const boundTrees = boxes.map((box) => box.geometry.boundsTree)

    assert.ok(boundTrees.length === boxes.length)
    for (const tree of boundTrees) {
      assert.ok(!!tree)
      assert.ok(tree instanceof MeshBVH)
      // 24 verts in a box * 4 bytes
      assert.ok((tree as any)._roots[0].byteLength === 96)
      assert.ok((tree as any).indirect === false)
    }
  })

  it('BVH can recieve raycasts', async () => {
    const box = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial())
    const one = createEntity()
    box.updateMatrixWorld()
    setComponent(one, TransformComponent, { position: new Vector3(randInt(), randInt(), randInt()) })
    setComponent(one, MeshComponent, box)

    startReactor(meshBVHReactor)

    await vi.waitUntil(() => box.geometry.boundsTree, { timeout: 10000 })

    // check that we're using the BVH raycast function
    assert.ok(box.raycast.name === 'acceleratedRaycast')

    const origin = new Vector3().copy(box.position).addScalar(randInt(2))
    const direction = new Vector3().subVectors(box.position, origin).normalize()
    const raycaster = new Raycaster(origin, direction)
    raycaster.firstHitOnly = true
    const result = raycaster.intersectObject(box, true)
    assert.ok(!!result)
    assert.ok(result.length == 1)
    assert.ok(result[0].object == box)
  })
})
