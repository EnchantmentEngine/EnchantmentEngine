import { BufferGeometry, DoubleSide, Mesh, MeshStandardMaterial, SRGBColorSpace, Vector4, VideoTexture } from 'three'

import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'

import { S } from '@ir-engine/ecs'
import { defineMaterialPlugin } from '@ir-engine/spatial'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { ScreenshareTargetComponent } from '../components/ScreenshareTargetComponent'
import { fitTexture } from './fitTexture'

const screenshareTargetQuery = defineQuery([MeshComponent, ScreenshareTargetComponent])

const getAspectRatioFromBufferGeometry = (mesh: Mesh<BufferGeometry>) => {
  mesh.geometry.computeBoundingBox()
  const boundingBox = mesh.geometry.boundingBox!
  const bb = boundingBox.clone().applyMatrix4(mesh.matrixWorld)
  return (bb.max.x - bb.min.x) / (bb.max.y - bb.min.y)
}

export const ScreenshareShaderPluginComponent = defineMaterialPlugin({
  name: 'ScreenshareShaderPluginComponent',

  jsonID: 'IR_screenshare_shader',

  uniforms: S.Object({
    clipColor: T.Vec4(new Vector4(0, 0, 0, 1))
  }),

  onApply(shader) {
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', `uniform vec4 clipColor;\nvoid main() {\n`)

    const mapFragment = `#ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );

        // Newly added clipping Logic /////
        if (vMapUv.x < 0.0 || vMapUv.x > 1.0 || vMapUv.y < 0.0 || vMapUv.y > 1.0) sampledDiffuseColor = clipColor;
        /////////////////////////////

        #ifdef DECODE_VIDEO_TEXTURE
          sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
        #endif
        diffuseColor *= sampledDiffuseColor;
      #endif`

    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', mapFragment)
  }
})

export const applyVideoToTexture = (
  video: HTMLVideoElement,
  obj: Mesh<any, any>,
  fit: 'fit' | 'fill' | 'stretch' = 'fit',
  overwrite = true
) => {
  if (!obj.material)
    obj.material = new MeshStandardMaterial({ color: 0xffffff, map: new VideoTexture(video), side: DoubleSide })

  if (!obj.material.map || overwrite) obj.material.map = new VideoTexture(video)

  obj.material.map.colorSpace = SRGBColorSpace

  const imageAspect = video.videoWidth / video.videoHeight
  const screenAspect = getAspectRatioFromBufferGeometry(obj)

  fitTexture(obj.material.map, imageAspect, screenAspect, fit)

  setComponent(obj.material.entity, ScreenshareShaderPluginComponent)
}

export const applyScreenshareToTexture = (video: HTMLVideoElement) => {
  const applyTexture = () => {
    if ((video as any).appliedTexture) return
    ;(video as any).appliedTexture = true
    if (!video.videoWidth || !video.videoHeight) return
    for (const entity of screenshareTargetQuery()) {
      const mesh = getComponent(entity, MeshComponent)
      if (mesh.material) {
        applyVideoToTexture(video, mesh)
      }
    }
  }
  if (!video.readyState) {
    video.onloadeddata = () => {
      applyTexture()
    }
  } else {
    applyTexture()
  }
}
