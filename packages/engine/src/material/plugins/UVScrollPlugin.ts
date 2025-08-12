import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { Vector2 } from 'three'
import { defineMaterialPlugin } from '../defineMaterialPlugin'

export const UVScrollPlugin = defineMaterialPlugin({
  name: 'UVScrollPlugin',

  jsonID: 'EE_uv_scroll',

  uniforms: S.Object({
    speed: T.Vec2(new Vector2(1, 1)),
    offset: T.Vec2(new Vector2(0, 0))
  }),

  onApply: (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `
        uniform vec2 offset;

        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy + offset;
        }
      `
    )
  },

  update: (component, deltaSeconds) => {
    const { speed, offset } = component

    offset.x += speed.x * deltaSeconds
    offset.y += speed.y * deltaSeconds

    if (offset.x > 1) offset.x -= 1
    if (offset.y > 1) offset.y -= 1

    if (offset.x < 0) offset.x += 1
    if (offset.y < 0) offset.y += 1
  }
})
