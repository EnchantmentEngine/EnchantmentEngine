import { useEffect } from 'react'
import {
  ClampToEdgeWrapping,
  CompressedTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  MirroredRepeatWrapping,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Vector2,
  VideoTexture
} from 'three'

import { createEntity, EntityTreeComponent, removeEntity, useEntityContext, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityID } from '@ir-engine/ecs/src/Entity'
import { defineState, NO_PROXY, useHookstate, useState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { createPriorityQueue } from '@ir-engine/spatial/src/common/functions/PriorityQueue'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ContentFitTypeSchema } from '@ir-engine/spatial/src/transform/functions/ObjectFitFunctions'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'

import { EntitySchema } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { Vector2_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { HighlightComponent } from '@ir-engine/spatial/src/renderer/components/HighlightComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { clearErrors } from '../functions/ErrorFunctions'
import { getTextureSize, PLANE_GEO, SideSchema, SPHERE_GEO } from './ImageComponent'
import { MediaComponent, MediaElementComponent } from './MediaComponent'

export const VideoTexturePriorityQueueState = defineState({
  name: 'VideoTexturePriorityQueueState',
  initial: () => {
    const accumulationBudget = isMobileXRHeadset || isMobile ? 1 : 3
    return {
      queue: createPriorityQueue({
        accumulationBudget
      })
    }
  }
})

class VideoTexturePriorityQueue extends VideoTexture {
  constructor(video) {
    super(video)
    this.minFilter = LinearFilter
    this.magFilter = LinearFilter
    this.generateMipmaps = false
  }
  update() {}
}

const WrappingSchema = Schema.LiteralUnion([RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping], {
  default: ClampToEdgeWrapping
})

const ProjectionSchema = Schema.LiteralUnion(['Flat', 'Equirectangular360'], { default: 'Flat' })

export const VideoComponent = defineComponent({
  name: 'EE_video',
  jsonID: 'EE_video',

  schema: Schema.Object({
    side: SideSchema(DoubleSide),
    uvOffset: T.Vec2(),
    uvScale: T.Vec2(Vector2_One),
    alphaUVOffset: T.Vec2(),
    wrapS: WrappingSchema,
    wrapT: WrappingSchema,
    useAlpha: Schema.Bool({ default: false }),
    useAlphaInvert: Schema.Bool({ default: false }),
    alphaThreshold: Schema.Number({ default: 0.5 }),
    fit: ContentFitTypeSchema('stretch'),
    projection: ProjectionSchema,
    mediaUUID: EntitySchema.EntityID(),

    // internal
    videoMeshEntity: EntitySchema.Entity({ serialized: false }),
    currentVideoSize: T.Vec2(Vector2_One, { serialized: false }),
    texture: Schema.Type<VideoTexturePriorityQueue | null>({ serialized: false })
  }),

  onRemove: (entity, component) => {
    if (VideoComponent.uniqueVideoEntities.includes(entity)) {
      VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
    }

    removeComponent(entity, MediaComponent)
  },

  errors: ['INVALID_MEDIA_UUID', 'MISSING_MEDIA_ELEMENT'],

  uniqueVideoEntities: [] as Entity[],

  reactor: VideoReactor
})

function VideoReactor() {
  const entity = useEntityContext()
  const video = useComponent(entity, VideoComponent)
  const visible = useHasComponent(entity, VisibleComponent)
  const mediaUUID = video.mediaUUID

  const mediaComponentEntity = mediaUUID ? UUIDComponent.useEntityFromSameSourceByID(entity, mediaUUID) : entity
  const mediaComponent = useOptionalComponent(mediaComponentEntity, MediaComponent)
  const hasMediaElementComponent = useHasComponent(mediaComponentEntity, MediaElementComponent)
  const localTextureRef = useHookstate<VideoTexturePriorityQueue | null>(null)
  const sourceVideoComponent = useOptionalComponent(mediaComponentEntity, VideoComponent)
  const transformComponent = useComponent(entity, TransformComponent)

  const highlightComponent = useOptionalComponent(entity, HighlightComponent)

  const videoMeshEntity = useHookstate(() => {
    const videoMeshEntity = createEntity()
    setComponent(
      videoMeshEntity,
      MeshComponent,
      new Mesh(
        PLANE_GEO(),
        new ShaderMaterial({
          uniforms: {
            map: { value: null },
            alphaMap: { value: null },
            uvOffset: { value: new Vector2(0, 0) },
            uvScale: { value: new Vector2(1, 1) },
            useAlpha: { value: false },
            alphaThreshold: { value: 0.5 },
            useAlphaInvert: { value: false },
            alphaUVOffset: { value: new Vector2(0, 0) },
            wrapS: { value: ClampToEdgeWrapping },
            wrapT: { value: ClampToEdgeWrapping }
          },
          vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }

      `,
          fragmentShader: `
      #ifdef USE_MAP
        uniform sampler2D map;
      #endif
        uniform bool useAlpha;
        uniform bool useAlphaInvert;
        uniform float alphaThreshold;
        uniform vec2 uvOffset;
        uniform vec2 uvScale;
        uniform vec2 alphaUVOffset;
        uniform int wrapS;
        uniform int wrapT;

        varying vec2 vUv;

        vec2 applyWrapping(vec2 uv, int wrapS, int wrapT) {
          vec2 wrappedUv = uv;
          // Repeat Wrapping
          if (wrapS == 1000) {
            wrappedUv.x = fract(wrappedUv.x);
          } else if (wrapS == 1002) {
            float mirrored = mod(wrappedUv.x, 2.0);
            if (mirrored > 1.0) mirrored = 2.0 - mirrored;
            wrappedUv.x = mirrored;
          } else {
            wrappedUv.x = clamp(wrappedUv.x, 0.0, 1.0);
          }

          if (wrapT == 1000) {
            wrappedUv.y = fract(wrappedUv.y);
          } else if (wrapT == 1002) {
            float mirrored = mod(wrappedUv.y, 2.0);
            if (mirrored > 1.0) mirrored = 2.0 - mirrored;
            wrappedUv.y = mirrored;
          } else {
            wrappedUv.y = clamp(wrappedUv.y, 0.0, 1.0);
          }
          return wrappedUv;
        }



        void main() {
        #ifdef USE_MAP
          vec2 adjustedUv = vUv * uvScale + uvOffset;
          vec2 mapUv = applyWrapping(adjustedUv, wrapS, wrapT);
          vec4 color = texture2D(map, mapUv);
          color.rgb = pow(color.rgb, vec3(2.2));
          if (useAlpha) {
            float intensity = 0.0;
            intensity = color.r * 0.333  + color.g * 0.333 + color.b * 0.333;
            if (useAlphaInvert) {
              intensity = 1.0 - intensity;
            }
            if (intensity < alphaThreshold) discard;
          }
          if( adjustedUv.y < 0.0 || adjustedUv.y > 1.0 || adjustedUv.x < 0.0 || adjustedUv.x > 1.0) {
              discard;
          }
          gl_FragColor = color;
        #else
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        #endif
        }
      `
        })
      )
    )
    return videoMeshEntity
  }).value

  useEffect(() => {
    return () => {
      removeComponent(videoMeshEntity, MeshComponent)
    }
  }, [])

  const fitPlacementUvOffset = useState(new Vector2(0, 0))
  const fitPlacementUvScale = useState(new Vector2(1, 1))

  const mesh = useComponent(videoMeshEntity, MeshComponent) as Mesh<PlaneGeometry | SphereGeometry, ShaderMaterial>

  useEffect(() => {
    setComponent(entity, VideoComponent, { videoMeshEntity })
    setComponent(videoMeshEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(videoMeshEntity, NameComponent, `video-group-${entity}`)
    setComponent(videoMeshEntity, MediaComponent)
    setComponent(videoMeshEntity, UUIDComponent, {
      entitySourceID: UUIDComponent.getAsSourceID(entity),
      entityID: 'video-mesh' as EntityID
    })

    setCallback(entity, 'setVisible', () => setComponent(videoMeshEntity, VisibleComponent))
    setCallback(entity, 'setInvisible', () => removeComponent(videoMeshEntity, VisibleComponent))

    setComponent(entity, VideoComponent, { mediaUUID: '' as EntityID })

    return () => {
      removeEntity(videoMeshEntity)
    }
  }, [])

  useEffect(() => {
    if (!mesh || !highlightComponent) return
    setComponent(videoMeshEntity, HighlightComponent)
    return () => {
      removeComponent(videoMeshEntity, HighlightComponent)
    }
  }, [!!mesh, highlightComponent])

  useEffect(() => {
    setVisibleComponent(videoMeshEntity, !!visible)
  }, [visible])

  // update side
  useEffect(() => {
    mesh.material.side = video.side
  }, [!!mesh, video.side])

  // update mesh
  useEffect(() => {
    const uvOffset = new Vector2(0, 0)
    const uvScale = new Vector2(1, 1)
    let imageSize = new Vector2(1, 1)

    const [containerWidth, containerHeight] = [transformComponent.scale.x, transformComponent.scale.y]
    const containerRatio = containerWidth / containerHeight

    if (mediaComponent && mediaComponent.isCurrentTrackLoaded) {
      imageSize = getTextureSize(mesh.material.uniforms.map.value as Texture | CompressedTexture)
      if (video.fit !== 'stretch') {
        const imageRatio = imageSize.x / imageSize.y || 1

        let isPlacementHorz = true
        if (video.fit == 'horizontal') {
          isPlacementHorz = true
        }
        if (video.fit == 'vertical') {
          isPlacementHorz = false
        }

        if (video.fit == 'contain') {
          if (imageRatio > containerRatio) {
            isPlacementHorz = true
          } else {
            isPlacementHorz = false
          }
        }
        if (video.fit == 'cover') {
          if (imageRatio > containerRatio) {
            isPlacementHorz = false
          } else {
            isPlacementHorz = true
          }
        }

        if (isPlacementHorz) {
          uvScale.y = imageRatio / containerRatio
          uvScale.x = 1
          uvOffset.y = (1 - uvScale.y) / 2
        } else {
          uvScale.x = 1 / imageRatio / (1 / containerRatio)
          uvScale.y = 1
          uvOffset.x = (1 - uvScale.x) / 2
        }
      }
    }

    setComponent(entity, VideoComponent, { currentVideoSize: imageSize })
    fitPlacementUvOffset.set(uvOffset)
    fitPlacementUvScale.set(uvScale)
  }, [!!mesh, transformComponent.scale, video.fit, video.texture, mesh?.material, mediaComponent?.isCurrentTrackLoaded])

  useEffect(() => {
    mesh.geometry = video.projection === 'Flat' ? PLANE_GEO() : SPHERE_GEO()
    mesh.geometry.attributes.position.needsUpdate = true
    const uniforms = mesh.material.uniforms
    uniforms.map.value = video.texture
    const defines = mesh.material.defines
    if (video.texture) {
      defines.USE_MAP = ''
    } else {
      delete defines.USE_MAP
    }
    mesh.material.needsUpdate = true
  }, [!!mesh, video.texture, video.projection])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.wrapS.value = video.wrapS
  }, [!!mesh, video.wrapS])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.wrapT.value = video.wrapT
  }, [!!mesh, video.wrapT])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.useAlpha.value = video.useAlpha
  }, [!!mesh, video.useAlpha])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.useAlphaInvert.value = video.useAlphaInvert
  }, [video.useAlphaInvert])

  useEffect(() => {
    const uniforms = mesh.material.uniforms
    uniforms.alphaThreshold.value = video.alphaThreshold
  }, [!!mesh, video.alphaThreshold])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.uvOffset.value = new Vector2(
      video.uvOffset.x + fitPlacementUvOffset.x.value,
      video.uvOffset.y + fitPlacementUvOffset.y.value
    )
  }, [!!mesh, video.uvOffset, fitPlacementUvOffset])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.uvScale.value = new Vector2(
      video.uvScale.x * fitPlacementUvScale.x.value,
      video.uvScale.y * fitPlacementUvScale.y.value
    )
  }, [!!mesh, video.uvScale, fitPlacementUvScale])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.alphaUVOffset.value = video.alphaUVOffset
  }, [!!mesh, video.alphaUVOffset])

  useEffect(() => {
    if (entity !== mediaComponentEntity && sourceVideoComponent) {
      if (video.texture !== sourceVideoComponent.texture) {
        video.texture = sourceVideoComponent.texture
      }
    } else {
      if (video.texture !== localTextureRef.get(NO_PROXY)) {
        //force the html media element to update it's image that is used for the texture, by setting the current time
        const media = getComponent(mediaComponentEntity, MediaComponent)
        const mediaElement = getOptionalComponent(mediaComponentEntity, MediaElementComponent)
        if (mediaElement) {
          mediaElement.element.currentTime = media.currentTrackTime
        }
        setComponent(entity, VideoComponent, { texture: localTextureRef.get(NO_PROXY)! as VideoTexturePriorityQueue })
      }
    }
    clearErrors(entity, VideoComponent)
  }, [sourceVideoComponent?.texture])

  useEffect(() => {
    if (!mesh || !mediaComponentEntity) return

    if (!hasMediaElementComponent) {
      if (video.texture !== null) {
        localTextureRef.set(null)
        setComponent(entity, VideoComponent, { texture: null })
        setComponent(entity, MediaComponent, { paused: true })
      }
      return
    }
    if (entity !== mediaComponentEntity) {
      return
    }

    const sourceMeshComponent = getOptionalComponent(mediaComponentEntity, MeshComponent)
    const mediaElement = getComponent(mediaComponentEntity, MediaElementComponent)
    const sourceTexture = sourceVideoComponent?.texture

    if (video.texture) {
      const videoEl = mediaElement.element as HTMLVideoElement

      const resetMuted = () => {
        videoEl.muted = false
        document.removeEventListener('pointerdown', resetMuted)
      }

      if (videoEl.paused) {
        videoEl.pause()
      } else {
        videoEl.play().catch((error) => {
          if (error.name === 'NotAllowedError') {
            videoEl.muted = true
            videoEl.play()

            document.addEventListener('pointerdown', resetMuted)
          } else {
            console.error(error)
          }
        })
      }

      //needed to set up the self-referencing source video texture
      ;(video.texture.image as HTMLVideoElement) = videoEl
      clearErrors(entity, VideoComponent)
    } else {
      if (sourceTexture && sourceMeshComponent) {
        mesh.material = sourceMeshComponent.material as ShaderMaterial
        clearErrors(entity, VideoComponent)
      } else {
        const texture = new VideoTexturePriorityQueue(mediaElement.element as HTMLVideoElement)
        localTextureRef.set(texture)
        video.texture = texture
        VideoComponent.uniqueVideoEntities.push(mediaComponentEntity)
        clearErrors(entity, VideoComponent)
        return () => {
          if (VideoComponent.uniqueVideoEntities.includes(entity)) {
            VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
          }
        }
      }
    }
  }, [!!mesh, video.texture, video.mediaUUID, mediaComponentEntity, hasMediaElementComponent])

  return null
}
