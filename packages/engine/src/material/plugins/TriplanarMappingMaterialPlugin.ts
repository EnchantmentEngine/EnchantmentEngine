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

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { Texture, Vector2 } from 'three'
import { defineMaterialPlugin } from '../defineMaterialPlugin'

// Triplanar shader chunks
const triplanarVertexPars = `
varying vec3 vPosition;
// We'll use the existing vNormal from Three.js
`

const triplanarVertex = `
vPosition = position;
// vNormal is already set by Three.js
`

const triplanarFragmentPars = `
varying vec3 vPosition;
// vNormal is already defined by Three.js

uniform sampler2D diffuseMap1;
uniform sampler2D diffuseMap2;
uniform sampler2D diffuseMap3;
uniform sampler2D normalMap1;
uniform sampler2D normalMap2;
uniform sampler2D normalMap3;

uniform vec2 texScale1;
uniform vec2 texScale2;
uniform vec2 texScale3;

uniform float blendSharpness;
uniform float normalScale;

// Triplanar texture mapping function
vec4 triplanarMapping(vec3 pos, vec3 normal, sampler2D tex, vec2 texScale) {
  // Absolute value of normal components for blending weights
  vec3 blending = pow(abs(normal), vec3(blendSharpness));
  blending = blending / (blending.x + blending.y + blending.z);

  // Sample texture from three directions
  vec4 xaxis = texture2D(tex, pos.yz * texScale);
  vec4 yaxis = texture2D(tex, pos.xz * texScale);
  vec4 zaxis = texture2D(tex, pos.xy * texScale);

  // Blend samples based on normal
  return xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
}
`

const triplanarFragment = `
// Calculate blend weights based on slope
float slope = 1.0 - vNormal.y; // 0 = flat, 1 = vertical
float slopeFactor = smoothstep(0.0, 0.8, slope);

// Sample textures using triplanar mapping
vec4 diffuse1 = triplanarMapping(vPosition, vNormal, diffuseMap1, texScale1);
vec4 diffuse2 = triplanarMapping(vPosition, vNormal, diffuseMap2, texScale2);
vec4 diffuse3 = triplanarMapping(vPosition, vNormal, diffuseMap3, texScale3);

// Blend textures based on slope
vec4 finalDiffuse = mix(diffuse1, diffuse2, slopeFactor);
finalDiffuse = mix(finalDiffuse, diffuse3, step(0.95, slopeFactor));

// Apply to material
diffuseColor *= finalDiffuse;
`

export const TriplanarMappingMaterialPlugin = defineMaterialPlugin({
  name: 'TriplanarMappingMaterialPlugin',

  jsonID: 'IR_triplanar_mapping',

  uniforms: S.Object({
    diffuseMap1: S.Type<Texture>(),
    diffuseMap2: S.Type<Texture>(),
    diffuseMap3: S.Type<Texture>(),
    normalMap1: S.Type<Texture>(),
    normalMap2: S.Type<Texture>(),
    normalMap3: S.Type<Texture>(),
    texScale1: T.Vec2(new Vector2(0.1, 0.1)),
    texScale2: T.Vec2(new Vector2(0.1, 0.1)),
    texScale3: T.Vec2(new Vector2(0.1, 0.1)),
    blendSharpness: S.Number({ default: 2.0 }),
    normalScale: S.Number({ default: 1.0 })
  }),

  onApply(shader) {
    // Add vertex shader modifications
    shader.vertexShader = shader.vertexShader.replace(/#include <common>/, '#include <common>\n' + triplanarVertexPars)

    shader.vertexShader = shader.vertexShader.replace(
      /#include <worldpos_vertex>/,
      '#include <worldpos_vertex>\n' + triplanarVertex
    )

    // Add fragment shader modifications
    shader.fragmentShader = shader.fragmentShader.replace(
      /#include <common>/,
      '#include <common>\n' + triplanarFragmentPars
    )

    // Apply triplanar mapping after the map_fragment include
    shader.fragmentShader = shader.fragmentShader.replace(
      /#include <map_fragment>/,
      '#include <map_fragment>\n' + triplanarFragment
    )
  },

  update: undefined,

  reactor: undefined
})
