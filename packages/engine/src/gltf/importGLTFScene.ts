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

import { GLTF } from '@gltf-transform/core'
import {
  ComponentJSONIDMap,
  ComponentType,
  createEntity,
  hasComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { BufferGeometry, LoaderUtils, Material, MathUtils, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import { SourceComponent } from '../scene/components/SourceComponent'

const enum GLTFElement {
  Camera,
  Skin,
  Material,
  Animation,
  Texture,
  Image,
  Sampler,
  Mesh,
  MeshPrimitive,
  Accessor,
  BufferView,
  Buffer
}

const GLTFElementKinds = {
  [GLTFElement.Camera]: {} as GLTF.ICamera,
  [GLTFElement.Skin]: {} as GLTF.ISkin,
  [GLTFElement.Material]: {} as GLTF.IMaterial,
  [GLTFElement.Animation]: {} as GLTF.IAnimation,
  [GLTFElement.Texture]: {} as GLTF.ITexture,
  [GLTFElement.Image]: {} as GLTF.IImage,
  [GLTFElement.Sampler]: {} as GLTF.ISampler,
  [GLTFElement.Mesh]: {} as GLTF.IMesh,
  [GLTFElement.MeshPrimitive]: {} as GLTF.IMeshPrimitive,
  [GLTFElement.Accessor]: {} as GLTF.IAccessor,
  [GLTFElement.BufferView]: {} as GLTF.IBufferView,
  [GLTFElement.Buffer]: {} as GLTF.IBuffer
}

type GLTFElementExtensions = {
  [key in GLTFElement]: ((
    entity: Entity,
    item: (typeof GLTFElementKinds)[key],
    index: number,
    extensionName: string,
    extension: unknown
  ) => Promise<void> | void)[]
}

export type GLTFLoadExtensions = {
  before: ((context: GLTFContext) => Promise<void> | void)[]
  after: ((context: GLTFContext) => Promise<void> | void)[]

  beforeNode: ((entity: Entity, node: GLTF.INode, nodeIndex: number) => Promise<void> | void)[]
  afterNode: ((entity: Entity, node: GLTF.INode, nodeIndex: number) => Promise<void> | void)[]

  beforeNodeExt: ((
    entity: Entity,
    extensionName: string,
    extension: unknown,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterNodeExt: ((
    entity: Entity,
    extensionName: string,
    extension: unknown,
    nodeIndex: number
  ) => Promise<void> | void)[]

  beforeCamera: ((
    entity: Entity,
    camera: GLTF.ICamera,
    cameraIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterCamera: ((
    entity: Entity,
    camera: GLTF.ICamera,
    cameraIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]

  beforeSkin: ((entity: Entity, skin: GLTF.ISkin, skinIndex: number, nodeIndex: number) => Promise<void> | void)[]
  afterSkin: ((entity: Entity, skin: GLTF.ISkin, skinIndex: number, nodeIndex: number) => Promise<void> | void)[]

  beforeMaterial: ((
    entity: Entity,
    material: GLTF.IMaterial,
    materialIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterMaterial: ((
    entity: Entity,
    material: GLTF.IMaterial,
    materialIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]

  beforeAnimation: ((entity: Entity, animation: GLTF.IAnimation, animationIndex: number) => Promise<void> | void)[]
  afterAnimation: ((entity: Entity, animation: GLTF.IAnimation, animationIndex: number) => Promise<void> | void)[]

  beforeTexture: ((
    entity: Entity,
    texture: GLTF.ITexture,
    textureIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterTexture: ((
    entity: Entity,
    texture: GLTF.ITexture,
    textureIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]

  beforeImage: ((entity: Entity, image: GLTF.IImage, imageIndex: number, nodeIndex: number) => Promise<void> | void)[]
  afterImage: ((entity: Entity, image: GLTF.IImage, imageIndex: number, nodeIndex: number) => Promise<void> | void)[]

  beforeSampler: ((
    entity: Entity,
    sampler: GLTF.ISampler,
    samplerIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterSampler: ((
    entity: Entity,
    sampler: GLTF.ISampler,
    samplerIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]

  beforeMesh: ((entity: Entity, mesh: GLTF.IMesh, meshIndex: number, nodeIndex: number) => Promise<void> | void)[]
  afterMesh: ((entity: Entity, mesh: GLTF.IMesh, meshIndex: number, nodeIndex: number) => Promise<void> | void)[]

  beforePrimitive: ((
    entity: Entity,
    primitive: GLTF.IMeshPrimitive,
    primitiveIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterPrimitive: ((
    entity: Entity,
    primitive: GLTF.IMeshPrimitive,
    primitiveIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]

  beforeAccessor: ((
    entity: Entity,
    accessor: GLTF.IAccessor,
    accessorIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterAccessor: ((
    entity: Entity,
    accessor: GLTF.IAccessor,
    accessorIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]

  beforeBufferView: ((
    entity: Entity,
    bufferView: GLTF.IBufferView,
    bufferViewIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterBufferView: ((
    entity: Entity,
    bufferView: GLTF.IBufferView,
    bufferViewIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]

  beforeBuffer: ((
    entity: Entity,
    buffer: GLTF.IBuffer,
    bufferIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
  afterBuffer: ((
    entity: Entity,
    buffer: GLTF.IBuffer,
    bufferIndex: number,
    nodeIndex: number
  ) => Promise<void> | void)[]
}

class GLTFCache {
  materials: Material[]
  meshes: Mesh[]
  geometries: BufferGeometry[]
}

type GLTFContext = {
  src: string
  path: string
  rootEntity: Entity
  gltf: GLTF.IGLTF
  cache: GLTFCache
  extensions: GLTFLoadExtensions
  elementExtensions: GLTFElementExtensions
}

export const CreateGLTFLoadExtensions = () => {
  return {
    before: [],
    after: [],
    beforeNode: [],
    afterNode: [],
    beforeNodeExt: [],
    afterNodeExt: [],
    beforeCamera: [],
    afterCamera: [],
    beforeSkin: [],
    afterSkin: [],
    beforeMaterial: [],
    afterMaterial: [],
    beforeAnimation: [],
    afterAnimation: [],
    beforeTexture: [],
    afterTexture: [],
    beforeImage: [],
    afterImage: [],
    beforeSampler: [],
    afterSampler: [],
    beforeMesh: [],
    afterMesh: [],
    beforePrimitive: [],
    afterPrimitive: [],
    beforeAccessor: [],
    afterAccessor: [],
    beforeBufferView: [],
    afterBufferView: [],
    beforeBuffer: [],
    afterBuffer: []
  } as GLTFLoadExtensions
}

export const CreateGLTFElementExtensions = () => {
  return {
    [GLTFElement.Camera]: [],
    [GLTFElement.Skin]: [],
    [GLTFElement.Material]: [],
    [GLTFElement.Animation]: [],
    [GLTFElement.Texture]: [],
    [GLTFElement.Image]: [],
    [GLTFElement.Sampler]: [],
    [GLTFElement.Mesh]: [],
    [GLTFElement.MeshPrimitive]: [],
    [GLTFElement.Accessor]: [],
    [GLTFElement.BufferView]: [],
    [GLTFElement.Buffer]: []
  } as GLTFElementExtensions
}

export const AddExtension = <Key extends keyof GLTFLoadExtensions>(
  extensions: GLTFLoadExtensions,
  step: Key,
  ext: GLTFLoadExtensions[Key][number]
) => {
  //@ts-ignore
  extensions[step].push(ext)
}

export const AddElementExtension = <Key extends GLTFElement>(
  elementExtensions: GLTFElementExtensions,
  step: Key,
  ext: GLTFElementExtensions[Key][number]
) => {
  elementExtensions[step].push(ext)
}

type ExtParams<Key extends keyof GLTFLoadExtensions> = Parameters<GLTFLoadExtensions[Key][number]>

const LoadExtensions = async <Key extends keyof GLTFLoadExtensions>(
  extensions: GLTFLoadExtensions,
  step: Key,
  ...args: ExtParams<Key>
) => {
  //@ts-ignore
  for (const extension of extensions[step]) await extension(...args)
}

const LoadElementExtensions = async <Kind extends GLTFElement>(
  extensions: GLTFElementExtensions,
  entity: Entity,
  kind: Kind,
  item: (typeof GLTFElementKinds)[Kind],
  index: number
) => {
  for (const key in item.extensions) {
    for (const loadExtension of extensions[kind]) {
      loadExtension(entity, item, index, key, item.extensions[key])
    }
  }
}

const createSourceEntity = (context: GLTFContext) => {
  const entity = createEntity()
  setComponent(entity, SourceComponent, context.src)
  return entity
}

const Load = async (
  src: string,
  gltf: GLTF.IGLTF,
  extensions: GLTFLoadExtensions,
  elementExtensions: GLTFElementExtensions
) => {
  const rootEntity = createEntity()
  setComponent(rootEntity, SourceComponent, src)

  const context = {
    src,
    path: LoaderUtils.extractUrlBase(src),
    rootEntity,
    gltf,
    cache: new GLTFCache(),
    extensions,
    elementExtensions
  }

  await LoadExtensions(extensions, 'before', context)

  if (gltf.scenes) {
    for (let i = 0, len = gltf.scenes.length; i < len; i++) {
      LoadNode(i, rootEntity, context)
    }
  }

  if (gltf.animations) {
    for (let i = 0, len = gltf.animations.length; i < len; i++) {
      LoadAnimation(i, rootEntity, context)
    }
  }

  await LoadExtensions(extensions, 'after', context)

  return rootEntity
}

const LoadNode = async (index: number, parent: Entity, context: GLTFContext) => {
  const node = context.gltf.nodes![index]
  const entity = createSourceEntity(context)

  await LoadExtensions(context.extensions, 'beforeNode', entity, node, index)

  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  setComponent(entity, NameComponent, node.name ?? `${context.src}-Node${index}`)
  setComponent(entity, TransformComponent)

  if (node.matrix) LoadMatrix(node.matrix, entity)
  else if (node.rotation || node.scale || node.translation) LoadTRS(index, entity, context)

  node.camera !== undefined && (await LoadCamera(node.camera, index, entity, context))
  node.mesh !== undefined && (await LoadMesh(node.mesh, index, entity, context))
  node.skin !== undefined && (await LoadSkin(node.skin, index, entity, context))
  node.weights !== undefined && (await LoadWeights(node.weights, index, entity, context))

  if (node.extensions) {
    for (const extKey in node.extensions) await LoadNodeExtension(extKey, index, entity, context)
  }

  if (!hasComponent(entity, UUIDComponent)) setComponent(entity, UUIDComponent, `${context.src}-${index}` as EntityUUID)

  if (node.children) {
    for (const childIndex of node.children) await LoadNode(childIndex, entity, context)
  }

  await LoadExtensions(context.extensions, 'afterNode', entity, node, index)
}

const LoadNodeExtension = async (extensionName: string, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const extension = context.gltf.nodes![nodeIndex].extensions![extensionName]
  await LoadExtensions(context.extensions, 'beforeNodeExt', entity, extensionName, extension, nodeIndex)

  const component = ComponentJSONIDMap.get(extensionName)
  if (component) {
    const compData = extension
    setComponent(entity, component, compData)
  }

  await LoadExtensions(context.extensions, 'afterNodeExt', entity, extensionName, extension, nodeIndex)
}

const _matrix = new Matrix4()
const _position = new Vector3()
const _rotation = new Quaternion()
const _scale = new Vector3()

const LoadMatrix = (matrix: number[], entity: Entity) => {
  _matrix.fromArray(matrix).decompose(_position, _rotation, _scale)

  setComponent(entity, TransformComponent, { position: _position, rotation: _rotation, scale: _scale })
}

const LoadTRS = (nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const node = context.gltf.nodes![nodeIndex]

  const transform = {} as ComponentType<typeof TransformComponent>
  if (node.translation) {
    _position.fromArray(node.translation)
    transform.position = _position
  }

  if (node.scale) {
    _scale.fromArray(node.scale)
    transform.scale = _scale
  }

  if (node.rotation) {
    _rotation.fromArray(node.rotation)
    transform.rotation = _rotation
  }

  setComponent(entity, TransformComponent, transform)
}

const LoadCamera = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const camera = context.gltf.cameras![index]
  await LoadExtensions(context.extensions, 'beforeCamera', entity, camera, index, nodeIndex)

  if (camera.type === 'orthographic' || !camera.perspective) console.warn('Orthographic cameras not supported yet')
  else {
    const perspectiveCamera = camera.perspective

    setComponent(entity, CameraComponent, {
      fov: MathUtils.radToDeg(perspectiveCamera.yfov),
      aspect: perspectiveCamera.aspectRatio || 1,
      near: perspectiveCamera.znear || 1,
      far: perspectiveCamera.zfar || 2e6
    })
  }

  camera.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Camera, camera, index))

  await LoadExtensions(context.extensions, 'afterCamera', entity, camera, index, nodeIndex)
}

const LoadSkin = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const skin = context.gltf.skins![index]
  await LoadExtensions(context.extensions, 'beforeSkin', entity, skin, index, nodeIndex)

  skin.inverseBindMatrices !== undefined && (await LoadAccessor(skin.inverseBindMatrices, nodeIndex, entity, context))

  skin.extensions && (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Skin, skin, index))

  await LoadExtensions(context.extensions, 'afterSkin', entity, skin, index, nodeIndex)
}

const LoadMesh = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const mesh = context.gltf.meshes![index]
  await LoadExtensions(context.extensions, 'beforeMesh', entity, mesh, index, nodeIndex)

  for (let i = 0, len = mesh.primitives.length; i < len; i++) {
    await LoadPrimitive(i, mesh, nodeIndex, entity, context)
  }

  if (mesh.weights) {
    await LoadWeights(mesh.weights, nodeIndex, entity, context)
  }

  mesh.extensions && (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Mesh, mesh, index))

  await LoadExtensions(context.extensions, 'afterMesh', entity, mesh, index, nodeIndex)
}

const LoadPrimitive = async (
  index: number,
  mesh: GLTF.IMesh,
  nodeIndex: number,
  entity: Entity,
  context: GLTFContext
) => {
  const primitive = mesh.primitives[index]
  await LoadExtensions(context.extensions, 'beforePrimitive', entity, primitive, index, nodeIndex)

  for (const attrName in primitive.attributes) {
    const attributeIndex = primitive.attributes[attrName]
    await LoadAccessor(attributeIndex, nodeIndex, entity, context)
  }
  primitive.indices !== undefined && (await LoadAccessor(primitive.indices, nodeIndex, entity, context))
  primitive.material !== undefined && (await LoadMaterial(primitive.material, nodeIndex, entity, context))

  primitive.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.MeshPrimitive, primitive, index))

  await LoadExtensions(context.extensions, 'afterPrimitive', entity, primitive, index, nodeIndex)
}

const LoadAccessor = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const accessor = context.gltf.accessors![index]
  await LoadExtensions(context.extensions, 'beforeAccessor', entity, accessor, index, nodeIndex)

  accessor.bufferView !== undefined && (await LoadBufferView(accessor.bufferView, nodeIndex, entity, context))
  if (accessor.sparse !== undefined) {
    const sparse = accessor.sparse
    await await LoadBufferView(sparse.indices.bufferView, nodeIndex, entity, context)
    await await LoadBufferView(sparse.values.bufferView, nodeIndex, entity, context)
  }

  accessor.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Accessor, accessor, index))

  await LoadExtensions(context.extensions, 'afterAccessor', entity, accessor, index, nodeIndex)
}

const LoadBufferView = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const bufferView = context.gltf.bufferViews![index]
  await LoadExtensions(context.extensions, 'beforeBufferView', entity, bufferView, index, nodeIndex)

  await LoadBuffer(bufferView.buffer, nodeIndex, entity, context)

  bufferView.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.BufferView, bufferView, index))

  await LoadExtensions(context.extensions, 'afterBufferView', entity, bufferView, index, nodeIndex)
}

const LoadBuffer = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const buffer = context.gltf.buffers![index]
  await LoadExtensions(context.extensions, 'beforeBuffer', entity, buffer, index, nodeIndex)

  buffer.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Buffer, buffer, index))

  await LoadExtensions(context.extensions, 'afterBuffer', entity, buffer, index, nodeIndex)
}

const LoadMaterial = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const material = context.gltf.materials![index]
  await LoadExtensions(context.extensions, 'beforeMaterial', entity, material, index, nodeIndex)

  const loadTextureInfo = async (textureInfo: GLTF.ITextureInfo) => {
    await LoadTexture(textureInfo.index, nodeIndex, entity, context)
  }

  if (material.pbrMetallicRoughness !== undefined) {
    if (material.pbrMetallicRoughness.baseColorTexture !== undefined)
      await loadTextureInfo(material.pbrMetallicRoughness.baseColorTexture)

    if (material.pbrMetallicRoughness.metallicRoughnessTexture !== undefined)
      await loadTextureInfo(material.pbrMetallicRoughness.metallicRoughnessTexture)
  }

  material.normalTexture !== undefined && loadTextureInfo(material.normalTexture)
  material.occlusionTexture !== undefined && loadTextureInfo(material.occlusionTexture)
  material.emissiveTexture !== undefined && loadTextureInfo(material.emissiveTexture)

  material.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Material, material, index))

  await LoadExtensions(context.extensions, 'afterMaterial', entity, material, index, nodeIndex)
}

const LoadTexture = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const texture = context.gltf.textures![index]
  await LoadExtensions(context.extensions, 'beforeTexture', entity, texture, index, nodeIndex)

  texture.source !== undefined && (await LoadImage(texture.source, nodeIndex, entity, context))
  texture.sampler !== undefined && (await LoadSampler(texture.sampler, nodeIndex, entity, context))

  texture.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Texture, texture, index))

  await LoadExtensions(context.extensions, 'afterTexture', entity, texture, index, nodeIndex)
}

const LoadImage = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const image = context.gltf.images![index]
  await LoadExtensions(context.extensions, 'beforeImage', entity, image, index, nodeIndex)

  image.bufferView !== undefined && (await LoadBufferView(image.bufferView, nodeIndex, entity, context))

  image.extensions && (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Image, image, index))

  await LoadExtensions(context.extensions, 'afterImage', entity, image, index, nodeIndex)
}

const LoadSampler = async (index: number, nodeIndex: number, entity: Entity, context: GLTFContext) => {
  const sampler = context.gltf.samplers![index]
  await LoadExtensions(context.extensions, 'beforeSampler', entity, sampler, index, nodeIndex)

  sampler.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Sampler, sampler, index))

  await LoadExtensions(context.extensions, 'afterSampler', entity, sampler, index, nodeIndex)
}

const LoadAnimation = async (index: number, entity: Entity, context: GLTFContext) => {
  const animation = context.gltf.animations![index]
  await LoadExtensions(context.extensions, 'beforeAnimation', entity, animation, index)

  animation.extensions &&
    (await LoadElementExtensions(context.elementExtensions, entity, GLTFElement.Animation, animation, index))

  await LoadExtensions(context.extensions, 'afterAnimation', entity, animation, index)
}

const LoadWeights = async (index: number[], nodeIndex: number, entity: Entity, context: GLTFContext) => {}

export const GLTFImporter = {
  Load: Load
}
