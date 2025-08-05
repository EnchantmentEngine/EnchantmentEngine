import { useEffect } from 'react'

import {
  Entity,
  EntityID,
  EntityTreeComponent,
  EntityUUIDPair,
  Static,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  removeEntity,
  useEntityContext,
  useQueryBySource
} from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useHookstate } from '@ir-engine/hyperflux'
import { defineMaterialPlugin } from '@ir-engine/spatial'
import { removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/materials/MaterialComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import React from 'react'
import { InstancedMesh } from 'three'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { InstancingComponent } from './InstancingComponent'

export type VariantLevel = {
  src: string
  metadata: Record<string, any>
}

export const Heuristic = {
  DISTANCE: 'DISTANCE',
  MANUAL: 'MANUAL',
  DEVICE: 'DEVICE'
} as const

export type HeuristicType = (typeof Heuristic)[keyof typeof Heuristic]

export const Devices = {
  DESKTOP: 'DESKTOP',
  MOBILE: 'MOBILE',
  XR: 'XR'
} as const

export type DevicesType = (typeof Devices)[keyof typeof Devices]

export const distanceMetadataSchema = S.Object({
  minDistance: S.Union([S.Number(), S.Undefined()], { default: undefined }),
  maxDistance: S.Union([S.Number(), S.Undefined()], { default: undefined })
})

export const deviceMetadataSchema = S.Object({
  device: S.Enum(Devices, {
    $comment: "A string enum, ie. one of the following values: 'DESKTOP', 'MOBILE', 'XR'",
    default: Devices.DESKTOP
  })
})

export type VariantMetadata = Static<typeof distanceMetadataSchema> | Static<typeof deviceMetadataSchema>

export const VariantComponent = defineComponent({
  name: 'VariantComponent',
  jsonID: 'EE_variant',

  schema: S.Object({
    levels: S.Array(
      S.Object({
        src: S.String(),
        metadata: S.Union([distanceMetadataSchema, deviceMetadataSchema])
      })
    ),
    heuristic: S.Enum(Heuristic, {
      $comment: "A string enum, ie. one of the following values: 'DISTANCE', 'MANUAL', 'DEVICE'",
      default: Heuristic.MANUAL
    }),
    currentLevel: S.Number({ default: 0, serialized: false })
  }),

  setDistanceLevel: (entity: Entity) => {
    const variantComponent = getComponent(entity, VariantComponent)
    if (variantComponent.heuristic !== Heuristic.DISTANCE) return
    const distance = DistanceFromCameraComponent.squaredDistance[entity]
    for (let i = 0; i < variantComponent.levels.length; i++) {
      const level = variantComponent.levels[i]
      if ([level.metadata['minDistance'], level.metadata['maxDistance']].includes(undefined)) continue
      const minDistance = Math.pow(level.metadata['minDistance'], 2)
      const maxDistance = Math.pow(level.metadata['maxDistance'], 2)
      if (minDistance <= distance && distance <= maxDistance) {
        setComponent(entity, VariantComponent, { currentLevel: i })
        break
      }
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const variantComponent = useComponent(entity, VariantComponent)
    const instancingComponent = useOptionalComponent(entity, InstancingComponent)
    const childEntity = useHookstate(UndefinedEntity)

    useEffect(() => {
      if (instancingComponent) return
      const _childEntity = createEntity()
      setComponent(_childEntity, UUIDComponent, {
        entitySourceID: UUIDComponent.getAsSourceID(entity),
        entityID: 'variant-child' as EntityID
      })
      setComponent(_childEntity, NameComponent, 'Variant Child w/ GLTFComponent')
      setComponent(_childEntity, TransformComponent)
      setComponent(_childEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(_childEntity, VisibleComponent)
      setComponent(_childEntity, GLTFComponent, { src: '' })
      childEntity.set(_childEntity)

      return () => {
        childEntity.set(UndefinedEntity)
        removeEntity(_childEntity)
      }
    }, [instancingComponent])

    useEffect(() => {
      if (!variantComponent.levels.length) return

      const heuristic = variantComponent.heuristic
      if (heuristic === Heuristic.DEVICE) {
        const targetDevice = isMobile || isMobileXRHeadset ? Devices.MOBILE : Devices.DESKTOP
        const levelIndex = variantComponent.levels.findIndex((level) => level.metadata['device'] === targetDevice)
        if (levelIndex < 0) {
          console.warn('VariantComponent: No asset found for target device')
          return
        }
        setComponent(entity, VariantComponent, { currentLevel: levelIndex })
      } else if (heuristic === Heuristic.DISTANCE) {
        setComponent(entity, DistanceFromCameraComponent)
        VariantComponent.setDistanceLevel(entity)
      }
    }, [variantComponent.heuristic, variantComponent.levels])

    useEffect(() => {
      if (!variantComponent.levels.length || !childEntity.value) return

      const currentLevel = variantComponent.currentLevel
      const src = variantComponent.levels[currentLevel].src
      if (!src) return
      setComponent(childEntity.value, GLTFComponent, { src: src })
    }, [childEntity, variantComponent.currentLevel, variantComponent.levels])

    useEffect(() => {
      const levels = variantComponent.levels.length
      for (let level = 0; level < levels; level++) {
        setCallback(entity, `variantLevel${level}`, () => {
          setComponent(entity, VariantComponent, { currentLevel: level })
        })
      }
      return () => {
        for (let level = 0; level < levels; level++) {
          removeCallback(entity, `variantLevel${level}`)
        }
      }
    }, [variantComponent.levels.length])

    if (!instancingComponent) return null

    return <InstancingVariantReactor entity={entity} />
  }
})

export const InstanceVariantMaterialPluginComponent = defineMaterialPlugin({
  name: 'InstanceVariantMaterialPluginComponent',
  jsonID: 'IR_instance_variant_material',
  uniforms: S.Object({
    minDistance: S.Number(),
    maxDistance: S.Number()
  }),
  onApply: (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      'uniform float opacity;',
      `uniform float opacity;
uniform float maxDistance;
uniform float minDistance;`
    )

    // Calculate the camera distance from the geometry
    // Discard fragments outside the minDistance and maxDistance range
    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `void main() {
  float cameraDistance = length(vViewPosition);
  if (cameraDistance <= minDistance || cameraDistance >= maxDistance) {
    discard;
  }`
    )
  }
})

const InstancingVariantReactor = (props: { entity: Entity }) => {
  const variantComponent = useComponent(props.entity, VariantComponent)

  return (
    <>
      {variantComponent.levels.map((level, index) => (
        <VariantInstanceLoadReactor entity={props.entity} level={index} key={index} />
      ))}
    </>
  )
}

const VariantInstanceLoadReactor = (props: { entity: Entity; level: number }) => {
  const variantComponent = useComponent(props.entity, VariantComponent)

  const level = variantComponent.levels[props.level]

  const modelEntity = useHookstate(() => {
    const entity = createEntity()
    setComponent(entity, UUIDComponent, {
      entitySourceID: getComponent(props.entity, UUIDComponent).entitySourceID,
      entityID: 'LOD-' + props.level
    } as EntityUUIDPair)
    setComponent(entity, NameComponent, getComponent(props.entity, NameComponent) + ' LOD ' + props.level)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity: props.entity })
    setComponent(entity, VisibleComponent)
    setComponent(entity, GLTFComponent, { src: level.src })
    return entity
  }).value

  useEffect(() => {
    return () => {
      removeEntity(modelEntity)
    }
  }, [])

  const childMeshEntities = useQueryBySource(modelEntity, [MeshComponent])

  return (
    <>
      {childMeshEntities.map((meshEntity) => (
        <ChildMeshReactor
          variantEntity={props.entity}
          modelEntity={modelEntity}
          meshEntity={meshEntity}
          level={props.level}
          key={meshEntity}
        />
      ))}
    </>
  )
}

const ChildMeshReactor = (props: { variantEntity: Entity; modelEntity: Entity; meshEntity: Entity; level: number }) => {
  useEffect(() => {
    const level = getComponent(props.variantEntity, VariantComponent).levels[props.level]

    const minDistance = level.metadata['minDistance']
    const maxDistance = level.metadata['maxDistance']
    const mesh = getComponent(props.meshEntity, MeshComponent)

    // debug
    // mesh.material = new MeshStandardMaterial({
    //   color: props.level === 0 ? 0xff0000 : props.level === 1 ? 0x00ff00 : 0x0000ff
    // })

    const instancingComponent = getComponent(props.variantEntity, InstancingComponent)

    //convert to instanced mesh, using existing instance matrix
    const instancedMesh =
      mesh instanceof InstancedMesh
        ? mesh
        : new InstancedMesh(mesh.geometry.clone(), mesh.material, instancingComponent.instanceMatrix.count)
    instancedMesh.instanceMatrix.copy(instancingComponent.instanceMatrix)
    instancedMesh.frustumCulled = false

    removeComponent(props.meshEntity, MeshComponent)
    setComponent(props.meshEntity, MeshComponent, instancedMesh)
  }, [])

  const materialEntities = useComponent(props.meshEntity, MaterialInstanceComponent).entities
  const level = useComponent(props.variantEntity, VariantComponent).levels[props.level]

  useEffect(() => {
    const entities = [...materialEntities]
    for (const materialEntity of entities) {
      setComponent(materialEntity, InstanceVariantMaterialPluginComponent)
    }
    return () => {
      for (const materialEntity of entities) {
        removeComponent(materialEntity, InstanceVariantMaterialPluginComponent)
      }
    }
  }, [materialEntities])

  useEffect(() => {
    const minDistance = level.metadata['minDistance']
    const maxDistance = level.metadata['maxDistance']
    for (const materialEntity of materialEntities) {
      setComponent(materialEntity, InstanceVariantMaterialPluginComponent, {
        minDistance: minDistance,
        maxDistance: maxDistance
      })
    }
  }, [materialEntities, level.metadata['minDistance'], level.metadata['maxDistance']])

  return null
}

/** @todo needs to be re-implemented */
// const buildBudgetVariantMetadata = (
//   level: VariantLevel,
//   signal: AbortSignal,
//   callback: (maxTextureSize: number, vertexCount: number) => void
// ) => {
//   const src = level.src
//   const resources = getState(ResourceState).resources
//   if (resources[src] && resources[src].status == ResourceStatus.Loaded) {
//     const metadata = getState(ResourceState).resources[src].metadata as { verts: number; textureWidths: number[] }
//     const maxTextureSize = metadata.textureWidths ? Math.max(...metadata.textureWidths) : 0
//     const verts = metadata.verts
//     callback(maxTextureSize, verts)
//     return
//   }

//   loadResource(
//     src,
//     ResourceType.GLTF,
//     UndefinedEntity,
//     () => {
//       const metadata = getState(ResourceState).resources[src].metadata as { verts: number; textureWidths: number[] }
//       const maxTextureSize = metadata.textureWidths ? Math.max(...metadata.textureWidths) : 0
//       const verts = metadata.verts
//       callback(maxTextureSize, verts)
//       ResourceState.unload(src, UndefinedEntity)
//     },
//     () => {},
//     (error) => {
//       console.warn(
//         `VariantNodeEditor:buildBudgetVariantMetadata: error loading ${src} to build variant metadata`,
//         error
//       )
//       callback(0, 0)
//     },
//     signal
//   )
// }
