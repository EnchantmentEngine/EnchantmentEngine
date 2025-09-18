import { BufferAttribute, BufferGeometry } from 'three'
import { MeshBVH } from 'three-mesh-bvh'

addEventListener('message', ({ data }) => {
  const { index, position, groups, options } = data

  try {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(position, 3, false))
    if (index) {
      geometry.index = new BufferAttribute(index, 1, false)
    }
    if (groups) {
      for (const group of groups) {
        geometry.addGroup(group.start, group.count, group.materialIndex)
      }
    }
    options.lazyGeneration = false
    const bvh = new MeshBVH(geometry, { setBoundingBox: false, ...options })
    const serialized = MeshBVH.serialize(bvh, { cloneBuffers: false })

    let transferrables = [position.buffer, ...serialized.roots]
    if (serialized.index) {
      transferrables.push(serialized.index.buffer)
    }
    if (bvh._indirectBuffer) {
      transferrables.push(serialized.indirectBuffer.buffer)
    }

    postMessage(
      {
        error: null,
        serialized,
        groups: geometry.groups
      },
      transferrables
    )
  } catch (error) {
    postMessage({
      error,
      serialized: null
    })
  }
})
