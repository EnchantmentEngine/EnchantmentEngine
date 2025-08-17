# WebGPU Renderer – Comprehensive Architecture, Interfaces & Implementation Plan

This single document consolidates architectural principles, detailed layer rationale, full TypeScript interface contracts (with XML‑style pseudocode sketches), ECS component schema, implementation roadmap, and migration / validation guidance for replacing the legacy Three.js path with a minimal, ECS‑first WebGPU backend.

---
## 1. Architectural Principles
- **ECS-first, zero-copy**: Renderer reads SoA component columns directly; no scene graph or per-entity JS objects, no snapshots.
- **Read-only ECS**: Renderer never mutates ECS; derives only transient frame-local data or renderer-private GPU state.
- **Composable & extensible**: Systems + render graph nodes with ordering constraints (before / after / with).
- **Deterministic**: Frame output is a pure function of current ECS state + renderer configuration.
- **Multi-renderer capable**: Multiple renderers may share a GPUDevice & caches while keeping transient state isolated.
- **Minimal retained state**: Persistent data limited to GPU resource caches, asset tables, lightweight scheduling metadata.
- **Pure modules**: Shader/material modules and graph nodes are pure wrt ECS (read-only) and side-effect only GPU command recording.
- **Zero redundant abstractions**: No local world snapshots, no duplicated ECS query layer, no separate Renderer/View entity aliases.

---
## 2. Layer Overview (L0–L11)
| Layer | Responsibility | Key Outputs |
|-------|----------------|-------------|
| L0 Device/Surface | Device, queue, surface config | { device, queue, presenter } |
| L1 Caches | Content-addressed GPU resources & pipelines | GPU buffers/textures/samplers/layouts/pipelines |
| L2 Shader/Material | Compose WGSL & pipelines from modules | ProgramKey, WGSL, pipeline layouts |
| L3 Queries | Direct ECS access (no local interfaces) | ECS columns & entity ids |
| L4 Visibility/Batch | Frustum cull + group draws | VisibleSet, DrawBatch[], instance stream |
| L5 Lighting | Pack light typed arrays | LightSoA arrays |
| L6 Geometry | Resolve mesh ids → GPU buffers/layouts | vbuf, ibuf, layouts, skin/morph buffers |
| L7 Render Graph | Pass declaration, scheduling, transients | RenderSchedule |
| L8 PostFX | Post-processing chain | Final composited image |
| L9 Presenter | Swapchain acquisition & presentation | Presented frame |
| L10 Reactors | Asset‑driven GPU upload/release | Updated caches / geometry tables |
| L11 System Order | Default frame step ordering | Ordered systems & injection points |

---
## 3. Detailed Layer Rationale & Interfaces
Each layer section: brief rationale, followed by interfaces & XML pseudocode (if applicable). All ECS access uses the engine's existing API; `Entity` is the engine entity type (imported externally).

### Common Types & Renderer State
```ts
// Output target specification (expand for XR multi-view when needed)
export type Output =
  | { kind: 'canvas'; canvas: HTMLCanvasElement }
  | { kind: 'xr' };

// Example Hyperflux state (non-mandatory illustration) keyed by renderer entity:
const RendererState = defineState({
  name: 'webgpu.renderer',
  initial: () => ({
    device: null as GPUDevice | null,
    queue: null as GPUQueue | null,
    presenter: null as Presenter | null,
    options: { msaaSamples: 1 } as RendererOptions,
    view: 0 as Entity,
    caches: {} as Caches,
    schedule: null as RenderSchedule | null,
    scratch: null as FrameScratch | null
  })
})
```

#### L0: Device & Surface
Purpose: Acquire / share adapter & device, configure surface (canvas / XR), produce presenter.

**Explanation:**
L0 is the hardware bootstrap & presentation handshake layer. It is responsible ONLY for:
- Acquiring (or reusing) a GPUDevice + queue.
- Creating a Presenter abstraction that hides swapchain / XR view differences.
- Managing surface (canvas) configuration & resize/MSAA attachment allocation.
**Design Constraints:**
- Pure setup / reconfiguration; no frame logic besides attachment resize.
- Idempotent: safe to call configure on option or size changes.
- Does not know about higher-level render graph or passes.
- Keeps minimal state: references to device, queue, attachments.
```ts
// Interfaces (unchanged above)

import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { Entity } from '@ir-engine/ecs'

export interface RendererOptions { msaaSamples: number }

// Surface / presenter minimal scaffolding
export function createCanvasSurfaceContext(canvas: HTMLCanvasElement): SurfaceContext {
  const context = canvas.getContext('webgpu') as GPUCanvasContext
  const size = () => ({ width: canvas.clientWidth, height: canvas.clientHeight })
  return {
    format: navigator.gpu.getPreferredCanvasFormat(),
    size: size(),
    context,
    configure(format: GPUTextureFormat, msaa: number) {
      canvas.width = size().width
      canvas.height = size().height
      context.configure({ device: getState(RendererState).device!, format, alphaMode: 'premultiplied' })
    },
    getCurrentTextureView() { return context.getCurrentTexture().createView() }
  }
}

class BasicPresenter implements Presenter {
  private surface?: SurfaceContext
  private depthTex?: GPUTexture
  private msaaTex?: GPUTexture
  private device?: GPUDevice
  private opts!: RendererOptions
  configure(output: Output, device: GPUDevice, opts: RendererOptions) {
    this.device = device
    this.opts = opts
    if (output.kind === 'canvas') {
      this.surface = createCanvasSurfaceContext(output.canvas)
      this.surface.configure(this.surface.format, opts.msaaSamples)
      this.allocateAttachments()
    }
  }
  private allocateAttachments() {
    if (!this.surface || !this.device) return
    const { width, height } = this.surface.size
    this.depthTex = this.device.createTexture({
      size: { width, height },
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT
    })
    if (this.opts.msaaSamples > 1) {
      this.msaaTex = this.device.createTexture({
        size: { width, height },
        format: this.surface.format,
        sampleCount: this.opts.msaaSamples,
        usage: GPUTextureUsage.RENDER_ATTACHMENT
      })
    }
  }
  acquireViews() {
    if (!this.surface) throw new Error('Presenter not configured')
    const color = this.msaaTex ? this.msaaTex.createView() : this.surface.getCurrentTextureView()
    const depth = this.depthTex!.createView()
    return { color, depth }
  }
  present(cmd: GPUCommandBuffer) {
    this.device!.queue.submit([cmd])
    // if MSAA: resolve handled in render pass, else nothing extra
  }
}

export async function initDeviceAndPresenter(rendererEntity: Entity, output: Output) {
  const state = getMutableState(RendererState)
  if (!state.device.value) {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) throw new Error('No WebGPU adapter')
    const device = await adapter.requestDevice({})
    state.device.set(device)
    state.queue.set(device.queue)
  }
  const presenter = new BasicPresenter()
  presenter.configure(output, state.device.value!, state.options.value)
  state.presenter.set(presenter)
}
```

#### L1: Resource & Pipeline Caches
Purpose: Deduplicate GPU resources & pipelines via content-addressed keys using pure descriptors and numeric handles.

Design:
- Plain data descriptors (BufferDesc, TextureDesc, SamplerDesc, PipelineDesc).
- Monotonic numeric handles (Handle = number) referencing GPU object tables.
- A single compileResources() pure-diff pass per frame (or when dirty) turning descriptor arrays into concrete GPU objects; user code keeps only handles.

```ts
export type Handle = number

// Descriptors (pure data, serializable)
export interface BufferDesc { id: Handle; byteLength: number; usage: GPUBufferUsageFlags; hash?: number }
export interface TextureDesc { id: Handle; w: number; h: number; format: GPUTextureFormat; mipmaps: boolean; usage: GPUTextureUsageFlags; hash?: number }
export interface SamplerDesc { id: Handle; mag: 'linear'|'nearest'; min: 'linear'|'nearest'; wrapU: 'repeat'|'clamp'|'mirror'; wrapV: 'repeat'|'clamp'|'mirror' }
// Program / pipeline: first derive ProgramKey (bitfield) + shaders, then reference in PipelineDesc
export type ProgramKey = bigint // 64-bit packed bits
export interface PipelineDesc { id: Handle; programKey: ProgramKey; layoutIds: Handle[]; topology: 'tri'|'line'; alpha: 'opaque'|'mask'|'blend' }
export interface BindGroupLayoutDesc { id: Handle; entriesHash: number }

// Runtime tables (handles index directly)
export interface ResourceTables {
  buffers: (GPUBuffer | undefined)[]
  textures: (GPUTexture | undefined)[]
  samplers: (GPUSampler | undefined)[]
  layouts: (GPUBindGroupLayout | undefined)[]
  pipelines: (GPURenderPipeline | undefined)[]
}

// Bundle of desired descriptors this frame (or on change). Missing entries imply retention; removed ids pruned via GC policy.
export interface ResourceDescriptorBundle {
  buffers: BufferDesc[]
  textures: TextureDesc[]
  samplers: SamplerDesc[]
  layouts: BindGroupLayoutDesc[]
  pipelines: PipelineDesc[]
}

export interface CompileResourcesResult { created: Handle[]; reused: Handle[]; destroyed: Handle[] }

export function compileResources(device: GPUDevice, bundle: ResourceDescriptorBundle, tables: ResourceTables): CompileResourcesResult {
  // Pseudocode: build hash->handle maps, allocate new GPU objects for unknown ids, leave existing, destroy orphaned.
  return { created: [], reused: [], destroyed: [] }
}

// Utility: monotonic handle allocator
let _nextHandle: Handle = 1
export const allocHandle = () => _nextHandle++
```

#### L2: Shader & Material Program System
Purpose: Compose WGSL + pipeline state from modular contributions.

**Explanation:**
L2 converts high-level material & feature flags into concrete shader source + pipeline layout intent.
**Responsibilities:**
- Maintain ordered registry of ProgramModules (feature slices) with keyBits contributions.
- Concatenate/inject WGSL snippets per stage deterministically.
- Produce a ProgramKey capturing all variant-affecting bits (used by L1 pipeline cache later).
- Defer actual pipeline creation until first draw needing it (lazy build strategy).
**Out of Scope:**
- Runtime uniforms / bind group population (handled at draw time by modules' populate()).
- Asset material parameter decoding (reactors supply MaterialParams).
**Considerations:**
- Topological ordering by before/after constraints ensures predictable emission.
- Future extension: specialization constants, code hot-reload, pipeline warming queue.

```ts
// Bit positions (example minimal subset)
const enum ProgramBit {
  INSTANCED = 1n << 0n,
  SKINNED = 1n << 1n,
  MORPHED = 1n << 2n,
  RECEIVES_SHADOWS = 1n << 3n,
  VERTEX_COLOR = 1n << 4n,
  LIGHTMAP = 1n << 5n,
  FOG = 1n << 6n,
  ALPHA_MASK = 1n << 7n,
  ALPHA_BLEND = 1n << 8n
}
export interface ProgramFlags { instanced:boolean; skinned:boolean; morphed:boolean; receivesShadows:boolean; usesVertexColor:boolean; usesLightmap:boolean; fog:boolean; alpha:'opaque'|'mask'|'blend' }
export function makeProgramKey(flags: ProgramFlags, moduleBits: bigint): ProgramKey {
  let k = moduleBits
  if (flags.instanced) k |= ProgramBit.INSTANCED
  if (flags.skinned) k |= ProgramBit.SKINNED
  if (flags.morphed) k |= ProgramBit.MORPHED
  if (flags.receivesShadows) k |= ProgramBit.RECEIVES_SHADOWS
  if (flags.usesVertexColor) k |= ProgramBit.VERTEX_COLOR
  if (flags.usesLightmap) k |= ProgramBit.LIGHTMAP
  if (flags.fog) k |= ProgramBit.FOG
  if (flags.alpha === 'mask') k |= ProgramBit.ALPHA_MASK
  if (flags.alpha === 'blend') k |= ProgramBit.ALPHA_BLEND
  return k
}

export interface ProgramModuleDesc { name: string; keyBits: bigint; vsSrc: string; fsSrc: string; layout?: BindGroupLayoutDesc }
// Ordered immutable array snapshot
export type ModuleSet = readonly ProgramModuleDesc[]

export interface ProgramBuildResult { programKey: ProgramKey; vs: string; fs: string; layoutIds: Handle[] }
export function buildProgram(modules: ModuleSet, params: MaterialParams, textures: TextureSet, flags: ProgramFlags, layoutHandleMap: Map<string, Handle>): ProgramBuildResult {
  let bits = 0n
  const vsParts: string[] = []
  const fsParts: string[] = []
  const layoutIds: Handle[] = []
  for (const m of modules) {
    bits |= m.keyBits
    vsParts.push(m.vsSrc)
    fsParts.push(m.fsSrc)
    if (m.layout) layoutIds.push(m.layout.id)
  }
  const programKey = makeProgramKey(flags, bits)
  return { programKey, vs: vsParts.join('\n'), fs: fsParts.join('\n'), layoutIds }
}
```

#### L3: ECS Queries
Purpose: Direct ECS access – systems & nodes invoke engine ECS API directly.

**Explanation:**
L3 intentionally avoids introducing a second query abstraction. Systems directly use existing ECS queries, pulling contiguous SoA component columns to preserve zero-copy principles.
**Responsibilities:**
- Define reusable queries for renderer concerns (drawables, lights, cameras) without wrapping results.
- Provide stable ordering leveraged by batching.
**Out of Scope:** Any caching or duplication of component data.
**Considerations:** Additional filters (layer masks, visibility) applied downstream (L4) not here.

```ts
export interface QueryDescriptor { name: string; components: any[] }
export const DrawableQuery: QueryDescriptor = { name: 'drawable', components: [TransformComponent /*, MeshRef, MaterialRef */] }
// Frame system stores results: QueryResults{name, indices: Uint32Array}
```

#### L4: Visibility & Batching

**Explanation:**
L4 transforms raw drawable entities into two optimized products: a VisibleSet (post-cull ordered indices) and DrawBatch array with an instance attribute stream. It isolates CPU-side draw grouping logic.
**Responsibilities:**
- Frustum / (future) occlusion tests into a dense index list.
- Deterministic batch key construction & grouping (mesh/material/program/flags).
- Instance attribute stream packing (matrices, colors, skin/morph offsets).
**Out of Scope:** Actual GPU buffer upload or indirect command encoding (future GPU-driven layer).
**Considerations:** Reserve scratch memory up-front; keep stable ordering for reproducibility.

```ts
export interface VisibleSet { indices: Uint32Array }
export function computeVisibility(drawableIndices: Uint32Array, frustum: any): VisibleSet {
  // Placeholder: return all
  return { indices: drawableIndices }
}

export interface BatchRecord { meshId:number; materialId:number; programKey:ProgramKey; firstInstance:number; count:number }
export interface BatchingResult { batches: BatchRecord[]; instanceStreamHandle: Handle }
export function buildBatches(visible: VisibleSet, drawableData: any, scratch: any): BatchingResult {
  const batches: BatchRecord[] = []
  // Simple 1:1 placeholder
  for (let i=0;i<visible.indices.length;i++) batches.push({ meshId:0, materialId:0, programKey:0n, firstInstance:i, count:1 })
  return { batches, instanceStreamHandle: 0 }
}
```

#### L5: Lighting

**Explanation:**
L5 gathers light components into compact SoA typed arrays consumed by shaders (forward path for now).
**Responsibilities:**
- Enumerate active light entities and pack attributes (kind, color, position, direction, range, angles).
- Precompute derived values (e.g., cos(inner/outer) for spotlights) before upload.
**Out of Scope:** Light culling / clustering (future Forward+ node) and shadow map rendering (graph nodes).
**Considerations:** Keep arrays frame-local; reuse scratch buffers to avoid GC.

```ts
export interface LightSoA { kind: Uint8Array; color: Float32Array; pos: Float32Array; dir: Float32Array; range: Float32Array; angle: Float32Array }
export function buildLightSoA(lightIndices: Uint32Array, scratch: any): LightSoA {
  const n = lightIndices.length
  return {
    kind: new Uint8Array(n),
    color: new Float32Array(n*3),
    pos: new Float32Array(n*3),
    dir: new Float32Array(n*3),
    range: new Float32Array(n),
    angle: new Float32Array(n*2)
  }
}
```

#### L6: Geometry & Vertex Stream Prep

**Explanation:**
L6 provides constant-time resolution from meshId → GPU buffers & vertex layout, plus optional per-entity extras (skin palette, morph weights). Data is populated by asset reactors & animation systems.
**Responsibilities:**
- Maintain maps from numeric ids to WebGPU buffer objects/layout metadata.
- Answer draw-time queries for geometry handles without allocating.
**Out of Scope:** Upload scheduling (L10) and per-frame instance attributes (L4).
**Considerations:** MeshId should be stable across loads; layout objects reused to avoid pipeline churn.

```ts
export interface GeometryRecord { id:number; vertexBuffer: Handle; indexBuffer?: Handle; layoutHandle: Handle }
export interface GeometryTables { records: Map<number, GeometryRecord> }
export function resolveGeometry(meshId:number, tables: GeometryTables): GeometryRecord { return tables.records.get(meshId)! }
```

#### L7: Render Graph

**Explanation:**
L7 declares, compiles, and executes an ordered set of pass nodes with explicit resource read/write sets. It is the orchestration layer bridging logical passes to command encoding.
**Responsibilities:**
- Accept node specs (dependencies via before/after) and produce a deterministic order.
- Manage transient GPU resource definitions (future aliasing / lifetime analysis hook).
- Provide execution context & invoke node run functions within a shared command encoder or per-pass.
**Out of Scope:** Per-pass shader/material selection (handled by L2 & batching) and presentation (L9).
**Considerations:** Future enhancement for automatic resource aliasing & barrier validation.

```ts
export interface PassSpec { name:string; reads:string[]; writes:string[]; before?:string[]; after?:string[] }
export type GraphSpec = readonly PassSpec[]
export interface GraphPlan { ordered: readonly PassSpec[] }
export function compileGraph(spec: GraphSpec): GraphPlan { return { ordered: topoSort(spec) } }
function topoSort(spec: GraphSpec): PassSpec[] { return [...spec] /* TODO dependency resolution */ }
```

#### L8: Postprocessing & Compositing

**Explanation:**
L8 is a convenience façade for adding/removing post-processing nodes (tonemap, AA, bloom) layered atop the generic render graph. It manages ordering conventions (e.g., Tonemap before AA) but defers resource allocation to L7.
**Responsibilities:** Provide ergonomic API to append/replace chain nodes.
**Out of Scope:** Direct shader code (modules registered through L2) or swapchain presentation (L9).
**Considerations:** Hot-swapping nodes should trigger graph recompile next frame.

```ts
export type PostChainSpec = readonly PassSpec[] // subset focusing on post passes
```

#### L9: Presenter

**Explanation:**
L9 finalizes the frame: acquires swapchain image (via L0 presenter), submits GPU work, and performs any resolve necessary (MSAA handled during pass). It contains no scene logic.
**Responsibilities:** Convert command encoder to command buffer(s) and queue.submit, manage presentation.
**Out of Scope:** Pass encoding, which must already be complete.
**Considerations:** Error handling for lost device; surface reconfigure triggers L0 path.

```ts
export interface FrameTargets { color: Handle; depth: Handle; resolve?: Handle }
export function present(frameTargets: FrameTargets, device: GPUDevice, cmd: GPUCommandBuffer) { device.queue.submit([cmd]) }
```

#### L10: Asset Reactors

**Explanation:**
L10 watches ECS asset id components and ensures corresponding GPU resources are created / released. It decouples asynchronous loading & parsing from render frame logic by mutating only renderer-private tables & caches once assets are ready.
**Responsibilities:** Detect additions/removals, schedule loads, populate geometryTables & caches, prune stale.
**Out of Scope:** High-level asset pipeline (import settings) and per-frame streaming buffers.
**Considerations:** Debounce rapid churn; implement frame-aged eviction policy later.

```ts
export interface AssetReaction { buffers?: BufferDesc[]; textures?: TextureDesc[]; geometry?: GeometryRecord[] }
export function runAssetReactors(activeAssets: any): AssetReaction { return {} }
```

#### L11: System Ordering

**Explanation:**
L11 defines the canonical sequence of renderer systems executed per frame and exposes insertion points for extension systems. It is purely scheduling metadata plus minimal execute shells.
**Responsibilities:** Register core systems, express before/after relationships, allow user injection.
**Out of Scope:** Business logic (handled inside each system) & frame timing collection (future metrics layer).
**Considerations:** Deterministic order critical; modifications trigger predictable extension points.

```ts
export type SystemName = string
export const BaseRendererSystemOrder: readonly SystemName[] = [
  'renderer:beginFrame',
  'renderer:collectView',
  'renderer:visibility',
  'renderer:batch',
  'renderer:graph:compile',
  'renderer:graph:execute',
  'renderer:present',
  'renderer:endFrame'
]
export function insertSystem(order: readonly SystemName[], name: SystemName, opts: { before?: SystemName; after?: SystemName }): SystemName[] {
  const arr = [...order]
  if (opts.before) { const i = arr.indexOf(opts.before); if (i>=0) arr.splice(i,0,name); else arr.push(name) }
  else if (opts.after) { const i = arr.indexOf(opts.after); if (i>=0) arr.splice(i+1,0,name); else arr.push(name) }
  else arr.push(name)
  return arr
}
```

## 19. Minimal API Surface

**Explanation:**
The public renderer façade exposes a narrow surface for host integration (engine/editor/tests):
- systems: register or remove systems (wrapping ECS scheduling utilities) for custom behavior.
- graph: extend render passes (postfx, custom debug, etc.).
- setView/setOutput/setOptions: reconfigure runtime parameters without reconstructing renderer object.
- runFrame: drive a frame (invoked by main loop after ECS simulation updates).
**Design Goals:** Minimal leaks (no direct device exposure beyond what callers initially pass), stable API for iterative build-out, and clear separation between configuration (one-off) and per-frame execution.

```ts
export interface RendererAPI {
  setModules(mods: ModuleSet): void // replaces old registry mutation
  setGraph(spec: GraphSpec): void
  setPost(spec: PostChainSpec): void
  setResources(bundle: ResourceDescriptorBundle): void // merged with asset reactions
  setSurface(spec: { width:number;height:number;format:GPUTextureFormat; msaaSamples:number }): void
  runFrame(time:number): void
}
```

---
## 4. ECS Component Schema (Renderer-Agnostic Proposal)
Core Transform & View:
- Transform, Camera, optional Viewport override.
Renderable:
- MeshRef, MaterialRef, LayerMask, Skinned, Morphed.
Lighting & Environment:
- LightDirectional, LightPoint, LightSpot, LightAmbient, Sky, Envmap, Fog.
Post & Effects:
- PostFX flags/params.
Asset Indirection:
- MeshAsset, TextureAsset, MaterialParams + individual texture reference components.
To Deprecate:
- Three.js Object proxies, legacy Layers, direct geometry/material object storage.
Frame-Local (Scratch Only): VisibleSet.indices, DrawBatch[], InstanceStream, LightSoA, skin palettes, morph weight streams.

---
## 5. Default Systems (Frame Pipeline)
1. renderer:beginFrame – scratch.reset(), resize & option diff.
2. renderer:collectView – active camera → ViewInfo.
3. renderer:cull – frustum (later occlusion) → VisibleSet.
4. renderer:batch – group & build instance attributes.
5. renderer:graph:compile – resolve nodes/resources changes.
6. renderer:graph:execute – encode passes.
7. renderer:present – submit & present.
8. renderer:endFrame – recycle transients, age caches.
Injection points: before batch, after specific pass nodes, with graph phases.

---
## 6. Queries & Zero-Copy Strategy
- ECS provides contiguous SoA columns; renderer traverses indices only.
- Filtering (layer mask, frustum) performed during iteration, avoiding copies.
- Stable ordering ensures deterministic batching.

---
## 7. Visibility & Batching Details
- Frustum cull using AABB or bounding sphere columns.
- VisibleSet.indices reference drawables ordering.
- Batch key: meshId, materialId, programKey, flags → hashed.
- Instance stream: model matrices (3x4 or 4x4) + optional normal matrix, color tint, skin/morph offsets.
- Future: multi-draw indirect command buffer generation.

---
## 8. Shader / Program Composition Details
- Topological ordering of ProgramModule list after registry mutation.
- variantBits OR across modules contributes to ProgramKey.
- Lazy pipeline creation on first usage; consider async warm-up.
- Future: specialization constants, pipeline state reduction techniques.

---
## 9. GPU Resource Caches
- Content-addressed keys; structural hash string or packed number for lookup.
- Immutable buffers where possible; ring/uniform buffers for per-frame streaming.
- Texture key includes descriptor + asset content hash; optional on-demand mip gen.
- Refcount or LRU aging for eviction.

---
## 10. FrameScratch & Transients
- Linear arenas (f32/u32) backed by large ArrayBuffers; subview carving with wrap per frame.
- Transient GPU textures/buffers pooled & aliased via lifetime analysis from graph.
- Prevent GC churn by reusing typed arrays.

---
## 11. Geometry, Skin & Morph Handling
- GeometryTables populated by asset reactors.
- Skin palettes updated pre-render by animation system; accessed read-only.
- Morph weights contiguous; entities hold offset/length.

---
## 12. Lighting Data
- SoA arrays: positions/dirs in world space; precompute cos(inner/outer) for spotlights.
- Aggregate ambient lights.
- Optional forward+ / clustered extension node later.

---
## 13. Render Graph Mechanics
- Node spec declares resources + ordering; compile builds topological order & transient alias map.
- Execution uses shared command encoder or pass encoders per node.
- Built-in baseline nodes: DepthPrepass (optional), OpaquePass, SkyPass, TransparentPass, PostChain (Tonemap, AA), future ShadowPass.
- External extension via graph.add(spec, run) — duplicate names rejected.

---
## 14. Asset Reactors
- Track active asset ids from ECS queries each frame.
- On new id: async load → parse → GPU resource creation → cache insertion.
- On inactivity: schedule release after N frames to avoid rapid churn.
- Metrics: load latency, resident VRAM usage.

---
## 15. Presenter Details
- Acquire next swapchain texture; allocate/reuse MSAA/color resolve + depth.
- Reconfigure on resize/format change.
- Present after encoding & queue.submit.

---
## 16. Testing & Validation
- Unit: ProgramKey stability, cache hit/miss, batching sort determinism, culling correctness.
- Integration: Deterministic seed scene hash (small region readback).
- Performance: Frame budget breakdown, allocation counters, pipeline compile count.
- Hot reload: add/remove ProgramModule & GraphNode without restart.

---
## 17. Implementation Roadmap (Milestones)
1. (M1) Device + Presenter + FrameScratch (clear color frame).
2. (M2) ECS numeric components + stub queries.
3. (M3) Single triangle via ProgramBuilder (hardcoded WGSL).
4. (M4) Transform & Camera uniforms.
5. (M5) Mesh asset upload + OpaquePass real meshes.
6. (M6) Visibility culling & batching + instance matrices.
7. (M7) Material params + texture sampling.
8. (M8) LightSoA + basic lighting shader.
9. (M9) Render graph scheduling + transient allocator.
10. (M10) Post chain (tonemap + FXAA/TAA) & color management.
11. (M11) Editor integration toggle (WebGPU vs legacy).
12. (M12) Feature parity & removal prep (Three.js elimination).

---
## 18. Open Questions / Future Extensions
- Multi-view / XR: extend Output and per-eye graph execution.
- Forward+ / Clustered: optional node building light index lists.
- GPU-driven (MDI / meshlets): upstream batching to indirect buffers.
- Bindless / descriptor indexing: adopt when stable across browsers.
- Shader hot-reload: live recompile & pipeline substitution keyed by ProgramKey.
- Async pipeline warm-up during idle windows.

---
## 19. Minimal API Surface

**Explanation:**
The public renderer façade exposes a narrow surface for host integration (engine/editor/tests):
- systems: register or remove systems (wrapping ECS scheduling utilities) for custom behavior.
- graph: extend render passes (postfx, custom debug, etc.).
- setView/setOutput/setOptions: reconfigure runtime parameters without reconstructing renderer object.
- runFrame: drive a frame (invoked by main loop after ECS simulation updates).
**Design Goals:** Minimal leaks (no direct device exposure beyond what callers initially pass), stable API for iterative build-out, and clear separation between configuration (one-off) and per-frame execution.

```ts
export interface RendererAPI {
  setModules(mods: ModuleSet): void // replaces old registry mutation
  setGraph(spec: GraphSpec): void
  setPost(spec: PostChainSpec): void
  setResources(bundle: ResourceDescriptorBundle): void // merged with asset reactions
  setSurface(spec: { width:number;height:number;format:GPUTextureFormat; msaaSamples:number }): void
  runFrame(time:number): void
}
```

---
## 20. De-Risk Checklist (Before Removing Three.js)
- [ ] Editor gizmos use ECS transforms (no Object3D).
- [ ] Selection & raycasting on ECS geometry bounds.
- [ ] Lighting parity validated (acceptable delta).
- [ ] Post-processing feature parity (tone map, AA, bloom if required).
- [ ] Asset pipeline loads existing scenes into new schema.
- [ ] Performance ≥ legacy on representative scenes.
- [ ] Automated regression tests & image diffs stable.

---
## 21. Next Action Recommendations
Immediate starting options (choose one):
1. Scaffold `renderer/webgpu/device.ts` (adapter/device acquisition + shared registry).
2. Implement `scratch.ts` linear arena + tests.
3. Define ECS numeric components & temporary mock query helpers.

---
## 22. Appendix: Hyperflux Renderer State Guidance
- Use one Hyperflux state slice per renderer entity to store: device, queue, presenter, options, current view, caches, compiled schedule, scratch allocator reference.
- Avoid mirroring ECS component data; only store GPU or derived scheduling objects.
- Maintain small stable keys for caches; prefer numeric/bit-packed where practical.

End of consolidated document.
