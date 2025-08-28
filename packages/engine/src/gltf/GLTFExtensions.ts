import { GLTF } from '@gltf-transform/core'
import { getState } from '@ir-engine/hyperflux'
import { BufferGeometry, NormalBufferAttributes } from 'three'
import { MeshoptDecoder } from '../assets/loaders/gltf/meshopt_decoder'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { ATTRIBUTES, WEBGL_COMPONENT_TYPES } from './GLTFConstants'
import { getDependency, GLTFParserOptions } from './GLTFLoaderFunctions'

export const KHR_DRACO_MESH_COMPRESSION = {
  decodePrimitive(options: GLTFParserOptions, primitive: GLTF.IMeshPrimitive) {
    const json = options.document
    const dracoMeshCompressionExtension = primitive.extensions!['KHR_draco_mesh_compression'] as any
    const bufferViewIndex = dracoMeshCompressionExtension.bufferView
    const gltfAttributeMap = dracoMeshCompressionExtension.attributes
    const threeAttributeMap = {} as { [key: string]: string }
    const attributeNormalizedMap = {} as { [key: string]: boolean }
    const attributeTypeMap = {} as { [key: string]: string }

    for (const attributeName in gltfAttributeMap) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName]
    }

    for (const attributeName in primitive.attributes) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      if (gltfAttributeMap[attributeName] !== undefined) {
        const accessorDef = json.accessors![primitive.attributes[attributeName]]
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

        attributeTypeMap[threeAttributeName] = componentType.name
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true
      }
    }

    return new Promise<BufferGeometry<NormalBufferAttributes>>(async (resolve) => {
      const bufferView = (await getDependency(options, 'bufferView', bufferViewIndex))!
      const dracoLoader = getState(AssetLoaderState).dracoLoader!
      dracoLoader.preload().decodeDracoFile(
        bufferView,
        function (geometry) {
          for (const attributeName in geometry.attributes) {
            const attribute = geometry.attributes[attributeName]
            const normalized = attributeNormalizedMap[attributeName]
            if (normalized !== undefined) attribute.normalized = normalized
          }
          resolve(geometry)
        },
        threeAttributeMap,
        attributeTypeMap
      )
    })
  }
}

export type KHRMeshOptExtensionType = {
  buffer: number
  byteOffset?: number
  byteLength?: number
  byteStride?: number
  count: number
  mode?: number
  filter?: number
}

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
export const EXT_MESHOPT_COMPRESSION = {
  loadBuffer: (options: GLTFParserOptions, bufferViewIndex: number) => {
    const json = options.document
    const bufferViewDef = json.bufferViews![bufferViewIndex]
    const extensionDef = bufferViewDef.extensions!['EXT_meshopt_compression'] as KHRMeshOptExtensionType
    return [
      extensionDef.buffer,
      (bufferView: ArrayBuffer) =>
        new Promise<ArrayBuffer | null>((resolve, reject) => {
          const json = options.document

          const byteOffset = extensionDef.byteOffset || 0
          const byteLength = extensionDef.byteLength || 0

          const count = extensionDef.count
          const stride = extensionDef.byteStride!

          const source = new Uint8Array(bufferView, byteOffset, byteLength)

          const decoder = MeshoptDecoder
          if (!decoder || !decoder.supported) {
            if (json.extensionsRequired && json.extensionsRequired.indexOf('EXT_meshopt_compression') >= 0) {
              return reject('THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files')
            } else {
              // Assumes that the extension is optional and that fallback buffer data is present
              return resolve(null)
            }
          }

          if (decoder.decodeGltfBufferAsync) {
            decoder
              .decodeGltfBufferAsync(count, stride, source, extensionDef.mode!, extensionDef.filter!)
              .then(function (res) {
                resolve(res.buffer)
              })
          } else {
            // Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
            decoder.ready!.then(function () {
              const result = new ArrayBuffer(count * stride)
              decoder.decodeGltfBuffer(
                new Uint8Array(result),
                count,
                stride,
                source,
                extensionDef.mode!,
                extensionDef.filter!
              )
              resolve(result)
            })
          }
        })
    ] as [number, (bufferView: ArrayBuffer) => Promise<ArrayBuffer>]
  }
}

type GLTFExtensionType = {
  decodePrimitive?: (
    options: GLTFParserOptions,
    primitive: GLTF.IMeshPrimitive
  ) => Promise<BufferGeometry<NormalBufferAttributes>>
  loadBuffer?: (
    options: GLTFParserOptions,
    index: number
  ) => [number, (bufferView: ArrayBuffer) => Promise<ArrayBuffer>]
}

export const getBufferIndex = (options: GLTFParserOptions, bufferViewIndex: number) => {
  const json = options.document
  const bufferViewDef = json.bufferViews![bufferViewIndex]
  for (const extensionName in bufferViewDef.extensions) {
    const extension = GLTFExtensions[extensionName]
    if (extension.loadBuffer) {
      return extension.loadBuffer(options, bufferViewIndex!)
    }
  }
  return [
    bufferViewDef.buffer,
    async (buffer) => {
      const byteLength = bufferViewDef!.byteLength || 0
      const byteOffset = bufferViewDef!.byteOffset || 0
      return buffer.slice(byteOffset, byteOffset + byteLength)
    }
  ] as [number, (bufferView: ArrayBuffer) => Promise<ArrayBuffer>]
}

export const GLTFExtensions = {
  KHR_draco_mesh_compression: KHR_DRACO_MESH_COMPRESSION,
  EXT_meshopt_compression: EXT_MESHOPT_COMPRESSION
} as Record<string, GLTFExtensionType>
