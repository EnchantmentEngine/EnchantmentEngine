import { defineComponent, S } from '@ir-engine/ecs'
import { Mesh, OrthographicCamera, WebGLRenderTarget } from 'three'
import { LightmapperMaterial } from './LightmapperMaterial'

/** Temporary component used for configuring and baking lightmaps in LightmapSystem */
export const LightmapBakeComponent = defineComponent({
  name: 'LightmapBakeComponent',

  schema: S.Object({
    entities: S.Array(S.Entity()),
    renderTarget: S.Type<WebGLRenderTarget>({ serialized: false }),
    raycastMesh: S.Type<Mesh>({ serialized: false }),
    orthographicCamera: S.Type<OrthographicCamera>({ serialized: false }),
    raycastMaterial: S.Type<LightmapperMaterial>({ serialized: false }),
    totalSamples: S.Number({ default: 1000 }),
    currentSamples: S.Number({ default: 0 }),
    resolution: S.Number({ default: 1024 }),
    channel: S.Number({ default: 2 })
  })
})
