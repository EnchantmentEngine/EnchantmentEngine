import { generateNoiseTexture } from '@ir-engine/spatial/src/renderer/functions/generateNoiseTexture'

import { Schema } from '@ir-engine/hyperflux'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { Vector3 } from 'three'
import { defineMaterialPlugin } from '../defineMaterialPlugin'

export const NoiseOffsetPluginComponent = defineMaterialPlugin({
  name: 'NoiseOffsetPluginComponent',

  jsonID: 'IR_material_noise_offset',

  uniforms: Schema.Object({
    textureSize: Schema.Number({ default: 64 }),
    frequency: Schema.Number({ default: 0.00025 }),
    amplitude: Schema.Number({ default: 0.005 }),
    noiseTexture: Schema.Class(() => generateNoiseTexture(64), { serialized: false }),
    offsetAxis: T.Vec3(new Vector3(0, 1, 0)),
    time: Schema.Number({ default: 0 })
  }),

  onApply: (entity, shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `
            uniform sampler2D noiseTexture;
            uniform float textureSize; // The width of a slice
            uniform float frequency;
            uniform float amplitude;
            uniform float time;

            vec3 sampleNoise(vec3 pos) {
                float zSlice = (pos.z * textureSize);
                vec2 slicePos = vec2(zSlice / textureSize, fract(zSlice / textureSize));
                vec2 noisePos = slicePos + pos.xy / textureSize;
                return vec3(texture2D(noiseTexture, noisePos).r);
            }

            vec3 turbulence(vec3 position) {
              vec3 sum = vec3(0.0);
              float frequencyMutliplied = frequency;
              float amplitudeMultiplied = amplitude;

              for (int i = 0; i < 4; i++) {
                  vec3 p = position * frequencyMutliplied;
                  p.z += time * 0.0015;

                  sum += sampleNoise(p).rgb * amplitudeMultiplied;

                  frequencyMutliplied *= 2.0;
                  amplitudeMultiplied *= 7.0;
              }

              return sum;
            }

            void main() {
          `
    )
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `uniform vec3 offsetAxis;
        void main() {`
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
            #include <begin_vertex>
            vec4 noiseWorldPosition = vec4(transformed, 1.0);
            noiseWorldPosition = modelMatrix * noiseWorldPosition;
            #ifdef USE_INSTANCING
              noiseWorldPosition = instanceMatrix * noiseWorldPosition;
            #endif
            vec3 offset = turbulence(noiseWorldPosition.xyz) * offsetAxis;
            transformed += offset;
          `
    )
  },

  update: (component, deltaSeconds) => {
    component.time += deltaSeconds
  }
})
