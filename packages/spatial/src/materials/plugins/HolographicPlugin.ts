import { Schema } from '@ir-engine/hyperflux'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { defineMaterialPlugin } from '../defineMaterialPlugin'

export const HolographicPluginComponent = defineMaterialPlugin({
  name: 'HolographicPluginComponent',

  jsonID: 'IR_material_holographic',

  uniforms: Schema.Object({
    speed: Schema.Number({ default: 0.1 }),
    time: Schema.Number({ default: 0 }),
    useBlink: Schema.Bool({ default: false }),
    mix_intensity: Schema.Number({ default: 1.0 }),
    hologramColor: T.Color(),
    hologramBrightness: Schema.Number({ default: 0.5 }),
    scanlineSize: Schema.Number({ default: 15.0 }),
    hologramOpacity: Schema.Number({ default: 0.5 })
  }),

  onApply: (entity, shader) => {
    shader.vertexShader =
      `
          varying vec4 vPos;  
          varying vec2 myuv;
          varying vec3 vPositionNormal; 
          varying vec3 v_Normal; 
          ` + shader.vertexShader

    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      ` 

          void main() {
            //vec3 transformed = vec3(position);
            vPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            myuv = uv;
            vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
            v_Normal = normalize( normalMatrix * normal ); 
          `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `
              uniform float speed;
              varying vec3 vPositionNormal; 
              varying vec3 v_Normal; 
              uniform float time; 
              uniform float mix_intensity; 
              uniform bool useBlink;
              uniform vec3 hologramColor;
              uniform float hologramBrightness;
              uniform float scanlineSize;
              uniform float hologramOpacity;
              varying vec4 vPos;
              varying vec2 myuv;
              float flicker( float amt, float time ) {return clamp( fract( cos( time ) * 4358.5453123 ), amt, 1.0 );}
              float random(in float a, in float b) { return fract((cos(dot(vec2(a,b) ,vec2(12.9898,78.233))) * 43758.5453)); }
        
      

          void main() {     

           
         `
    )

    const colorFragment = `
        #include <color_fragment>  
        vec2 vCoords = vPos.xy;
        vCoords /= vPos.w;
        vCoords = vCoords * 0.5 + 0.5;
        vec2 myUV = fract( vCoords );

        // // Defines hologram main color
        vec4 hologramColor = vec4(hologramColor, mix(hologramBrightness, myuv.y, 0.5));

        // // Add scanlines
        float scanlines = 10.;
        scanlines += 20. * sin(time *speed * 20.8 - myUV.y * 60. * scanlineSize);
        scanlines *= smoothstep(1.3 * cos(time *speed + myUV.y * scanlineSize), 0.78, 0.9);
        scanlines *= max(0.25, sin(time *speed) * 1.0);        
        
        // // Scanlines offsets
        float r = random(myuv.x, myuv.y);
        float g = random(myuv.y * 20.2, 	myuv.y * .2);
        float b = random(myuv.y * .9, 	myuv.y * .2);

        // // Scanline composition
        hologramColor += vec4(r*scanlines, b*scanlines, r, 1.0) / 84.;
        vec4 scanlineMix = mix(vec4(0.0), hologramColor, hologramColor.a);

        // // Calculates fresnel
        float fresnel=pow( (1. + -1. * abs(dot(v_Normal, vPositionNormal)))*2.2, 2.0 );

        // // Blinkin effect
        float blinkValue = 1.0 - speed;
        float blink = flicker(blinkValue, time * speed * .002);
    

        vec4 initial_diffuse=diffuseColor;
        if(useBlink){
            diffuseColor = mix( initial_diffuse,vec4( scanlineMix.rgb+fresnel*blink, 1.0),mix_intensity);}
        else{
            diffuseColor = mix( initial_diffuse,vec4( scanlineMix.rgb+fresnel, 1.0),mix_intensity);
        }
        `
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', colorFragment)

    const alphamapFragment = `
        #include <alphamap_fragment>   
    

        diffuseColor.a = hologramOpacity;
      
        `
    shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_fragment>', alphamapFragment)
  },

  update: (component, deltaSeconds) => {
    component.time += deltaSeconds
  }
})
