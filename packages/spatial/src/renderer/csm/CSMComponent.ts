import { defineComponent, EntitySchema } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { DirectionalLight, Shader as ShaderType, Vector3 } from 'three'
import { T } from '../../schema/schemaFunctions'
import Frustum from './Frustum'

export const CSMComponent = defineComponent({
  name: 'CSMComponent',

  schema: Schema.Object(
    {
      cascades: Schema.Number({ default: 5 }),
      maxFar: Schema.Number({ default: 100 }),
      mode: Schema.String({ default: 'PRACTICAL' }),
      shadowMapSize: Schema.Number({ default: 1024 }),
      shadowBias: Schema.Number({ default: 0 }),
      shadowNormalBias: Schema.Number({ default: 0 }),
      lightDirection: T.Vec3(new Vector3(1, -1, 1).normalize()),
      lightDirectionUp: T.Vec3(new Vector3(0, 1, 0)),
      lightColor: T.Color(),
      lightIntensity: Schema.Number({ default: 1 }),
      lightMargin: Schema.Number({ default: 200 }),
      fade: Schema.Bool({ default: true }),
      mainFrustum: Schema.Type<Frustum>({ default: new Frustum() }),
      frustums: Schema.Array(Schema.Type<Frustum>()),
      breaks: Schema.Array(Schema.Number()),
      sourceLight: Schema.Type<DirectionalLight | undefined>(),
      lights: Schema.Array(Schema.Type<DirectionalLight>({ serialized: false })),
      lightEntities: Schema.Array(EntitySchema.Entity()),
      shaders: Schema.Record(Schema.String(), Schema.Type<ShaderType>()),
      csmShadowNode: Schema.Type<any>({ default: undefined, serialized: false }),
      webgpuEnhanced: Schema.Bool({ default: false }),
      shadowSoftness: Schema.Number({ default: 1.0 }),
      ambientShadowColor: Schema.Array(Schema.Number(), { default: [0.1, 0.1, 0.2] }),
      shadowColorTint: Schema.Array(Schema.Number(), { default: [0.8, 0.8, 1.0] }),
      needsUpdate: Schema.Bool({ default: false })
    },
    { serialized: false }
  )
})
