import {
  AnimationSystemGroup,
  ComponentType,
  Entity,
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useExecute,
  useOptionalComponent
} from '@ir-engine/ecs'
import { Schema, State, getMutableState, getState } from '@ir-engine/hyperflux'
import {
  ObjectComponent,
  addObjectToGroup,
  removeObjectFromGroup
} from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { DomainConfigState } from '@ir-engine/spatial/src/resources/DomainConfigState'
import { useEffect, useRef } from 'react'
import {
  BufferGeometry,
  CompressedTexture,
  Group,
  LinearFilter,
  Material,
  Mesh,
  SRGBColorSpace,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Vector2
} from 'three'
import { CORTOLoader } from '../../assets/loaders/corto/CORTOLoader'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import { AudioState } from '../../audio/AudioState'
import {
  DRACOTarget,
  FrameTargetInfo,
  GeometryFormatToType,
  GeometryType,
  KeyframeAttribute,
  PlayerManifest as ManifestSchema,
  OldManifestSchema,
  TIME_UNIT_MULTIPLIER,
  TextureType,
  UniformSolveEncodeOptions,
  UniformSolveTarget,
  textureTypeToUniformKey
} from '../constants/UVOLTypes'
import { addError, clearErrors } from '../functions/ErrorFunctions'
import BufferDataContainer from '../util/BufferDataContainer'
import {
  bufferLimits,
  deleteUsedGeometryBuffers,
  deleteUsedTextureBuffers,
  fetchGeometry,
  fetchTextures
} from '../util/VolumetricBufferingUtils'
import {
  GetGeometryProps,
  createMaterial,
  getGeometry,
  getSortedSupportedTargets,
  getTexture,
  handleMediaAutoplay
} from '../util/VolumetricUtils'
import { AudioNodeGroups, MediaElementComponent, createAudioNodeGroup } from './MediaComponent'
import { PlaylistComponent } from './PlaylistComponent'

interface VolumetricMutables {
  material: ShaderMaterial | null
  mesh: Mesh<BufferGeometry, ShaderMaterial> | null
  group: Group
  manifest: OldManifestSchema | ManifestSchema | Record<string, never>
  geometryBufferData: BufferDataContainer
  geometryBuffer: Map<string, (Mesh<BufferGeometry, Material> | BufferGeometry | KeyframeAttribute)[]>
  texture: Partial<
    Record<
      TextureType,
      {
        bufferData: BufferDataContainer
        buffer: Map<string, CompressedTexture[]>
      }
    >
  >
}

export const volumetricMutables: Record<Entity, VolumetricMutables> = {}

const initialState = {
  useVideoTextureForBaseColor: false, // legacy for UVOL1
  useLoadingEffect: true,
  volume: 1,
  checkForEnoughBuffers: true,
  notEnoughBuffers: true,
  time: {
    start: 0,
    checkpointAbsolute: -1,
    checkpointRelative: 0,
    currentTime: 0,
    bufferedUntil: 0,
    duration: 0
  },
  geometry: {
    targets: [],
    initialBufferLoaded: false,
    firstFrameLoaded: false,
    currentTarget: 0,
    userTarget: -1
  } as FrameTargetInfo,
  geometryType: undefined as unknown as GeometryType,
  textureBuffer: undefined as unknown as Map<string, Map<string, CompressedTexture[]>>,
  setIntervalId: -1,
  texture: {} as Partial<Record<TextureType, FrameTargetInfo>>,
  textureInfo: {
    textureTypes: [] as TextureType[],
    initialBufferLoaded: {} as Partial<Record<TextureType, boolean>>,
    firstFrameLoaded: {} as Partial<Record<TextureType, boolean>>
  },
  paused: true
} as ComponentType<typeof VolumetricComponent>

const resetState = {
  useVideoTextureForBaseColor: false, // legacy for UVOL1

  checkForEnoughBuffers: true,
  notEnoughBuffers: true,
  time: {
    start: 0,
    checkpointAbsolute: -1,
    checkpointRelative: 0,
    currentTime: 0,
    bufferedUntil: 0,
    duration: 0
  },
  geometry: {
    targets: [],
    initialBufferLoaded: false,
    firstFrameLoaded: false,
    currentTarget: 0,
    userTarget: -1
  } as FrameTargetInfo,
  geometryType: undefined as unknown as GeometryType,
  textureBuffer: undefined as unknown as Map<string, Map<string, CompressedTexture[]>>,
  setIntervalId: -1,
  texture: {} as Partial<Record<TextureType, FrameTargetInfo>>,
  textureInfo: {
    textureTypes: [] as TextureType[],
    initialBufferLoaded: {} as Partial<Record<TextureType, boolean>>,
    firstFrameLoaded: {} as Partial<Record<TextureType, boolean>>
  },
  paused: true
} as ComponentType<typeof VolumetricComponent>

export const TextureTypeSchema = Schema.LiteralUnion([
  'normal',
  'metallicRoughness',
  'emissive',
  'occlusion',
  'baseColor'
])

/** @todo figure out how get this type to work */
const PreTrackBufferingCallbackSchema = Schema.Optional(
  Schema.Func([Schema.Type<State<ComponentType<typeof VolumetricComponent>>>()], Schema.Void())
)

export const VolumetricComponent = defineComponent({
  name: 'VolumetricComponent',
  jsonID: 'IR_volumetric',

  schema: Schema.Object({
    useVideoTextureForBaseColor: Schema.Bool({ default: false }), // legacy for UVOL1
    useLoadingEffect: Schema.Bool({ default: true }),
    volume: Schema.Number({ default: 1 }),
    checkForEnoughBuffers: Schema.Bool({ default: true }),
    notEnoughBuffers: Schema.Bool({ default: true }),
    time: Schema.Object({
      start: Schema.Number({ default: 0 }),
      checkpointAbsolute: Schema.Number({ default: -1 }),
      checkpointRelative: Schema.Number({ default: 0 }),
      currentTime: Schema.Number({ default: 0 }),
      bufferedUntil: Schema.Number({ default: 0 }),
      duration: Schema.Number({ default: 0 })
    }),
    geometry: Schema.Object({
      targets: Schema.Array(Schema.String()),
      initialBufferLoaded: Schema.Bool({ default: false }),
      firstFrameLoaded: Schema.Bool({ default: false }),
      currentTarget: Schema.Number({ default: 0 }),
      userTarget: Schema.Number({ default: -1 })
    }),
    geometryType: Schema.Enum(GeometryType, {
      $comment: "A number enum, where: 0 represents 'Corto', 1 represents 'Draco', 2 represents 'Unify'",
      default: GeometryType.Corto
    }),
    textureBuffer: Schema.Type<Map<string, Map<string, CompressedTexture[]>>>({
      default: () => new Map<string, Map<string, CompressedTexture[]>>()
    }),
    setIntervalId: Schema.Number({ default: -1 }),
    texture: Schema.Record(
      TextureTypeSchema,
      Schema.Object({
        initialBufferLoaded: Schema.Bool(),
        firstFrameLoaded: Schema.Bool(),
        targets: Schema.Array(Schema.String()),
        currentTarget: Schema.Number(),
        userTarget: Schema.Number()
      })
    ),
    textureInfo: Schema.Object({
      textureTypes: Schema.Array(TextureTypeSchema),
      initialBufferLoaded: Schema.Partial(Schema.Record(TextureTypeSchema, Schema.Bool())),
      firstFrameLoaded: Schema.Partial(Schema.Record(TextureTypeSchema, Schema.Bool()))
    }),
    paused: Schema.Bool({ default: true })
  }),

  toJSON: (component) => ({
    useLoadingEffect: component.useLoadingEffect,
    volume: component.volume
  }),

  errors: ['INVALID_TRACK', 'GEOMETRY_ERROR', 'TEXTURE_ERROR', 'UNKNOWN_ERROR'],

  canPlayWithoutPause: (entity: Entity) => {
    const component = getComponent(entity, VolumetricComponent)
    const manifest = volumetricMutables[entity].manifest
    if (Object.keys(manifest).length === 0) {
      return false
    }

    const currentTimeInMS = component.time.currentTime
    const geometryBufferDataContainer = volumetricMutables[entity].geometryBufferData

    let durationInMS = -1
    const geometryType = component.geometryType

    if (geometryType === GeometryType.Corto) {
      const frameCount = (manifest as OldManifestSchema).frameData.length
      const frameRate = (manifest as OldManifestSchema).frameRate
      durationInMS = (frameCount * 1000) / frameRate
    } else if (geometryType === GeometryType.Unify || geometryType === GeometryType.Draco) {
      durationInMS = (manifest as ManifestSchema).duration * 1000
    } else {
      console.error('Invalid geometry type')
      return false
    }

    if (!component.geometry.initialBufferLoaded) {
      return false
    }

    const startTime = (currentTimeInMS * TIME_UNIT_MULTIPLIER) / 1000
    const geometryEndTime = Math.min(
      (durationInMS * TIME_UNIT_MULTIPLIER) / 1000,
      startTime + bufferLimits.geometry[geometryType].minBufferDurationToPlay * TIME_UNIT_MULTIPLIER
    )

    const geometryBufferData = geometryBufferDataContainer.getIntersectionDuration(startTime, geometryEndTime)
    if (geometryBufferData.missingDuration > 0 || geometryBufferData.pendingDuration > 0) {
      VolumetricComponent.adjustGeometryTarget(entity, 1) // lower the target, by signalling that the metric is 1
      return false
    }

    if (component.useVideoTextureForBaseColor) {
      return true
    }

    const textureTypes = component.textureInfo.textureTypes
    for (const textureType of textureTypes) {
      const textureInfo = component.texture[textureType]

      const textureBufferInfo = volumetricMutables[entity].texture[textureType]

      if (!textureInfo || !textureBufferInfo) {
        return false
      }

      if (!component.textureInfo.initialBufferLoaded[textureType]) {
        return false
      }
      const textureBufferDataContainer = textureBufferInfo.bufferData
      const target = textureInfo.targets[textureInfo.currentTarget]
      const format = (manifest as ManifestSchema).texture[textureType]!.targets[target].format

      const endTime = Math.min(
        (durationInMS * TIME_UNIT_MULTIPLIER) / 1000,
        startTime + bufferLimits.texture[format].minBufferDurationToPlay * TIME_UNIT_MULTIPLIER
      )

      const textureBufferData = textureBufferDataContainer.getIntersectionDuration(startTime, endTime)
      if (textureBufferData.missingDuration > 0 || textureBufferData.pendingDuration > 0) {
        VolumetricComponent.adjustTextureTarget(entity, textureType, 1) // lower the target, by signalling that the metric is 1
        return false
      }
    }

    return true
  },

  adjustGeometryTarget: (entity: Entity, externalMetric?: number) => {
    const component = getComponent(entity, VolumetricComponent)
    if (component.geometry.userTarget !== -1) {
      if (component.geometry.currentTarget !== component.geometry.userTarget) {
        component.geometry.currentTarget = component.geometry.userTarget
        setComponent(entity, VolumetricComponent)
      }
      return
    }

    const geometryType = component.geometryType
    const bufferData = volumetricMutables[entity].geometryBufferData

    if (geometryType !== GeometryType.Corto) {
      const { totalFetchTime, totalPlayTime } = bufferData.getMetrics()
      if (externalMetric === undefined && totalPlayTime < 4 * TIME_UNIT_MULTIPLIER) {
        return
      }

      const metric = externalMetric === undefined ? totalFetchTime / totalPlayTime : externalMetric
      if (metric >= 0.5) {
        if (component.geometry.currentTarget > 0) {
          console.log('Decreasing geometry target, from ', component.geometry.currentTarget)
          component.geometry.currentTarget -= 1
        }
      } else if (metric <= 0.1) {
        if (component.geometry.currentTarget < component.geometry.targets.length - 1) {
          console.log('Increasing geometry target from ', component.geometry.currentTarget)
          component.geometry.currentTarget += 1
        }
      }
      if (externalMetric === undefined) {
        bufferData.resetMetrics()
      }
    }
  },

  adjustTextureTarget: (entity: Entity, textureType: TextureType, externalMetric?: number) => {
    const component = getComponent(entity, VolumetricComponent)
    const textureInfo = component.texture[textureType]
    const textureBufferInfo = volumetricMutables[entity].texture[textureType]

    if (textureInfo && textureBufferInfo) {
      if (textureInfo.userTarget !== -1) {
        if (textureInfo.currentTarget !== textureInfo.userTarget) {
          component.texture[textureType].currentTarget = textureInfo.userTarget
        }
        return
      }

      const bufferData = textureBufferInfo.bufferData
      const { totalFetchTime, totalPlayTime } = bufferData.getMetrics()
      if (externalMetric === undefined && totalPlayTime < 4 * TIME_UNIT_MULTIPLIER) {
        return
      }

      const metric = externalMetric === undefined ? totalFetchTime / totalPlayTime : externalMetric
      if (metric >= 0.5) {
        if (textureInfo.currentTarget > 0) {
          component.texture[textureType].currentTarget -= 1
        }
      } else if (metric <= 0.1) {
        if (textureInfo.currentTarget < textureInfo.targets.length - 1) {
          component.texture[textureType].currentTarget += 1
        }
      }
      if (externalMetric === undefined) {
        bufferData.resetMetrics()
      }
    }
  },

  cleanupTrack: (entity: Entity) => {
    const component = getComponent(entity, VolumetricComponent)

    console.log('Cleaning up track')
    clearInterval(component.setIntervalId)
    console.log('Cleared buffer loop interval: ', component.setIntervalId)

    const mesh = volumetricMutables[entity].mesh
    if (mesh && volumetricMutables[entity].group) {
      volumetricMutables[entity].group.remove(mesh)
    }
    if (volumetricMutables[entity].group) {
      removeObjectFromGroup(entity, volumetricMutables[entity].group)
    }

    const material = volumetricMutables[entity].material

    const MAX_DURATION = 5 * 60 * 1000 // 5 minutes
    const geometryBuffer = volumetricMutables[entity].geometryBuffer

    const textureTypes = Object.keys(volumetricMutables[entity].texture) as TextureType[]
    textureTypes.forEach((textureType) => {
      const textureBufferInfo = volumetricMutables[entity].texture[textureType]
      if (textureBufferInfo) {
        const textureBuffer = textureBufferInfo.buffer

        deleteUsedTextureBuffers({
          currentTimeInMS: MAX_DURATION,
          textureBuffer: textureBuffer,
          textureType: textureType as TextureType,
          clearAll: true
        })

        textureBuffer.clear()
      }
    })

    const geometryType = material?.vertexShader.includes('keyframeANormal') ? GeometryType.Unify : GeometryType.Corto
    deleteUsedGeometryBuffers({
      currentTimeInMS: MAX_DURATION,
      geometryBuffer: geometryBuffer,
      geometryType: geometryType,
      mesh: mesh!,
      clearAll: true
    })
    geometryBuffer.clear()

    if (material) {
      material.dispose()
    }

    if (mesh) {
      mesh.geometry.dispose()
    }

    console.log('Setting track to initial state: ', initialState)

    setComponent(entity, VolumetricComponent, structuredClone(resetState))

    volumetricMutables[entity].geometryBufferData = new BufferDataContainer()

    const mediaElement = getOptionalComponent(entity, MediaElementComponent)
    if (mediaElement) {
      mediaElement.element.src = ''
    }

    if (hasComponent(entity, VolumetricComponent)) {
      clearErrors(entity, VolumetricComponent)
    }
  },

  onRemove: (entity) => {
    VolumetricComponent.cleanupTrack(entity)
  },

  reactor: VolumetricComponentReactor
})

function VolumetricComponentReactor() {
  const entity = useEntityContext()
  const playlistComponent = useOptionalComponent(entity, PlaylistComponent)
  const component = useComponent(entity, VolumetricComponent)
  const bufferLoopIntervalId = useRef(-1)

  const audioContext = getState(AudioState).audioContext
  const gainNodeMixBuses = getState(AudioState).gainNodeMixBuses

  // Used by GeometryType.Unify
  const repeat = useRef(new Vector2(1, 1))
  const offset = useRef(new Vector2(0, 0))

  useEffect(() => {
    if (!component.geometry.initialBufferLoaded) {
      return
    }
    if (component.useVideoTextureForBaseColor) {
      setComponent(entity, ObjectComponent, volumetricMutables[entity].group)
      const media = getComponent(entity, MediaElementComponent).element
      handleMediaAutoplay({
        audioContext,
        media,
        entity
      })
      return
    }
    const textureInitialBufferLoaded = component.textureInfo.initialBufferLoaded
    const textureTypes = component.textureInfo.textureTypes
    for (const textureType of textureTypes) {
      if (!textureInitialBufferLoaded[textureType]) {
        return
      }
    }
    if (playlistComponent?.autoplay && playlistComponent?.paused) {
      setComponent(entity, PlaylistComponent, { paused: false })
    } else if (playlistComponent?.autoplay && !playlistComponent?.paused) {
      component.time.checkpointAbsolute = Date.now()
      component.paused = false
      setComponent(entity, VolumetricComponent)
    }

    console.log('All initial buffers loaded')
    addObjectToGroup(entity, volumetricMutables[entity].group)
  }, [audioContext, component.geometry.initialBufferLoaded, component.textureInfo.initialBufferLoaded])

  const bufferLoop = () => {
    if (!hasComponent(entity, VolumetricComponent)) {
      clearInterval(bufferLoopIntervalId.current)
      return
    }

    const currentTimeInMS = component.time.currentTime
    const geometryTarget = component.geometry.targets[component.geometry.currentTarget]
    const manifest = volumetricMutables[entity].manifest
    const geometryType = component.geometryType
    const manifestPath = playlistComponent?.tracks.find((track) => track.uuid === playlistComponent.currentTrackUUID)
      ?.src
    if (!manifestPath) {
      return
    }

    fetchGeometry({
      currentTimeInMS,
      bufferData: volumetricMutables[entity].geometryBufferData,
      target: geometryTarget,
      manifest,
      geometryType,
      manifestPath,
      geometryBuffer: volumetricMutables[entity].geometryBuffer,
      mesh: volumetricMutables[entity].mesh!,
      startTimeInMS: component.time.start,
      entity,
      repeat: repeat,
      offset: offset
    })
    if (!component.useVideoTextureForBaseColor) {
      component.textureInfo.textureTypes.forEach((textureType) => {
        const textureTypeData = component.texture[textureType]
        const textureBufferInfo = volumetricMutables[entity].texture[textureType]

        if (textureTypeData && textureBufferInfo) {
          const bufferData = textureBufferInfo.bufferData
          const textureBuffer = textureBufferInfo.buffer

          const target = textureTypeData.targets[textureTypeData.currentTarget]
          const format = (manifest as ManifestSchema).texture[textureType]!.targets[target].format
          if (!(textureType in component.textureInfo.initialBufferLoaded)) {
            component.textureInfo.initialBufferLoaded[textureType] = false
          }

          fetchTextures({
            currentTimeInMS,
            bufferData,
            target,
            manifest,
            textureType,
            manifestPath,
            textureBuffer: textureBuffer,
            textureFormat: format,
            startTimeInMS: component.time.start,
            entity
          })
        }
      })
    }
  }

  useEffect(() => {
    if (!hasComponent(entity, MediaElementComponent)) {
      setComponent(entity, MediaElementComponent, {
        element: document.createElement('video')
      })
    }

    volumetricMutables[entity] = {
      material: null,
      mesh: null,
      group: new Group(),
      manifest: {},
      geometryBufferData: new BufferDataContainer(),
      geometryBuffer: new Map(),
      texture: {}
    }

    const mediaElement = getComponent(entity, MediaElementComponent)
    const element = mediaElement.element

    if (!AudioNodeGroups.get(element)) {
      const source = audioContext.createMediaElementSource(element)
      const audioNodes = createAudioNodeGroup(element, source, gainNodeMixBuses.soundEffects)

      audioNodes.gain.gain.setTargetAtTime(component.volume, audioContext.currentTime, 0.1)
    }
  }, [])

  useEffect(() => {
    const volume = component.volume
    const mediaElement = getOptionalComponent(entity, MediaElementComponent)
    if (mediaElement) {
      const element = mediaElement.element
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
      }
    }
  }, [component.volume])

  const validateManifest = (manifest: OldManifestSchema | ManifestSchema) => {
    try {
      if (!manifest) {
        addError(entity, VolumetricComponent, 'INVALID_TRACK', 'Manifest is empty')
        return false
      }

      if (
        (manifest as OldManifestSchema).frameData !== undefined &&
        (manifest as OldManifestSchema).frameRate !== undefined
      ) {
        component.useVideoTextureForBaseColor = true
        component.geometryType = GeometryType.Corto
        component.textureInfo.textureTypes = ['baseColor']
        component.time.duration =
          (manifest as OldManifestSchema).frameData.length / (manifest as OldManifestSchema).frameRate
        component.texture = {
          baseColor: {
            targets: [] as string[],
            initialBufferLoaded: false,
            firstFrameLoaded: false,
            currentTarget: 0,
            userTarget: -1
          }
        } as any
        component.geometry.targets = ['corto']
        if (!getState(AssetLoaderState).cortoLoader) {
          const loader = new CORTOLoader()
          loader.setDecoderPath(getState(DomainConfigState).publicDomain + '/loader_decoders/')
          loader.preload()
          const assetLoaderState = getMutableState(AssetLoaderState)
          assetLoaderState.cortoLoader.set(loader)
        }
      } else if ((manifest as ManifestSchema).duration !== undefined) {
        const _manifest = manifest as ManifestSchema
        if (_manifest.duration <= 0 || _manifest.duration > 10800) {
          addError(entity, VolumetricComponent, 'INVALID_TRACK', `Invalid duration: ${_manifest.duration}`)
          return false
        }

        component.useVideoTextureForBaseColor = false
        component.time.duration = _manifest.duration
        const geometryTargets = Object.keys(_manifest.geometry.targets)
        if (geometryTargets.length === 0) {
          addError(entity, VolumetricComponent, 'GEOMETRY_ERROR', 'No geometry targets found')
          return false
        } else {
          geometryTargets.sort((a, b) => {
            const aData = _manifest.geometry.targets[a]
            const bData = _manifest.geometry.targets[b]

            // @ts-ignore
            const aSimplificationRatio = aData.settings.simplificationRatio ?? 1

            // @ts-ignore
            const bSimplificationRatio = bData.settings.simplificationRatio ?? 1

            const aMetric = aData.frameRate * aSimplificationRatio
            const bMetric = bData.frameRate * bSimplificationRatio
            return aMetric - bMetric
          })
          geometryTargets.forEach((target, index) => {
            _manifest.geometry.targets[target].priority = index
          })
          component.geometry.targets = geometryTargets
        }

        const geometryType = GeometryFormatToType[_manifest.geometry.targets[geometryTargets[0]].format]
        if (geometryType === undefined) {
          addError(entity, VolumetricComponent, 'GEOMETRY_ERROR', 'Invalid geometry format')
          return false
        }
        component.geometryType = geometryType

        const textureTypes = Object.keys(_manifest.texture) as TextureType[]
        if (textureTypes.length === 0) {
          addError(entity, VolumetricComponent, 'TEXTURE_ERROR', 'No texture types found')
          return false
        }
        if (!textureTypes.includes('baseColor')) {
          addError(entity, VolumetricComponent, 'TEXTURE_ERROR', 'No baseColor texture found')
          return false
        }

        component.textureInfo.textureTypes = textureTypes
        textureTypes.forEach((textureType) => {
          const targets = _manifest.texture[textureType]?.targets
          if (targets) {
            const targetKeys = Object.keys(targets)
            if (targetKeys.length === 0) {
              addError(
                entity,
                VolumetricComponent,
                'TEXTURE_ERROR',
                `No texture targets found for type: ${textureType}`
              )
              return false
            }

            const supportedTargets = getSortedSupportedTargets(targets)
            supportedTargets.forEach((target, index) => {
              targets[target].priority = index
            })

            component.texture[textureType] = {
              targets: supportedTargets,
              initialBufferLoaded: false,
              firstFrameLoaded: false,
              currentTarget: 0,
              userTarget: -1
            } as FrameTargetInfo

            volumetricMutables[entity].texture[textureType] = {
              bufferData: new BufferDataContainer(),
              buffer: new Map()
            }
          } else {
            addError(entity, VolumetricComponent, 'TEXTURE_ERROR', `No texture targets found for type: ${textureType}`)
            return false
          }
        })
      }
    } catch (err) {
      addError(entity, VolumetricComponent, 'UNKNOWN_ERROR', 'Error in reading the manifest')
      console.error('Error in reading the manifest: ', err)
      return false
    }

    clearErrors(entity, VolumetricComponent)
    console.log('Manifest read successfully')
    return manifest
  }

  useEffect(() => {
    if (!playlistComponent?.currentTrackUUID) {
      return
    }

    VolumetricComponent.cleanupTrack(entity)
    const track = playlistComponent.tracks.find((track) => track.uuid === playlistComponent.currentTrackUUID)
    if (!track || !track.src) {
      addError(entity, VolumetricComponent, 'INVALID_TRACK', 'Track source is empty')
      return
    }

    let trackSource = track.src
    if (track.src.endsWith('.mp4')) {
      trackSource = track.src.replace('.mp4', '.manifest')
    }

    fetch(trackSource)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Unable to load the manifest: ${resp.statusText}`)
        }

        return resp.json()
      })
      .then((data) => {
        const manifest = validateManifest(data)

        if (!manifest) {
          return
        }
        volumetricMutables[entity].manifest = manifest

        component.time.currentTime = component.time.start
        const firstGeometryTarget = component.geometryType !== GeometryType.Corto ? component.geometry.targets[0] : ''

        const hasNormals =
          component.geometryType === GeometryType.Unify &&
          !((manifest as ManifestSchema).geometry.targets[firstGeometryTarget].settings as UniformSolveEncodeOptions)
            .excludeNormals

        const overrideMaterialProperties =
          component.geometryType !== GeometryType.Corto ? (manifest as ManifestSchema).materialProperties : undefined

        volumetricMutables[entity].material = createMaterial(
          component.geometryType,
          component.useVideoTextureForBaseColor,
          hasNormals,
          component.textureInfo.textureTypes,
          // @ts-ignore
          overrideMaterialProperties
        )
        volumetricMutables[entity].mesh = new Mesh(
          new SphereGeometry(0.001, 32, 32) as BufferGeometry,
          volumetricMutables[entity].material!
        )

        volumetricMutables[entity].group.add(volumetricMutables[entity].mesh!)
        volumetricMutables[entity].mesh!.material = volumetricMutables[entity].material!
        volumetricMutables[entity].mesh!.material.needsUpdate = true

        const intervalId = setInterval(bufferLoop, 500)
        component.setIntervalId = intervalId as unknown as number
        bufferLoopIntervalId.current = intervalId as unknown as number
        console.log('Buffer loop started: ', intervalId)

        const mediaElement = getComponent(entity, MediaElementComponent)

        if (component.useVideoTextureForBaseColor) {
          const element = mediaElement.element as HTMLVideoElement
          if (component.useVideoTextureForBaseColor) {
            element.playsInline = true
            element.preload = 'auto'
            element.crossOrigin = 'anonymous'

            element.src = track.src.replace('.manifest', '.mp4')

            element.currentTime = component.time.currentTime / 1000
            element.load()

            element.addEventListener('ended', () => {
              if (playlistComponent) {
                PlaylistComponent.playNextTrack(entity)
              }
            })

            const setTexture = () => {
              const firstFrameLoaded = component.textureInfo.firstFrameLoaded

              if (!firstFrameLoaded['baseColor']) {
                const videoTexture = new Texture(element)
                videoTexture.generateMipmaps = false
                videoTexture.minFilter = LinearFilter
                videoTexture.magFilter = LinearFilter
                ;(videoTexture as any).isVideoTexture = true
                ;(videoTexture as any).update = () => {}
                videoTexture.colorSpace = SRGBColorSpace
                videoTexture.flipY = true

                volumetricMutables[entity].mesh!.material.uniforms['map'].value = videoTexture
                videoTexture.needsUpdate = true
                component.textureInfo.firstFrameLoaded['baseColor'] = true
                console.log('Video source set: ', element.src, element, videoTexture)
                element.removeEventListener('canplay', setTexture)
              }
            }

            element.addEventListener('canplay', setTexture)

            let recheckForBuffersIntervalId = -1

            const processFrame = (now: DOMHighResTimeStamp, metadata) => {
              const currentTimeInMS = metadata.mediaTime * 1000
              updateBufferedUntil(currentTimeInMS)

              component.time.currentTime = currentTimeInMS

              if (!VolumetricComponent.canPlayWithoutPause(entity)) {
                if (!element.paused) {
                  element.pause()
                  recheckForBuffersIntervalId = setInterval(() => {
                    if (VolumetricComponent.canPlayWithoutPause(entity) && recheckForBuffersIntervalId !== -1) {
                      clearInterval(recheckForBuffersIntervalId)
                      recheckForBuffersIntervalId = -1
                      if (!playlistComponent?.paused && component.geometry.initialBufferLoaded) {
                        element.play()
                      }
                    }
                  }, 500) as unknown as number
                }
              }

              const frameNo = Math.round(metadata.mediaTime * (manifest as OldManifestSchema).frameRate)
              const collection = volumetricMutables[entity].geometryBuffer.get('corto')
              if (collection && collection[frameNo]) {
                updateGeometry(currentTimeInMS)
                volumetricMutables[entity].material!.uniforms['map'].value
                if (volumetricMutables[entity].material!.uniforms['map'].value) {
                  volumetricMutables[entity].material!.uniforms['map'].value.needsUpdate = true
                }
              }

              element.requestVideoFrameCallback(processFrame)
            }

            element.requestVideoFrameCallback(processFrame)
          }
        }
      })
      .catch((err) => {
        addError(entity, VolumetricComponent, 'INVALID_TRACK', 'Error in loading the manifest')
        console.error(`Error in loading the manifest: ${track.src}: `, err)
      })
  }, [playlistComponent?.currentTrackUUID])

  useEffect(() => {
    console.log('Paused: ', component.paused)
    const now = Date.now()
    const mediaElement = getOptionalComponent(entity, MediaElementComponent)

    if (!playlistComponent || playlistComponent?.paused) {
      component.paused = true
      if (component.useVideoTextureForBaseColor && mediaElement && !mediaElement.element.paused) {
        mediaElement.element.pause()
      }

      const currentCheckpointAbsolute = component.time.checkpointAbsolute

      const currentTimeRelative =
        currentCheckpointAbsolute !== -1
          ? component.time.checkpointRelative + now - currentCheckpointAbsolute
          : component.time.start
      const newCheckpointAbsolute = now

      component.time.checkpointAbsolute = newCheckpointAbsolute
      component.time.checkpointRelative = currentTimeRelative
    } else {
      const currentTimeAbs = now
      component.time.checkpointAbsolute = currentTimeAbs
      if (
        component.useVideoTextureForBaseColor &&
        mediaElement &&
        mediaElement.element.paused &&
        mediaElement.element.src
      ) {
        mediaElement.element.play()
      }
      component.paused = false
    }
    setComponent(entity, VolumetricComponent)
  }, [playlistComponent?.paused])

  const updateGeometry = (currentTimeInMS: number) => {
    const geometryBuffer = volumetricMutables[entity].geometryBuffer
    const mesh = volumetricMutables[entity].mesh!

    const geometryType = component.geometryType
    const targetData =
      component.geometryType !== GeometryType.Corto
        ? (volumetricMutables[entity].manifest as ManifestSchema).geometry.targets
        : undefined
    const frameRate =
      component.geometryType === GeometryType.Corto
        ? (volumetricMutables[entity].manifest as OldManifestSchema).frameRate
        : undefined

    VolumetricComponent.adjustGeometryTarget(entity)
    const geometryTarget = component.geometry.targets[component.geometry.currentTarget]

    deleteUsedGeometryBuffers({
      geometryBuffer,
      currentTimeInMS: currentTimeInMS - 500,
      geometryType,
      targetData,
      frameRate,
      mesh,
      bufferData: volumetricMutables[entity].geometryBufferData
    })

    const result = getGeometry({
      geometryBuffer,
      currentTimeInMS,
      preferredTarget: geometryTarget,
      geometryType,
      targets: component.geometry.targets,
      ...(geometryType === GeometryType.Corto && { frameRate: frameRate as number }),
      ...(geometryType !== GeometryType.Corto && {
        targetData: targetData as Record<string, DRACOTarget | UniformSolveTarget>
      }),
      ...(geometryType === GeometryType.Unify && { keyframeName: 'keyframeA' })
    } as GetGeometryProps)

    if (!result) {
      if (geometryType !== GeometryType.Unify) {
        console.warn('Geometry frame not found at time: ', currentTimeInMS / 1000)
        return
      }
    } else {
      if (geometryType === GeometryType.Corto || geometryType === GeometryType.Draco) {
        const geometry = result.geometry as BufferGeometry
        if (mesh.geometry !== geometry) {
          mesh.geometry = geometry
          mesh.geometry.attributes['position'].needsUpdate = true
        }
      }
    }

    if (geometryType === GeometryType.Unify) {
      const keyframeAResult = result as
        | {
            geometry: KeyframeAttribute
            index: number
            target: string
          }
        | false
      const keyframeBResult = getGeometry({
        geometryBuffer: geometryBuffer,
        currentTimeInMS,
        preferredTarget: geometryTarget,
        geometryType,
        targets: component.geometry.targets,
        targetData: targetData as Record<string, DRACOTarget | UniformSolveTarget>,
        ...(geometryType === GeometryType.Unify && { keyframeName: 'keyframeB' })
      } as GetGeometryProps) as
        | {
            geometry: KeyframeAttribute
            index: number
            target: string
          }
        | false

      if (keyframeAResult) {
        if (mesh.geometry.attributes['keyframeAPosition'] !== keyframeAResult.geometry.position) {
          mesh.geometry.attributes['keyframeAPosition'] = keyframeAResult.geometry.position
          mesh.geometry.attributes['keyframeAPosition'].needsUpdate = true
        }
        if (
          keyframeAResult.geometry.normal &&
          mesh.geometry.attributes['keyframeANormal'] !== keyframeAResult.geometry.normal
        ) {
          mesh.geometry.attributes['keyframeANormal'] = keyframeAResult.geometry.normal
          mesh.geometry.attributes['keyframeANormal'].needsUpdate = true
        }
      }
      if (keyframeBResult) {
        if (mesh.geometry.attributes['keyframeBPosition'] !== keyframeBResult.geometry.position) {
          mesh.geometry.attributes['keyframeBPosition'] = keyframeBResult.geometry.position
          mesh.geometry.attributes['keyframeBPosition'].needsUpdate = true
        }
        if (
          keyframeBResult.geometry.normal &&
          mesh.geometry.attributes['keyframeBNormal'] !== keyframeBResult.geometry.normal
        ) {
          mesh.geometry.attributes['keyframeBNormal'] = keyframeBResult.geometry.normal
          mesh.geometry.attributes['keyframeBNormal'].needsUpdate = true
        }
      }

      if (!keyframeAResult && !keyframeBResult) {
        return
      } else if (!keyframeAResult && keyframeBResult) {
        mesh.material.uniforms.mixRatio.value = 1
      } else if (keyframeAResult && !keyframeBResult) {
        mesh.material.uniforms.mixRatio.value = 0
      } else if (keyframeAResult && keyframeBResult) {
        const keyframeATimeInMS = (keyframeAResult.index * 1000) / targetData![keyframeAResult.target].frameRate
        const keyframeBTimeInMS = (keyframeBResult.index * 1000) / targetData![keyframeBResult.target].frameRate

        const distanceFromA = Math.abs(currentTimeInMS - keyframeATimeInMS)
        const distanceFromB = Math.abs(currentTimeInMS - keyframeBTimeInMS)

        const mixRatio = distanceFromA + distanceFromB > 0 ? distanceFromA / (distanceFromA + distanceFromB) : 0.5

        mesh.material.uniforms.mixRatio.value = mixRatio
      }
    }
  }

  const updateTexture = (currentTimeInMS: number) => {
    const textureTypes = component.textureInfo.textureTypes
    const manifest = volumetricMutables[entity].manifest as ManifestSchema
    const material = volumetricMutables[entity].material!

    textureTypes.forEach((textureType) => {
      const textureInfo = component.texture[textureType]
      const targetData = manifest.texture[textureType]!.targets
      const textureBufferInfo = volumetricMutables[entity].texture[textureType]

      if (textureInfo && textureBufferInfo) {
        VolumetricComponent.adjustTextureTarget(entity, textureType)
        deleteUsedTextureBuffers({
          textureBuffer: textureBufferInfo.buffer,
          currentTimeInMS: currentTimeInMS - 500,
          bufferData: textureBufferInfo.bufferData,
          textureType,
          targetData
        })

        const targets = textureInfo.targets
        const preferredTarget = textureInfo.targets[textureInfo.currentTarget]
        const result = getTexture({
          textureBuffer: textureBufferInfo.buffer,
          currentTimeInMS,
          preferredTarget,
          targets,
          textureType,
          // @ts-ignore
          targetData
        })

        if (!result) {
          console.warn(`Texture frame not found at time: ${currentTimeInMS / 1000}`)
          console.log(textureBufferInfo.buffer, textureInfo)
          return
        }
        const textureKey = textureTypeToUniformKey[textureType]
        const tranformKey = `${textureKey}Transform`

        if (material.uniforms[textureKey].value !== result.texture) {
          result.texture.repeat.set(repeat.current.x, repeat.current.y)
          result.texture.offset.set(offset.current.x, offset.current.y)
          result.texture.updateMatrix()
          result.texture.matrixAutoUpdate = false
          if (textureKey in material.uniforms) {
            material.uniforms[textureKey].value = result.texture
          } else {
            material.uniforms[textureKey] = {
              value: result.texture
            }
          }
          material.uniforms[textureKey].value.needsUpdate = true

          if (tranformKey in material.uniforms) {
            material.uniforms[tranformKey].value.copy(result.texture.matrix)
          } else {
            material.uniforms[tranformKey] = {
              value: result.texture.matrix
            }
          }
        }
      }
    })
  }

  const updateBufferedUntil = (currentTimeInMS: number) => {
    let bufferedUntil = Number.MAX_VALUE
    const geometryBufferData = volumetricMutables[entity].geometryBufferData
    bufferedUntil = Math.min(
      bufferedUntil,
      geometryBufferData.getBufferedUntil((currentTimeInMS * TIME_UNIT_MULTIPLIER) / 1000)
    )

    if (!component.useVideoTextureForBaseColor) {
      const textureTypes = component.textureInfo.textureTypes
      for (const textureType of textureTypes) {
        const textureInfo = component.texture[textureType]
        const textureBufferInfo = volumetricMutables[entity].texture[textureType]
        if (textureInfo && textureBufferInfo) {
          const textureBufferData = textureBufferInfo.bufferData
          bufferedUntil = Math.min(
            bufferedUntil,
            textureBufferData.getBufferedUntil((currentTimeInMS * TIME_UNIT_MULTIPLIER) / 1000)
          )
        }
      }
    }

    component.time.bufferedUntil = (bufferedUntil * 1000) / TIME_UNIT_MULTIPLIER
  }

  useExecute(
    () => {
      const playlistComponent = getOptionalComponent(entity, PlaylistComponent)
      if (!playlistComponent) {
        return
      }

      if (component.geometryType === GeometryType.Corto && component.useVideoTextureForBaseColor) {
        return
      }

      if (playlistComponent.paused) {
        return
      }

      if (!playlistComponent.currentTrackUUID) {
        return
      }

      const now = Date.now()

      const __currentTime =
        component.paused || playlistComponent.paused || component.notEnoughBuffers
          ? component.time.checkpointRelative
          : component.time.checkpointRelative + now - component.time.checkpointAbsolute

      if (__currentTime > component.time.duration * 1000) {
        console.log('CurrentTime: ', __currentTime, ' Duration: ', component.time.duration * 1000)
        console.log('Track ended')
        PlaylistComponent.playNextTrack(entity)
        return
      }

      updateBufferedUntil(__currentTime)

      if (component.checkForEnoughBuffers) {
        if (!VolumetricComponent.canPlayWithoutPause(entity)) {
          if (component.notEnoughBuffers) {
            return
          } else {
            component.notEnoughBuffers = true
            const currentCheckpointAbsolute = component.time.checkpointAbsolute

            const currentTimeRelative =
              currentCheckpointAbsolute !== -1
                ? component.time.checkpointRelative + now - currentCheckpointAbsolute
                : component.time.start
            const newCheckpointAbsolute = now

            component.time.checkpointAbsolute = newCheckpointAbsolute
            component.time.checkpointRelative = currentTimeRelative
            return
          }
        } else {
          if (component.notEnoughBuffers) {
            component.notEnoughBuffers = false
            const currentTimeAbs = now
            component.time.checkpointAbsolute = currentTimeAbs
          } else {
            // Continue
          }
        }
      }

      const currentTime = __currentTime
      component.time.currentTime = currentTime

      updateGeometry(__currentTime)

      if (!component.useVideoTextureForBaseColor) {
        updateTexture(__currentTime)
      }
    },
    {
      with: AnimationSystemGroup
    }
  )

  return null
}
