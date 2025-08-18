import { useEffect } from 'react'
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CompressedTexture,
  DoubleSide,
  FrontSide,
  InterleavedBufferAttribute,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Side,
  SphereGeometry,
  Texture,
  Vector2,
  Vector3
} from 'three'

import { Entity, UndefinedEntity, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getSimulationCounterpart,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'

import { Schema, useState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { Vector2_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { AssetType, FileToAssetType } from '@ir-engine/spatial/src/resources/AssetType'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { ContentFitTypeSchema } from '@ir-engine/spatial/src/transform/functions/ObjectFitFunctions'
import { ImageAlphaMode, ImageProjection } from '../classes/ImageUtils'
import { addError, clearErrors } from '../functions/ErrorFunctions'

// Making these functions to make it more explicit, otherwise .clone() needs to be called any time these are referenced between components
export const PLANE_GEO = () => new PlaneGeometry(1, 1, 1, 1)
export const SPHERE_GEO = () => new SphereGeometry(1, 64, 32)
export const PLANE_GEO_FLIPPED = () => flipNormals(new PlaneGeometry(1, 1, 1, 1))
export const SPHERE_GEO_FLIPPED = () => flipNormals(new SphereGeometry(1, 64, 32))

export const SideSchema = (init: Side) => Schema.LiteralUnion([FrontSide, BackSide, DoubleSide], { default: init })

export const ImageComponent = defineComponent({
  name: 'EE_image',
  jsonID: 'EE_image',

  schema: Schema.Object({
    source: Schema.String({ default: '' }),
    alphaMode: Schema.Enum(ImageAlphaMode, {
      $comment: "A string enum, ie. one of the following values: 'Opaque', 'Blend', 'Mask'",
      default: ImageAlphaMode.Opaque
    }),
    alphaCutoff: Schema.Number({ default: 0.5 }),
    projection: Schema.Enum(ImageProjection, {
      $comment: "A string enum, ie. one of the following values: 'Flat', 'Equirectangular360'",
      default: ImageProjection.Flat
    }),
    side: SideSchema(DoubleSide),
    fit: ContentFitTypeSchema('stretch'),

    //internal
    uvOffset: T.Vec2(),
    uvScale: T.Vec2(Vector2_One)
  }),

  errors: ['MISSING_TEXTURE_SOURCE', 'UNSUPPORTED_ASSET_CLASS', 'LOADING_ERROR', 'INVALID_URL'],

  reactor: ImageReactor
})

const _size = new Vector2()
export function getTextureSize(texture: Texture | CompressedTexture | null, size: Vector2 = _size) {
  const image = texture?.image as (HTMLImageElement & HTMLCanvasElement & HTMLVideoElement) | undefined
  const width = image?.videoWidth || image?.naturalWidth || image?.width || 0
  const height = image?.videoHeight || image?.naturalHeight || image?.height || 0
  return size.set(width, height)
}

export function getImageAspectRatio(entity: Entity) {
  const simEntity = getSimulationCounterpart(entity)
  if (simEntity === UndefinedEntity) return

  const mesh = getComponent(simEntity, MeshComponent) as Mesh<any, ShaderMaterial>
  if (!mesh || !mesh.material.uniforms.map) return

  const { width, height } = getTextureSize(mesh.material.uniforms.map.value as Texture | CompressedTexture)

  if (!width || !height) return

  const ratio = (width || 1) / (height || 1)
  return ratio
}

export function resizeImage(entity: Entity) {
  const imageRatio = getImageAspectRatio(entity) || 1
  const transformComponent = getComponent(entity, TransformComponent)
  const scale = transformComponent.scale
  const newX = scale.y * imageRatio
  const newY = scale.y
  const newZ = 1
  const newScale = new Vector3(newX, newY, newZ)
  transformComponent.scale.copy(newScale)
}

function flipNormals<G extends BufferGeometry>(geometry: G) {
  const uvs = (geometry.attributes.uv as BufferAttribute | InterleavedBufferAttribute).array
  for (let i = 1; i < uvs.length; i += 2) {
    // @ts-ignore
    uvs[i] = 1 - uvs[i]
  }
  return geometry
}

export function ImageReactor() {
  const entity = useEntityContext()
  const image = useComponent(entity, ImageComponent)
  const transformComponent = useComponent(entity, TransformComponent)
  const mesh = useOptionalComponent(entity, MeshComponent) as Mesh<PlaneGeometry | SphereGeometry, ShaderMaterial>

  const [texture, error] = useTexture(image.source, entity)
  const fitPlacementUvOffset = useState(new Vector2(0, 0))
  const fitPlacementUvScale = useState(new Vector2(1, 1))

  useEffect(() => {
    setComponent(
      entity,
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
            alphaUVOffset: { value: new Vector2(0, 0) }
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
    
            varying vec2 vUv;
    
            void main() {
            #ifdef USE_MAP
              vec2 adjustedUv = vUv * uvScale + uvOffset;
              vec2 mapUv = adjustedUv;
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

    return () => {
      removeComponent(entity, MeshComponent)
    }
  }, [])

  useEffect(() => {
    if (!error) return
    addError(entity, ImageComponent, `LOADING_ERROR`, error.message)
  }, [error])

  useEffect(() => {
    // if (!image.source) { /** @todo Just validate that the source is a valid url. Being undefined is not an error*/
    //   addError(entity, ImageComponent, `MISSING_TEXTURE_SOURCE`)
    //   return
    // }

    if (image.source) {
      const assetType = FileToAssetType(image.source)
      if (assetType !== AssetType.Image) {
        addError(entity, ImageComponent, `UNSUPPORTED_ASSET_CLASS`)
      }
    }
  }, [image.source]) // runs on any image change rn

  useEffect(() => {
    if (!mesh) return

    const uniforms = mesh.material.uniforms
    const defines = mesh.material.defines

    clearErrors(entity, ImageComponent)

    if (image.source && texture) {
      defines.USE_MAP = ''
      uniforms.map.value = texture
    } else {
      delete defines.USE_MAP
      uniforms.map.value = null
    }
    mesh.material.needsUpdate = true
    mesh.visible = true
  }, [!!mesh, texture, image.source])

  useEffect(() => {
    if (!mesh || !texture || !mesh.material.uniforms.map.value) return

    const uniforms = mesh.material.uniforms
    const flippedTexture = uniforms.map.value.flipY
    switch (image.projection) {
      case ImageProjection.Equirectangular360:
        mesh.geometry = flippedTexture ? SPHERE_GEO() : SPHERE_GEO_FLIPPED()
        mesh.scale.set(-1, 1, 1)
        break
      case ImageProjection.Flat:
      default:
        mesh.geometry = flippedTexture ? PLANE_GEO() : PLANE_GEO_FLIPPED()
    }
  }, [!!mesh, image.projection, !!texture])

  useEffect(() => {
    if (!mesh) return
    mesh.material.transparent = image.alphaMode !== ImageAlphaMode.Opaque
    mesh.material.alphaTest = image.alphaMode === 'Mask' ? image.alphaCutoff : 0
    mesh.material.side = image.side
  }, [!!mesh, image.alphaMode, image.alphaCutoff, image.side])

  useEffect(() => {
    if (!mesh) return

    const uvOffset = new Vector2(0, 0)
    const uvScale = new Vector2(1, 1)
    let imageSize = new Vector2(1, 1)

    const [containerWidth, containerHeight] = [transformComponent.scale.x, transformComponent.scale.y]
    const containerRatio = containerWidth / containerHeight

    if (texture) {
      imageSize = getTextureSize(mesh.material.uniforms.map.value as Texture | CompressedTexture)
      if (image.fit !== 'stretch') {
        const imageRatio = imageSize.x / imageSize.y || 1

        let isPlacementHorz = true
        if (image.fit == 'horizontal') {
          isPlacementHorz = true
        }
        if (image.fit == 'vertical') {
          isPlacementHorz = false
        }

        if (image.fit == 'contain') {
          if (imageRatio > containerRatio) {
            isPlacementHorz = true
          } else {
            isPlacementHorz = false
          }
        }
        if (image.fit == 'cover') {
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

    fitPlacementUvOffset.set(uvOffset)
    fitPlacementUvScale.set(uvScale)
  }, [!!mesh, transformComponent.scale, image.fit, texture])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.uvOffset.value = new Vector2(
      image.uvOffset.x + fitPlacementUvOffset.x.value,
      image.uvOffset.y + fitPlacementUvOffset.y.value
    )
  }, [!!mesh, image.uvOffset, fitPlacementUvOffset])

  useEffect(() => {
    if (!mesh) return
    const uniforms = mesh.material.uniforms
    uniforms.uvScale.value = new Vector2(
      image.uvScale.x * fitPlacementUvScale.x.value,
      image.uvScale.y * fitPlacementUvScale.y.value
    )
  }, [!!mesh, image.uvScale, fitPlacementUvScale])

  return null
}
