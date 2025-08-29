# ECS Component Suite for GLTF 2.0 Runtime (WebGPU/WebGL/WebXR)

This document defines a comprehensive set of **ECS components** to represent GLTF 2.0 documents at runtime.  
The design is **data-oriented**, **declarative**, and **API-agnostic**, with **WebGPU / WebGL** handled by renderers.

---

## GLTF Structure Components

```ts
interface GltfDocument {
  scenes: Entity[]
  defaultScene?: Entity
}

interface Scene {
  nodes: Entity[]
}

// currently named EntityTree
interface Node {
  children: Entity[]
}
```

---

## Transform & Animation

```ts
interface Transform {
  translation: [number, number, number]
  rotation: [number, number, number, number] // quaternion
  scale: [number, number, number]
  matrix?: Float32Array // optional baked
}

interface Animation {
  channels: Entity[]
  samplers: Entity[]
}

interface AnimationChannel {
  targetNode: Entity
  targetPath: 'translation' | 'rotation' | 'scale' | 'weights'
  sampler: Entity
}

interface AnimationSampler {
  input: Entity // -> Accessor
  output: Entity // -> Accessor
  interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE'
}
```

---

## Geometry & Materials

```ts
interface Mesh {
  primitives: Entity[]
  weights?: number[]
}

interface Primitive {
  attributes: { [semantic: string]: Entity } // accessor refs
  indices?: Entity // accessor ref
  material?: Entity
  mode: number // GLTF primitive topology enum (0–6)
}

interface Material {
  baseColorFactor: [number, number, number, number]
  metallicFactor: number
  roughnessFactor: number
  baseColorTexture?: Entity
  metallicRoughnessTexture?: Entity
  normalTexture?: Entity
  occlusionTexture?: Entity
  emissiveTexture?: Entity
  emissiveFactor: [number, number, number]
  alphaMode: 'OPAQUE' | 'MASK' | 'BLEND'
  alphaCutoff?: number
  doubleSided?: boolean
}
```

---

## Buffers, Accessors, Images

```ts
interface Accessor {
  bufferView: Entity
  componentType: number // GL enum
  count: number
  type: 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4' | 'MAT2' | 'MAT3' | 'MAT4'
  normalized?: boolean
  byteOffset?: number
  min?: number[]
  max?: number[]
}

interface BufferView {
  buffer: Entity
  byteOffset: number
  byteLength: number
  byteStride?: number
  target?: number // GL enum hint
}

interface Buffer {
  uri?: string
  byteLength: number
  data?: ArrayBuffer // runtime-loaded
}

interface Image {
  uri?: string
  bufferView?: Entity
  mimeType?: string
  data?: ArrayBuffer // runtime-loaded
}

interface Texture {
  source: Entity // -> Image
  sampler?: Entity
}

interface Sampler {
  magFilter?: number // GL enum
  minFilter?: number // GL enum
  wrapS: number
  wrapT: number
}
```

---

## Cameras & Lighting

```ts
interface PerspectiveCamera {
  yfov: number
  znear: number
  zfar?: number
  aspectRatio?: number
}

interface OrthographicCamera {
  xmag: number
  ymag: number
  znear: number
  zfar: number
}

interface Light {
  type: 'directional' | 'point' | 'spot'
  color: [number, number, number]
  intensity: number
  range?: number
  innerConeAngle?: number
  outerConeAngle?: number
}

interface DirectionalLight {
  color: [number, number, number]
  intensity: number
}

interface PointLight {
  color: [number, number, number]
  intensity: number
  range: number
}

interface SpotLight {
  color: [number, number, number]
  intensity: number
  range: number
  // or maybe angle & penumbra instead?
  innerConeAngle?: number
  outerConeAngle?: number
}
```

---

## Skins & Morph Targets

```ts
interface Skin {
  joints: Entity[]
  inverseBindMatrices?: Entity // accessor
  skeletonRoot?: Entity
}

interface MorphTarget {
  weights: number[]
}
```

---

## Metadata / Runtime State

```ts
interface Name {
  value: string
}

interface Visible {
  value: boolean
}

interface LayerMask {
  value: number
}
```
