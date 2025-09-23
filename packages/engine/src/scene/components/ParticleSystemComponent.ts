import { useEffect } from 'react'
import { Blending, DoubleSide, Matrix4, MeshBasicMaterial, Object3D, Vector3 } from 'three'
import { BatchedRenderer, Behavior, BehaviorFromJSON, ParticleSystem } from 'three.quarks'

import {
  Entity,
  EntityTreeComponent,
  SourceID,
  UUIDComponent,
  createEntity,
  getAncestorWithComponents,
  getChildrenWithComponents,
  removeEntity,
  useEntityContext
} from '@ir-engine/ecs'
import {
  defineComponent,
  entityExists,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useGLTFComponent } from '@ir-engine/engine/src/assets/functions/useGLTFComponent'
import { NO_PROXY, Schema, getMutableState, none, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Vector3_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { getRendererEntity, useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'
import { AssetType, FileToAssetType } from '@ir-engine/spatial/src/resources/AssetType'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import {
  BehaviorJSON,
  DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
  ExpandedSystemJSON,
  ParticleState,
  ParticleSystemMetadata,
  ParticleSystemRendererInstance
} from '../types/ParticleSystemTypes'
import { mergeGeometries } from '../util/meshUtils'

const createBatchedRenderer = (entity: Entity) => {
  const rendererEntity = getRendererEntity(entity)
  const particleState = getMutableState(ParticleState)
  if (particleState.renderers.value[rendererEntity]) {
    const instance = particleState.renderers[rendererEntity].get(NO_PROXY) as ParticleSystemRendererInstance
    instance.instanceCount++
    return instance
  } else {
    const renderer = new BatchedRenderer()
    const particleRendererEntity = createEntity()
    setComponent(particleRendererEntity, VisibleComponent)
    setComponent(particleRendererEntity, NameComponent, 'Particle Renderer')
    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    const uuidComponent = getOptionalComponent(sceneEntity, UUIDComponent)

    setComponent(particleRendererEntity, UUIDComponent, {
      entitySourceID: uuidComponent?.entitySourceID ?? ('root' as SourceID),
      entityID: UUIDComponent.generateUUID()
    })

    setComponent(particleRendererEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    renderer.preserveChildren = true
    renderer.parent = {
      type: 'Scene',
      matrix: new Matrix4().identity(),
      matrixWorld: new Matrix4().identity(),
      remove: () => {},
      removeFromParent: () => {}
    } as Object3D
    renderer.matrixWorld = new Matrix4().identity()
    setComponent(particleRendererEntity, ObjectComponent, renderer)
    const instance: ParticleSystemRendererInstance = {
      renderer,
      rendererEntity: particleRendererEntity,
      instanceCount: 1
    }
    particleState.renderers[rendererEntity].set(instance)
    return instance
  }
}

const removeBatchedRenderer = (rendererEntity: Entity) => {
  const particleState = getMutableState(ParticleState)
  if (particleState.renderers[rendererEntity].value) {
    const instance = particleState.renderers[rendererEntity].get(NO_PROXY) as ParticleSystemRendererInstance
    if (instance.instanceCount <= 1) {
      removeComponent(instance.rendererEntity, ObjectComponent)
      for (const batch of instance.renderer.batches) {
        batch.geometry.dispose()
        batch.dispose()
      }
      removeEntity(instance.rendererEntity)
      particleState.renderers[rendererEntity].set(none)
    } else {
      instance.instanceCount--
    }
  }
}

export const ParticleSystemComponent = defineComponent({
  name: 'ParticleSystemComponent',
  jsonID: 'EE_particle_system',

  schema: Schema.Object({
    systemParameters: DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
    behaviorParameters: Schema.Array(Schema.Type<BehaviorJSON>()),
    behaviors: Schema.Optional(Schema.Array(Schema.Type<Behavior>()), { serialized: false }),
    system: Schema.Type<ParticleSystem>({ serialized: false } as any)
  }),

  onSet: (entity, component, json) => {
    if (json?.systemParameters)
      component.systemParameters = {
        ...JSON.parse(JSON.stringify(component.systemParameters)),
        ...json.systemParameters
      }

    if (json?.behaviorParameters) component.behaviorParameters = JSON.parse(JSON.stringify(json.behaviorParameters))
  },

  toJSON: (component) => ({
    systemParameters: JSON.parse(JSON.stringify(component.systemParameters)),
    behaviorParameters: JSON.parse(JSON.stringify(component.behaviorParameters))
  }),
  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, ParticleSystemComponent)
    const metadata = useHookstate({ textures: {}, geometries: {}, materials: {} } as ParticleSystemMetadata)
    // for particle meshes
    const geoDependencyEntity = useGLTFComponent(component.systemParameters.instancingGeometry, entity)

    /** @todo track this in resource manager */
    const dudMaterial = useHookstate(
      () =>
        new MeshBasicMaterial({
          color: 0xff0000,
          transparent: component.systemParameters.transparent ?? true,
          blending: component.systemParameters.blending as Blending,
          side: DoubleSide
        })
    ).value as MeshBasicMaterial

    useEffect(() => {
      // add dud material
      component.systemParameters.material = 'dud'
      metadata.materials.nested('dud').set(dudMaterial)
    }, [])

    // for particle meshes
    useEffect(() => {
      if (!geoDependencyEntity) return
      const meshEntity = getChildrenWithComponents(geoDependencyEntity, [MeshComponent])[0]
      if (!meshEntity) return

      const mesh = getComponent(meshEntity, MeshComponent)
      const scaledGeometry = mesh.geometry.clone()
      const scale = getNestedScale(mesh)
      scaledGeometry.scale(scale.x, scale.y, scale.z)
      if (scaledGeometry) {
        const geometryKey = component.systemParameters.instancingGeometry
        metadata.geometries.nested(geometryKey).set(scaledGeometry)

        return () => {
          // Check if metadata state is still valid before cleanup
          if (metadata.geometries.value && geometryKey) {
            metadata.geometries.nested(geometryKey).set(none)
          }
        }
      }
    }, [geoDependencyEntity])

    // for mesh shape emitters
    const shapeMeshEntity = useGLTFComponent(component.systemParameters.shape.mesh ?? '', entity)

    // for mesh shape emitters
    useEffect(() => {
      if (!shapeMeshEntity) return
      const meshEntities = getChildrenWithComponents(shapeMeshEntity, [MeshComponent])
      if (!meshEntities.length) return

      const meshes = meshEntities.map((entity) => getComponent(entity, MeshComponent))

      const geometries = meshes.map((mesh) => {
        const scaledGeometry = mesh.geometry.clone()
        const scale = getNestedScale(mesh)
        scaledGeometry.scale(scale.x, scale.y, scale.z)
        return scaledGeometry
      })
      const mergedGeometry = mergeGeometries(geometries)

      if (mergedGeometry) {
        const shapeMeshKey = component.systemParameters.shape.mesh!
        component.systemParameters.shape.geometry = shapeMeshKey
        metadata.geometries.nested(shapeMeshKey).set(mergedGeometry)

        return () => {
          // Check if metadata state is still valid before cleanup
          if (metadata.geometries.value && shapeMeshKey) {
            metadata.geometries.nested(shapeMeshKey).set(none)
          }
        }
      }
    }, [shapeMeshEntity])

    const [texture] = useTexture(component.systemParameters.texture!, entity, (url) => {
      if (!entityExists(entity)) return
      // Check if metadata state is still valid before cleanup
      if (metadata.textures.value && url) {
        metadata.textures.nested(url).set(none)
      }

      dudMaterial.map = null
    })

    useEffect(() => {
      if (!texture) return
      metadata.textures.nested(component.systemParameters.texture!).set(texture)
      dudMaterial.map = texture
      dudMaterial.needsUpdate = true
    }, [texture])

    const doLoadEmissionGeo =
      component.systemParameters.shape.type === 'mesh_surface' &&
      FileToAssetType(component.systemParameters.shape.mesh ?? '') === AssetType.Model

    const doLoadInstancingGeo =
      component.systemParameters.instancingGeometry &&
      FileToAssetType(component.systemParameters.instancingGeometry) === AssetType.Model

    const doLoadTexture =
      component.systemParameters.texture && FileToAssetType(component.systemParameters.texture) === AssetType.Image

    const loadedEmissionGeo = !!shapeMeshEntity || !doLoadEmissionGeo
    const loadedInstanceGeo = !!geoDependencyEntity || !doLoadInstancingGeo
    const loadedTexture = !!texture || !doLoadTexture

    const dependenciesLoaded = loadedEmissionGeo && loadedInstanceGeo && loadedTexture

    const rendererEntity = useRendererEntity(entity)
    const visible = useHasComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!dependenciesLoaded || !visible || !rendererEntity) return

      const rendererInstance = createBatchedRenderer(entity)
      const renderer = rendererInstance.renderer

      const systemParameters = JSON.parse(JSON.stringify(component.systemParameters)) as ExpandedSystemJSON

      if (systemParameters.blending !== undefined) {
        const materialKey = systemParameters.material || 'particle_material'

        const particleMaterial = new MeshBasicMaterial({
          color: systemParameters.startColor.color,
          transparent: systemParameters.transparent,
          blending: systemParameters.blending as Blending
        })

        metadata.materials.nested(materialKey).set(particleMaterial)
        systemParameters.material = materialKey
      }

      const system = ParticleSystem.fromJSON(systemParameters, metadata.get(NO_PROXY) as ParticleSystemMetadata, {})
      renderer.addSystem(system)
      const behaviors = component.behaviorParameters.map((behaviorJSON) => {
        const behavior = BehaviorFromJSON(behaviorJSON, system)!
        system.addBehavior(behavior)
        return behavior
      })
      component.behaviors = behaviors

      const emitterAsObj3D = system.emitter
      emitterAsObj3D.parent = renderer
      setComponent(entity, EntityTreeComponent, { parentEntity: renderer.entity })
      setComponent(entity, ObjectComponent, emitterAsObj3D)
      // quarks expects the parent property on the emitter object to be the renderer, otherwise it will dispose the emitter
      Object.defineProperties(emitterAsObj3D, {
        parent: {
          get() {
            return renderer
          },
          set(value) {
            if (value != undefined) throw new Error('Cannot set parent of proxified object')
            console.warn('Setting to nil value is not supported ObjectComponent.ts')
          }
        }
      })
      const transformComponent = getComponent(entity, TransformComponent)
      emitterAsObj3D.matrix = transformComponent.matrix
      component.system = system

      return () => {
        const index = renderer.systemToBatchIndex.get(system)
        if (typeof index !== 'undefined') {
          renderer.deleteSystem(system)
          renderer.systemToBatchIndex.clear()
          for (let i = 0; i < renderer.batches.length; i++) {
            for (const system of renderer.batches[i].systems) {
              renderer.systemToBatchIndex.set(system, i)
            }
          }
        }
        removeComponent(entity, ObjectComponent)
        if (entityExists(entity)) setComponent(entity, ObjectComponent, new Object3D())

        system.dispose()
        emitterAsObj3D.dispose()
        if (entityExists(entity) && rendererEntity && entityExists(rendererEntity)) {
          removeBatchedRenderer(rendererEntity)
        }
      }
    }, [component.systemParameters, component.behaviorParameters, dependenciesLoaded, rendererEntity, visible])

    return null
  }
})

function getNestedScale(node: Object3D): Vector3 {
  const scale = node.scale?.clone() ?? Vector3_One

  if (node.parent) {
    scale.multiply(getNestedScale(node.parent))
  }

  return scale
}
