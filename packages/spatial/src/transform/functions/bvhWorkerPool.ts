import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  InstancedMesh,
  InterleavedBufferAttribute,
  Mesh,
  TypedArray
} from 'three'
import { MeshBVH, SerializedBVH } from 'three-mesh-bvh'

import { deinterleaveAttribute } from '../../common/classes/BufferGeometryUtils'
import { WorkerPool } from '../../common/classes/WorkerPool'

import Worker from './generateBVHAsync.worker.js?worker'

const createWorker = () => {
  return new Worker()
}

export const bvhWorkerPool = new WorkerPool(1)
bvhWorkerPool.setWorkerCreator(createWorker)

export async function generateMeshBVH(mesh: Mesh, signal: AbortSignal, options = { indirect: false }) {
  if (
    !mesh.isMesh ||
    (mesh as InstancedMesh).isInstancedMesh ||
    !mesh.geometry ||
    !mesh.geometry.attributes.position ||
    mesh.geometry.boundsTree
  )
    return Promise.resolve()

  const geometry = mesh.geometry as BufferGeometry

  const index = geometry.index ? Uint32Array.from(geometry.index.array) : null

  let positionAttr = geometry.attributes.position
  if ((positionAttr as InterleavedBufferAttribute).isInterleavedBufferAttribute) {
    positionAttr = deinterleaveAttribute(positionAttr as InterleavedBufferAttribute)
  }
  const pos = Float32Array.from(positionAttr.array)

  const transferrables = [pos as ArrayLike<number>]
  if (index) {
    transferrables.push(index as ArrayLike<number>)
  }

  const response = await bvhWorkerPool.postMessage<BVHWorkerResponse>(
    {
      index,
      position: pos,
      groups: geometry.groups ? [...geometry.groups] : undefined,
      options
    },
    transferrables.map((arr: any) => arr.buffer),
    signal
  )

  if (signal.aborted) return

  const { error, serialized, groups } = response.data

  if (error) {
    return console.error(error)
  } else {
    if (groups) {
      geometry.groups = []
      for (const group of groups) {
        geometry.addGroup(group.start, group.count, group.materialIndex)
      }
    }
    const bvh = MeshBVH.deserialize(serialized, geometry, { setIndex: false })
    geometry.setIndex(new BufferAttribute(serialized.index as TypedArray, 1, false))
    geometry.boundingBox = bvh.getBoundingBox(new Box3())
    geometry.boundsTree = bvh

    return bvh
  }
}

type BVHWorkerResponse = {
  error?: string
  serialized: SerializedBVH
  groups?: Array<{
    start: number
    count: number
    materialIndex?: number | undefined
  }>
}
