

// TODO: Current version of web-worker does not support importScripts on server side
// Related PR: https://github.com/developit/web-worker/pull/9

importScripts('/workers/three.umd.min.js')
importScripts('/workers/index.umd.cjs.js')

onmessage = function ({ data }) {
  const { index, position, groups, options } = data

  try {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3, false))
    if (index) {
      geometry.index = new THREE.BufferAttribute(index, 1, false)
    }
    if (groups) {
      for (const group of groups) {
        geometry.addGroup(group.start, group.count, group.materialIndex)
      }
    }
    options.lazyGeneration = false
    const bvh = new MeshBVHLib.MeshBVH(geometry, { setBoundingBox: false, ...options })
    const serialized = MeshBVHLib.MeshBVH.serialize(bvh, { cloneBuffers: false })

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
}
