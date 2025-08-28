import { defineComponent, EntitySchema } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { Mesh, OrthographicCamera, WebGLRenderTarget } from 'three'
import { LightmapperMaterial } from './LightmapperMaterial'

/** Temporary component used for configuring and baking lightmaps in LightmapSystem */
export const LightmapBakeComponent = defineComponent({
  name: 'LightmapBakeComponent',

  schema: Schema.Object({
    entities: Schema.Array(EntitySchema.Entity()),
    renderTarget: Schema.Type<WebGLRenderTarget>({ serialized: false }),
    raycastMesh: Schema.Type<Mesh>({ serialized: false }),
    orthographicCamera: Schema.Type<OrthographicCamera>({ serialized: false }),
    raycastMaterial: Schema.Type<LightmapperMaterial>({ serialized: false }),
    totalSamples: Schema.Number({ default: 1000 }),
    currentSamples: Schema.Number({ default: 0 }),
    resolution: Schema.Number({ default: 1024 }),
    channel: Schema.Number({ default: 2 })
  })
})
