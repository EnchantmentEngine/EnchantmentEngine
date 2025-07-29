import { useEffect, useMemo, useRef } from 'react'
import {
  BufferGeometry,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Sphere,
  SRGBColorSpace,
  Texture,
  Vector3
} from 'three'

import { Engine, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { iOS } from '@ir-engine/spatial/src/common/functions/isMobile'
import { useVideoFrameCallback } from '@ir-engine/spatial/src/common/functions/useVideoFrameCallback'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { DomainConfigState } from '@ir-engine/spatial/src/resources/DomainConfigState'
import { CORTOLoader } from '../../assets/loaders/corto/CORTOLoader'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import { AudioState } from '../../audio/AudioState'
import { handleAutoplay, LegacyVolumetricComponent } from './LegacyVolumetricComponent'
import { MediaElementComponent } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'
import { UVOLDissolveComponent } from './UVOLDissolveComponent'

const decodeCorto = (url: string, start: number, end: number) => {
  return new Promise<BufferGeometry | null>((res, rej) => {
    getState(AssetLoaderState).cortoLoader.load(url, start, end, (geometry) => {
      res(geometry)
    })
  })
}

interface FrameData {
  frameNumber: number
  keyframeNumber: number
  startBytePosition: number
  vertices: number
  faces: number
  meshLength: number
}

interface ManifestSchema {
  maxVertices: number
  maxTriangles: number
  frameData: FrameData[]
  frameRate: number
}

export const UVOL1Component = defineComponent({
  name: 'UVOL1Component',

  schema: S.Object({
    manifestPath: S.String({ default: '' }),
    data: S.Object(
      {
        maxVertices: S.Number(),
        maxTriangles: S.Number(),
        frameData: S.Array(
          S.Object({
            frameNumber: S.Number(),
            keyframeNumber: S.Number(),
            startBytePosition: S.Number(),
            vertices: S.Number(),
            faces: S.Number(),
            meshLength: S.Number()
          })
        ),
        frameRate: S.Number()
      },
      {}
    ),
    firstGeometryFrameLoaded: S.Bool({ default: false }),
    loadingEffectStarted: S.Bool({ default: false }),
    loadingEffectEnded: S.Bool({ default: false })
  }),

  reactor: UVOL1Reactor
})

function UVOL1Reactor() {
  const entity = useEntityContext()
  const volumetric = useComponent(entity, LegacyVolumetricComponent)
  const component = useComponent(entity, UVOL1Component)
  const shadow = useOptionalComponent(entity, ShadowComponent)
  const videoElement = getComponent(entity, MediaElementComponent)
  const audioContext = getState(AudioState).audioContext
  const video = videoElement.element as HTMLVideoElement

  const meshBuffer = useMemo(() => new Map<number, BufferGeometry>(), [])
  const targetFramesToRequest = iOS ? 10 : 90

  const videoTexture = useMemo(() => {
    const element = videoElement.element as HTMLVideoElement
    const texture = new Texture(element)
    texture.generateMipmaps = false
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    ;(texture as any).isVideoTexture = true
    ;(texture as any).update = () => {}
    texture.colorSpace = SRGBColorSpace
    return texture
  }, [])

  const material = useMemo(() => {
    const _material = new MeshBasicMaterial({ color: 0xffffff })
    _material.map = videoTexture
    return _material
  }, [])

  const defaultGeometry = useMemo(() => new PlaneGeometry(0.001, 0.001) as BufferGeometry, [])

  // @ts-ignore
  const mesh: Mesh<BufferGeometry, ShaderMaterial | MeshBasicMaterial> = useMemo(
    () => new Mesh(defaultGeometry, material),
    []
  )

  const pendingRequests = useRef(0)
  const nextFrameToRequest = useRef(0)

  useEffect(() => {
    if (!getState(AssetLoaderState).cortoLoader) {
      const loader = new CORTOLoader()
      loader.setDecoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/')
      loader.preload()
      const assetLoaderState = getMutableState(AssetLoaderState)
      assetLoaderState.cortoLoader.set(loader)
    }
    if (volumetric.useLoadingEffect) {
      setComponent(entity, UVOLDissolveComponent)
    }

    video.src = component.manifestPath.replace('.manifest', '.mp4')
    video.load()
    video.addEventListener('ended', function setEnded() {
      setComponent(entity, LegacyVolumetricComponent, {
        ended: true
      })
      video.removeEventListener('ended', setEnded)
    })
    volumetric.currentTrackInfo.duration = component.data.frameData.length / component.data.frameRate
    setComponent(entity, LegacyVolumetricComponent)

    return () => {
      removeComponent(entity, ObjectComponent)
      videoTexture.dispose()
      const numberOfFrames = component.data.frameData.length
      removePlayedBuffer(numberOfFrames)
      meshBuffer.clear()
      video.src = ''
    }
  }, [])

  useEffect(() => {
    if (shadow) {
      setComponent(entity, ShadowComponent, {
        cast: true,
        receive: true
      })
    }
  }, [shadow])

  useEffect(() => {
    if (component.loadingEffectStarted && !component.loadingEffectEnded) {
      // Loading effect in progress. Let it finish
      return
    }
    // If autoplay is enabled, play the video irrespective of paused state
    if (volumetric.autoplay && volumetric.initialBuffersLoaded) {
      handleAutoplay(audioContext, video, entity)
    }
  }, [volumetric.autoplay, volumetric.initialBuffersLoaded, component.loadingEffectEnded])

  useEffect(() => {
    if (volumetric.paused || !volumetric.initialBuffersLoaded) {
      video.pause()
      return
    }
    if (mesh.material !== material) {
      mesh.material = material
      mesh.material.needsUpdate = true
    }
    handleAutoplay(audioContext, video, entity)
  }, [volumetric.paused])

  useEffect(() => {
    if (!component.firstGeometryFrameLoaded) return
    let timer = -1

    const prepareMesh = () => {
      if (video.buffered.length === 0) {
        // Video is not loaded yet,
        // wait for a bit and try again
        clearTimeout(timer)
        timer = window.setTimeout(prepareMesh, 200)
        return
      }

      mesh.geometry = meshBuffer.get(0)!
      mesh.geometry.attributes.position.needsUpdate = true

      videoTexture.needsUpdate = true
      const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent)
      renderer.renderer!.initTexture(videoTexture)

      if (volumetric.useLoadingEffect) {
        mesh.material = UVOLDissolveComponent.createDissolveMaterial(mesh)
        mesh.material.needsUpdate = true
        setComponent(entity, UVOL1Component, { loadingEffectStarted: true })
      }

      setComponent(entity, ObjectComponent, mesh)
    }

    prepareMesh()
  }, [component.firstGeometryFrameLoaded])

  useVideoFrameCallback(video, (now, metadata) => {
    if (!metadata) return
    /**
     * sync mesh frame to video texture frame
     */
    const processFrame = (frameToPlay: number) => {
      if (mesh.material instanceof ShaderMaterial && !hasComponent(entity, UVOLDissolveComponent)) {
        const oldMaterial = mesh.material
        mesh.material = material
        mesh.material.needsUpdate = true
        oldMaterial.dispose()
      }
      volumetric.currentTrackInfo.currentTime = frameToPlay / component.data.frameRate

      if (meshBuffer.has(frameToPlay)) {
        // @ts-ignore: value cannot be anything else other than BufferGeometry
        mesh.geometry = meshBuffer.get(frameToPlay)
        mesh.geometry.attributes.position.needsUpdate = true

        videoTexture.needsUpdate = true
        getComponent(Engine.instance.viewerEntity, RendererComponent).renderer!.initTexture(videoTexture)
      }
      removePlayedBuffer(frameToPlay)
    }

    const frameToPlay = Math.round(metadata.mediaTime * component.data.frameRate)
    processFrame(frameToPlay)
  })

  useEffect(() => {
    video.playbackRate = volumetric.currentTrackInfo.playbackRate
  }, [volumetric.currentTrackInfo.playbackRate])

  useExecute(
    () => {
      //do not execute if the cortoloader has not been initialized
      if (getState(AssetLoaderState).cortoLoader === null) return

      const delta = getState(ECSState).deltaSeconds

      if (
        component.loadingEffectStarted &&
        !component.loadingEffectEnded &&
        // @ts-ignore
        UVOLDissolveComponent.updateDissolveEffect(entity, mesh, delta)
      ) {
        removeComponent(entity, UVOLDissolveComponent)
        mesh.material = material
        mesh.material.needsUpdate = true
        setComponent(entity, UVOL1Component, { loadingEffectEnded: true })
        return
      }

      const numberOfFrames = component.data.frameData.length
      if (nextFrameToRequest.current === numberOfFrames - 1) {
        // Fetched all frames
        return
      }

      const minimumBufferLength = targetFramesToRequest * 2
      const meshBufferHasEnoughToPlay = meshBuffer.size >= Math.max(targetFramesToRequest * 2, 90) // 2 seconds
      const meshBufferHasEnough = meshBuffer.size >= minimumBufferLength * 5

      if (pendingRequests.current == 0 && !meshBufferHasEnough) {
        const newLastFrame = Math.min(nextFrameToRequest.current + targetFramesToRequest - 1, numberOfFrames - 1)
        for (let i = nextFrameToRequest.current; i <= newLastFrame; i++) {
          const meshFilePath = component.manifestPath.replace('.manifest', '.drcs')
          const byteStart = component.data.frameData[i].startBytePosition
          const byteEnd = byteStart + component.data.frameData[i].meshLength
          pendingRequests.current += 1
          decodeCorto(meshFilePath, byteStart, byteEnd)
            .then((geometry) => {
              if (!geometry) {
                throw new Error('VDEBUG Entity ${entity} Invalid geometry frame: ' + i.toString())
              }

              geometry.boundingSphere = new Sphere().set(new Vector3(), Infinity)
              meshBuffer.set(i, geometry)
              pendingRequests.current -= 1

              if (i === 0) {
                setComponent(entity, UVOL1Component, {
                  firstGeometryFrameLoaded: true
                })
              }
            })
            .catch((e) => {
              console.error('Error decoding corto frame: ', i, e)
              pendingRequests.current -= 1
            })

          nextFrameToRequest.current = newLastFrame
        }

        if (meshBufferHasEnoughToPlay && !volumetric.initialBuffersLoaded) {
          setComponent(entity, LegacyVolumetricComponent, {
            initialBuffersLoaded: true
          })
        }
      }
    },
    {
      with: AnimationSystemGroup
    }
  )

  const removePlayedBuffer = (currentFrame: number) => {
    for (const [key, buffer] of meshBuffer.entries()) {
      if (key < currentFrame) {
        buffer.dispose()
        meshBuffer.delete(key)
      }
    }
  }

  return null
}
