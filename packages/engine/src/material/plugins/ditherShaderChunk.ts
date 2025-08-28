/*
NOTE: commenting out the #ifndef LAMBERT and #endif in the ditheringVertexUniform and ditheringVertex and ditheringFragUniform due to
issue where avatar would vanish when forcing to LAMBERT material in qualitySettings 0 (sceneObjectSYstem.tsx and PerformanceState - forceBasicMaterials)
- leaving as comments rather than removing for future context, as this used to work before but something changed
*/
/** glsl, vertex uniforms */
export const ditheringVertexUniform = `
#ifndef LAMBERT
    varying vec3 vWorldPosition;
#endif
varying vec3 vLocalPosition;
`

/** glsl, vertex main */
export const ditheringVertex = `
#ifndef LAMBERT
    vWorldPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;
#endif
vLocalPosition = position.xyz;
`

/** glsl, fragment uniforms */
export const ditheringFragUniform = `
#ifndef LAMBERT
    varying vec3 vWorldPosition;
#endif
varying vec3 vLocalPosition; 

uniform vec3 centers[2];
uniform float exponents[2];
uniform float distances[2];
uniform int useWorldCalculation[2];
`

/** glsl, fragment main */
export const ditheringAlphatestChunk = `
// sample sine at screen space coordinates for dithering pattern
float distance = 1.0;
float alphaTest = 0.5;
for(int i = 0; i < 2; i++){
    distance *= pow(clamp(distances[i]*length(centers[i] - (useWorldCalculation[i] == 1 ? vWorldPosition : vLocalPosition)), 0.0, 1.0), exponents[i]);
}

float dither = (sin( gl_FragCoord.x * 2.0)*sin( gl_FragCoord.y * 2.0));

dither += 1.0;
dither *= 0.5;
dither -= distance;

if(1.0-dither <= 1.0) discard;

diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );

if ( diffuseColor.a == 0.0 ) discard;

if ( diffuseColor.a < alphaTest ) discard;
    `
