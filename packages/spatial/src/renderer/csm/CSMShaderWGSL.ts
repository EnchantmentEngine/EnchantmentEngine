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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

/**
 * WGSL (WebGPU Shading Language) implementation of CSM shaders
 * This provides native WGSL shaders for WebGPU renderer instead of relying on GLSL->WGSL conversion
 */

export const CSMShaderWGSL = {
  lights_fragment_begin: /* wgsl */ `
// CSM (Cascaded Shadow Maps) implementation in WGSL
var geometryPosition: vec3<f32> = -vViewPosition;
var geometryNormal: vec3<f32> = normal;
var geometryViewDir: vec3<f32> = select(normalize(vViewPosition), vec3<f32>(0.0, 0.0, 1.0), isOrthographic);

var geometryClearcoatNormal: vec3<f32> = vec3<f32>(0.0);

#ifdef USE_CLEARCOAT
  geometryClearcoatNormal = clearcoatNormal;
#endif

#ifdef USE_IRIDESCENCE
  let dotNVi: f32 = saturate(dot(normal, geometryViewDir));
  if (material.iridescenceThickness == 0.0) {
    material.iridescence = 0.0;
  } else {
    material.iridescence = saturate(material.iridescence);
  }
  if (material.iridescence > 0.0) {
    material.iridescenceFresnel = evalIridescence(1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor);
    material.iridescenceF0 = Schlick_to_F0(material.iridescenceFresnel, 1.0, dotNVi);
  }
#endif

var directLight: IncidentLight;

// Point lights processing
#if NUM_POINT_LIGHTS > 0 && defined(RE_Direct)
  var pointLight: PointLight;
  #if defined(USE_SHADOWMAP) && NUM_POINT_LIGHT_SHADOWS > 0
    var pointLightShadow: PointLightShadow;
  #endif

  for (var i: i32 = 0; i < NUM_POINT_LIGHTS; i = i + 1) {
    pointLight = pointLights[i];
    getPointLightInfo(pointLight, geometryPosition, &directLight);

    #if defined(USE_SHADOWMAP) && (i < NUM_POINT_LIGHT_SHADOWS)
      pointLightShadow = pointLightShadows[i];
      let shadowFactor: f32 = select(1.0, getPointShadow(
        pointShadowMap[i], 
        pointLightShadow.shadowMapSize, 
        pointLightShadow.shadowIntensity, 
        pointLightShadow.shadowBias, 
        pointLightShadow.shadowRadius, 
        vPointShadowCoord[i], 
        pointLightShadow.shadowCameraNear, 
        pointLightShadow.shadowCameraFar
      ), directLight.visible && receiveShadow);
      directLight.color = directLight.color * shadowFactor;
    #endif

    RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, &material, &reflectedLight);
  }
#endif

// Spot lights processing
#if NUM_SPOT_LIGHTS > 0 && defined(RE_Direct)
  var spotLight: SpotLight;
  var spotColor: vec4<f32>;
  var spotLightCoord: vec3<f32>;
  var inSpotLightMap: bool;

  #if defined(USE_SHADOWMAP) && NUM_SPOT_LIGHT_SHADOWS > 0
    var spotLightShadow: SpotLightShadow;
  #endif

  for (var i: i32 = 0; i < NUM_SPOT_LIGHTS; i = i + 1) {
    spotLight = spotLights[i];
    getSpotLightInfo(spotLight, geometryPosition, &directLight);

    #if i < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS
      let SPOT_LIGHT_MAP_INDEX: i32 = i;
    #elif i < NUM_SPOT_LIGHT_SHADOWS
      let SPOT_LIGHT_MAP_INDEX: i32 = NUM_SPOT_LIGHT_MAPS;
    #else
      let SPOT_LIGHT_MAP_INDEX: i32 = i - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS;
    #endif

    #if SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS
      spotLightCoord = vSpotLightCoord[i].xyz / vSpotLightCoord[i].w;
      inSpotLightMap = all(lessThan(abs(spotLightCoord * 2.0 - vec3<f32>(1.0)), vec3<f32>(1.0)));
      spotColor = textureSample(spotLightMap[SPOT_LIGHT_MAP_INDEX], spotLightSampler, spotLightCoord.xy);
      directLight.color = select(directLight.color, directLight.color * spotColor.rgb, inSpotLightMap);
    #endif

    #if defined(USE_SHADOWMAP) && (i < NUM_SPOT_LIGHT_SHADOWS)
      spotLightShadow = spotLightShadows[i];
      let shadowFactor: f32 = select(1.0, getShadow(
        spotShadowMap[i], 
        spotLightShadow.shadowMapSize, 
        spotLightShadow.shadowIntensity, 
        spotLightShadow.shadowBias, 
        spotLightShadow.shadowRadius, 
        vSpotLightCoord[i]
      ), directLight.visible && receiveShadow);
      directLight.color = directLight.color * shadowFactor;
    #endif

    RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, &material, &reflectedLight);
  }
#endif

// CSM Directional lights processing
#if NUM_DIR_LIGHTS > 0 && defined(RE_Direct) && defined(USE_CSM) && defined(CSM_CASCADES)
  var directionalLight: DirectionalLight;
  let linearDepth: f32 = vViewPosition.z / (shadowFar - cameraNear);
  
  #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
    var directionalLightShadow: DirectionalLightShadow;
  #endif

  #if defined(USE_SHADOWMAP) && defined(CSM_FADE)
    var cascade: vec2<f32>;
    var cascadeCenter: f32;
    var closestEdge: f32;
    var margin: f32;
    var csmx: f32;
    var csmy: f32;

    for (var i: i32 = 0; i < NUM_DIR_LIGHTS; i = i + 1) {
      directionalLight = directionalLights[i];
      getDirectionalLightInfo(directionalLight, &directLight);

      #if i < NUM_DIR_LIGHT_SHADOWS
        cascade = CSM_cascades[i];
        cascadeCenter = (cascade.x + cascade.y) / 2.0;
        closestEdge = select(cascade.y, cascade.x, linearDepth < cascadeCenter);
        margin = 0.25 * pow(closestEdge, 2.0);
        csmx = cascade.x - margin / 2.0;
        csmy = cascade.y + margin / 2.0;
        
        if (linearDepth >= csmx && (linearDepth < csmy || i == CSM_CASCADES - 1)) {
          let dist: f32 = min(linearDepth - csmx, csmy - linearDepth);
          let ratio: f32 = clamp(dist / margin, 0.0, 1.0);

          let prevColor: vec3<f32> = directLight.color;
          directionalLightShadow = directionalLightShadows[i];
          let shadowFactor: f32 = select(1.0, getShadow(
            directionalShadowMap[i], 
            directionalLightShadow.shadowMapSize, 
            directionalLightShadow.shadowIntensity, 
            directionalLightShadow.shadowBias, 
            directionalLightShadow.shadowRadius, 
            vDirectionalShadowCoord[i]
          ), directLight.visible && receiveShadow);
          directLight.color = directLight.color * shadowFactor;

          let shouldFadeLastCascade: bool = i == CSM_CASCADES - 1 && linearDepth > cascadeCenter;
          directLight.color = mix(prevColor, directLight.color, select(1.0, ratio, shouldFadeLastCascade));

          let prevLight: ReflectedLight = reflectedLight;
          RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, &material, &reflectedLight);

          let shouldBlend: bool = i != CSM_CASCADES - 1 || (i == CSM_CASCADES - 1 && linearDepth < cascadeCenter);
          let blendRatio: f32 = select(1.0, ratio, shouldBlend);

          reflectedLight.directDiffuse = mix(prevLight.directDiffuse, reflectedLight.directDiffuse, vec3<f32>(blendRatio));
          reflectedLight.directSpecular = mix(prevLight.directSpecular, reflectedLight.directSpecular, vec3<f32>(blendRatio));
          reflectedLight.indirectDiffuse = mix(prevLight.indirectDiffuse, reflectedLight.indirectDiffuse, vec3<f32>(blendRatio));
          reflectedLight.indirectSpecular = mix(prevLight.indirectSpecular, reflectedLight.indirectSpecular, vec3<f32>(blendRatio));
        }
      #endif
    }
  #elif defined(USE_SHADOWMAP)
    for (var i: i32 = 0; i < NUM_DIR_LIGHTS; i = i + 1) {
      directionalLight = directionalLights[i];
      getDirectionalLightInfo(directionalLight, &directLight);

      #if i < NUM_DIR_LIGHT_SHADOWS
        directionalLightShadow = directionalLightShadows[i];
        if (linearDepth >= CSM_cascades[i].x && linearDepth < CSM_cascades[i].y) {
          let shadowFactor: f32 = select(1.0, getShadow(
            directionalShadowMap[i], 
            directionalLightShadow.shadowMapSize, 
            directionalLightShadow.shadowIntensity, 
            directionalLightShadow.shadowBias, 
            directionalLightShadow.shadowRadius, 
            vDirectionalShadowCoord[i]
          ), directLight.visible && receiveShadow);
          directLight.color = directLight.color * shadowFactor;
        }

        if (linearDepth >= CSM_cascades[i].x && (linearDepth < CSM_cascades[i].y || i == CSM_CASCADES - 1)) {
          RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, &material, &reflectedLight);
        }
      #endif
    }
  #elif NUM_DIR_LIGHT_SHADOWS > 0
    getDirectionalLightInfo(directionalLights[0], &directLight);
    RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, &material, &reflectedLight);
  #endif

  // Process non-shadow casting directional lights
  #if NUM_DIR_LIGHTS > NUM_DIR_LIGHT_SHADOWS
    for (var i: i32 = NUM_DIR_LIGHT_SHADOWS; i < NUM_DIR_LIGHTS; i = i + 1) {
      directionalLight = directionalLights[i];
      getDirectionalLightInfo(directionalLight, &directLight);
      RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, &material, &reflectedLight);
    }
  #endif
#endif

// Non-CSM directional lights
#if NUM_DIR_LIGHTS > 0 && defined(RE_Direct) && !defined(USE_CSM) && !defined(CSM_CASCADES)
  var directionalLight: DirectionalLight;
  #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
    var directionalLightShadow: DirectionalLightShadow;
  #endif

  for (var i: i32 = 0; i < NUM_DIR_LIGHTS; i = i + 1) {
    directionalLight = directionalLights[i];
    getDirectionalLightInfo(directionalLight, &directLight);

    #if defined(USE_SHADOWMAP) && (i < NUM_DIR_LIGHT_SHADOWS)
      directionalLightShadow = directionalLightShadows[i];
      let shadowFactor: f32 = select(1.0, getShadow(
        directionalShadowMap[i], 
        directionalLightShadow.shadowMapSize, 
        directionalLightShadow.shadowIntensity, 
        directionalLightShadow.shadowBias, 
        directionalLightShadow.shadowRadius, 
        vDirectionalShadowCoord[i]
      ), directLight.visible && receiveShadow);
      directLight.color = directLight.color * shadowFactor;
    #endif

    RE_Direct(directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, &material, &reflectedLight);
  }
#endif

// Rect area lights
#if NUM_RECT_AREA_LIGHTS > 0 && defined(RE_Direct_RectArea)
  var rectAreaLight: RectAreaLight;

  for (var i: i32 = 0; i < NUM_RECT_AREA_LIGHTS; i = i + 1) {
    rectAreaLight = rectAreaLights[i];
    RE_Direct_RectArea(rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, &material, &reflectedLight);
  }
#endif

// Indirect lighting
#ifdef RE_IndirectDiffuse
  var iblIrradiance: vec3<f32> = vec3<f32>(0.0);
  var irradiance: vec3<f32> = getAmbientLightIrradiance(ambientLightColor);

  #ifdef USE_LIGHT_PROBES
    irradiance = irradiance + getLightProbeIrradiance(lightProbe, geometryNormal);
  #endif

  #if NUM_HEMI_LIGHTS > 0
    for (var i: i32 = 0; i < NUM_HEMI_LIGHTS; i = i + 1) {
      irradiance = irradiance + getHemisphereLightIrradiance(hemisphereLights[i], geometryNormal);
    }
  #endif
#endif

#ifdef RE_IndirectSpecular
  var radiance: vec3<f32> = vec3<f32>(0.0);
  var clearcoatRadiance: vec3<f32> = vec3<f32>(0.0);
#endif
`,

  lights_pars_begin: /* wgsl */ `
#if defined(USE_CSM) && defined(CSM_CASCADES)
  @group(0) @binding(10) var<uniform> CSM_cascades: array<vec2<f32>, CSM_CASCADES>;
  @group(0) @binding(11) var<uniform> cameraNear: f32;
  @group(0) @binding(12) var<uniform> shadowFar: f32;
#endif
`
}

export default CSMShaderWGSL
