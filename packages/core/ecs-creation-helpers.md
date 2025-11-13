# ECS Creation Helper Interfaces (GLTF 2.0 Runtime)

This document defines TypeScript **interfaces** for creation helper functions that group GLTF ECS components into higher-level bundles.  
Each helper returns the **root Entity** it creates, allowing chaining of calls.  
Usage examples are provided for each.

---

## Shared Types

```ts
type Entity = number

interface TransformInit {
  translation?: [number, number, number]
  rotation?: [number, number, number, number]
  scale?: [number, number, number]
  matrix?: Float32Array
}

interface PrimitiveInit {
  attributes: { [semantic: string]: Entity }
  indices?: Entity
  material?: Entity
  mode?: number
}

interface MaterialTextureRef {
  texture: Entity
}

interface MaterialInit {
  baseColorFactor?: [number, number, number, number]
  metallicFactor?: number
  roughnessFactor?: number
  emissiveFactor?: [number, number, number]
  alphaMode?: 'OPAQUE' | 'MASK' | 'BLEND'
  alphaCutoff?: number
  doubleSided?: boolean

  baseColorTexture?: MaterialTextureRef
  metallicRoughnessTexture?: MaterialTextureRef
  normalTexture?: MaterialTextureRef
  occlusionTexture?: MaterialTextureRef
  emissiveTexture?: MaterialTextureRef
}

interface TextureInit {
  source: Entity
  sampler?: Entity
}
interface ImageInit {
  uri?: string
  bufferView?: Entity
  mimeType?: string
  data?: ArrayBuffer
}
interface SamplerInit {
  magFilter?: number
  minFilter?: number
  wrapS?: number
  wrapT?: number
}

// Cameras
interface PerspectiveCameraInit {
  type: 'perspective'
  yfov: number
  znear: number
  zfar?: number
  aspectRatio?: number
}
interface OrthographicCameraInit {
  type: 'orthographic'
  xmag: number
  ymag: number
  znear: number
  zfar: number
}
type CameraInit = PerspectiveCameraInit | OrthographicCameraInit

// Lights
interface DirectionalLightInit {
  type: 'directional'
  color?: [number, number, number]
  intensity?: number
}
interface PointLightInit {
  type: 'point'
  color?: [number, number, number]
  intensity?: number
  range?: number
}
interface SpotLightInit {
  type: 'spot'
  color?: [number, number, number]
  intensity?: number
  range?: number
  innerConeAngle?: number
  outerConeAngle?: number
}
type LightInit = DirectionalLightInit | PointLightInit | SpotLightInit

// Animations
interface AnimationSamplerInit {
  input: Entity
  output: Entity
  interpolation?: 'LINEAR' | 'STEP' | 'CUBICSPLINE'
}
interface AnimationChannelInit {
  targetNode: Entity
  targetPath: 'translation' | 'rotation' | 'scale' | 'weights'
  samplerIndex: number
}
interface AnimationInit {
  samplers: AnimationSamplerInit[]
  channels: AnimationChannelInit[]
  name?: string
}
```

---

## CreateMesh

```ts
interface CreateMeshArgs {
  name?: string
  parent?: Entity
  children?: Entity[]
  transform?: TransformInit
  mesh?: { weights?: number[]; primitives: PrimitiveInit[] }
  materials?: MaterialInit[]
  textures?: TextureInit[]
  images?: ImageInit[]
  samplers?: SamplerInit[]
}

interface CreateMesh {
  (args: CreateMeshArgs): Entity
}
```

**Usage Example**

```ts
const meshEntity = createMesh({
  name: 'Cube',
  transform: { translation: [0, 0, 0], scale: [1, 1, 1] },
  mesh: {
    primitives: [{ attributes: { POSITION: posAccessorEntity }, indices: idxAccessorEntity }]
  },
  materials: [{ baseColorFactor: [1, 0, 0, 1] }]
})
```

---

## CreateLight

```ts
interface CreateLightArgs {
  name?: string
  parent?: Entity
  children?: Entity[]
  transform?: TransformInit
  light: LightInit
}

interface CreateLight {
  (args: CreateLightArgs): Entity
}
```

**Usage Example**

```ts
const lightEntity = createLight({
  name: 'Sun',
  transform: { rotation: [0, 0, 0, 1] },
  light: { type: 'directional', color: [1, 1, 1], intensity: 5.0 }
})
```

---

## CreateCamera

```ts
interface CreateCameraArgs {
  name?: string
  parent?: Entity
  children?: Entity[]
  transform?: TransformInit
  camera: CameraInit
}

interface CreateCamera {
  (args: CreateCameraArgs): Entity
}
```

**Usage Example**

```ts
const camEntity = createCamera({
  name: 'MainCamera',
  transform: { translation: [0, 1, 5] },
  camera: { type: 'perspective', yfov: 1.0, znear: 0.1, zfar: 1000 }
})
```

---

## CreateScene

```ts
interface CreateSceneArgs {
  name?: string
  children?: Entity[]
  asDefault?: boolean
}

interface CreateScene {
  (args: CreateSceneArgs): Entity
}
```

**Usage Example**

```ts
const sceneEntity = createScene({
  name: 'TestScene',
  children: [meshEntity, lightEntity, camEntity],
  asDefault: true
})
```

---

## LoadAnimation

```ts
interface LoadAnimationArgs {
  name?: string
  targetRoot: Entity
  animation: AnimationInit
}

interface LoadAnimation {
  (args: LoadAnimationArgs): Entity
}
```

**Usage Example**

```ts
const animEntity = loadAnimation({
  name: 'CubeSpin',
  targetRoot: meshEntity,
  animation: {
    samplers: [{ input: timeAccessorEntity, output: rotationAccessorEntity }],
    channels: [{ targetNode: meshEntity, targetPath: 'rotation', samplerIndex: 0 }]
  }
})
```
