import React, { useEffect } from 'react'

import {
  defineSystem,
  Entity,
  getOptionalComponent,
  haveCommonAncestor,
  PresentationSystemGroup,
  QueryReactor,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useComponent,
  useOptionalComponent,
  useQuery,
  useQueryBySource,
  UUIDComponent
} from '@ir-engine/ecs'

import { State } from '@ir-engine/hyperflux'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
  MeshStandardMaterial,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  Vector3
} from 'three'
import { EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { BoxProjectionPlugin, EnvMapComponent } from '../components/EnvmapComponent'
import { getRGBArray, loadCubeMapTexture } from '../constants/Util'
import { addError, removeError } from '../functions/ErrorFunctions'

const EnvMapReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const envMapComponent = useComponent(entity, EnvMapComponent).type
  const materialComponentEntities = useQueryBySource(entity, [MaterialStateComponent])
  return (
    <>
      {materialComponentEntities.map((materialComponentEntity, index) => {
        switch (envMapComponent) {
          case 'Skybox':
            return (
              <EnvMapSkyboxReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Cubemap':
            return (
              <EnvMapCubemapReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Equirectangular':
            return (
              <EnvMapEquirectangularReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Color':
            return (
              <EnvMapColorReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
          case 'Bake':
            return (
              <EnvMapBakeReactor
                key={envMapComponent + '-' + materialComponentEntity + '-' + index}
                entity={materialComponentEntity}
                rootEntity={entity}
              />
            )
        }
      })}
    </>
  )
}

const IntensityReactor = (props: { rootEntity: Entity; entity: Entity }) => {
  const { rootEntity, entity } = props
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as
    | State<MeshStandardMaterial>
    | undefined
  useEffect(() => {
    if (!materialState) return
    const material = materialState.value as MeshStandardMaterial
    material.envMapIntensity = envMapComponent.envMapIntensity
  }, [envMapComponent.envMapIntensity, materialState])
  return null
}

// circumvent threejs bug with envmap uniforms
const disallowedMaterials = new Set(['MeshMatcapMaterial', 'MeshToonMaterial'])

const EnvMapSkyboxReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const backgroundQuery = useQuery([BackgroundComponent])
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as
    | MeshStandardMaterial
    | undefined
  useEffect(() => {
    return () => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
    }
  }, [])
  let i = 0
  for (i; i < backgroundQuery.length; i++) if (haveCommonAncestor(entity, backgroundQuery[i])) break
  const backgroundComponent = useOptionalComponent(backgroundQuery[i], BackgroundComponent)
  useEffect(() => {
    if (!materialState || !backgroundComponent) return

    // threejs freaks out if matcap materials are passed in envmap related values
    if (disallowedMaterials.has(materialState.type)) return

    const material = materialState as MeshStandardMaterial
    material.envMap = backgroundComponent as Texture
    ResourceState.addEntityResource(entity, material.envMap!)
  }, [backgroundComponent, materialState])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapCubemapReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as
    | MeshStandardMaterial
    | undefined
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  useEffect(() => {
    return () => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
    }
  }, [])
  useEffect(() => {
    if (!materialState || disallowedMaterials.has(materialState.type)) return
    loadCubeMapTexture(
      envMapComponent.envMapCubemapURL,
      (texture: CubeTexture | undefined) => {
        if (texture) {
          texture.mapping = CubeReflectionMapping
          texture.colorSpace = SRGBColorSpace
          const material = materialState as MeshStandardMaterial
          material.envMap = texture
          removeError(entity, EnvMapComponent, 'MISSING_FILE')
        }
      },
      undefined,
      (_) => {
        const material = materialState as MeshStandardMaterial
        material.envMap = null
        addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
      }
    )
  }, [envMapComponent.envMapCubemapURL, materialState])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapEquirectangularReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as MeshStandardMaterial

  const [envMapTexture, error] = useTexture(envMapComponent.envMapSourceURL, entity)

  useEffect(() => {
    return () => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent) as MeshStandardMaterial | undefined
      if (materialComponent?.envMap) {
        const material = materialComponent as MeshStandardMaterial
        material.envMap = null
      }
    }
  }, [])

  useEffect(() => {
    if (disallowedMaterials.has(materialState!.type)) return

    if (!envMapTexture || !envMapTexture.isTexture) return
    envMapTexture.mapping = EquirectangularReflectionMapping
    const material = materialState as MeshStandardMaterial
    material.envMap = envMapTexture
  }, [envMapTexture, materialState])

  useEffect(() => {
    if (!error) return
    const material = materialState as MeshStandardMaterial
    material.envMap = null
    addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapBakeReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as MeshStandardMaterial
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const bakeEntity =
    UUIDComponent.useEntityFromSameSourceByID(props.rootEntity, envMapComponent.envMapSourceEntityUUID) ??
    UndefinedEntity
  const bakeComponent = useOptionalComponent(bakeEntity, EnvMapBakeComponent)
  const transformComponent = useOptionalComponent(bakeEntity, TransformComponent)

  const [envMaptexture, error] = useTexture(bakeComponent?.envMapOrigin ?? '', bakeEntity)

  useEffect(() => {
    return () => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
      removeComponent(entity, BoxProjectionPlugin)
    }
  }, [])

  useEffect(() => {
    if (!materialState || disallowedMaterials.has(materialState.type)) return

    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    const material = materialState as MeshStandardMaterial
    material.envMap = texture
  }, [envMaptexture, envMapComponent.type, materialState])

  useEffect(() => {
    if (!bakeComponent) return

    if (!bakeComponent.boxProjection) {
      removeComponent(entity, BoxProjectionPlugin)
      return
    }

    const entityPosition = transformComponent?.position.clone() || new Vector3(0, 0, 0)
    const cubeMapPos = entityPosition.clone().add(bakeComponent.bakePositionOffset)
    setComponent(entity, BoxProjectionPlugin, {
      cubeMapPos: cubeMapPos,
      cubeMapSize: bakeComponent.bakeScale
    })
  }, [
    bakeComponent?.boxProjection,
    bakeComponent?.envMapOrigin,
    bakeComponent?.bakePositionOffset,
    bakeComponent?.bakeScale,
    transformComponent?.position
  ])

  useEffect(() => {
    if (!error) return
    addError(bakeEntity, EnvMapComponent, 'MISSING_FILE', 'EnvMap bake texture not found!')
  }, [error])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const tempColor = new Color(0, 0, 1)
const EnvMapColorReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const materialState = useOptionalComponent(entity, MaterialStateComponent)?.material as MeshStandardMaterial
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)

  useEffect(() => {
    return () => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent) as
        | State<MeshStandardMaterial>
        | undefined
      if (materialComponent?.envMap?.value) {
        const material = materialComponent.value as MeshStandardMaterial
        material.envMap = null
      }
    }
  }, [])

  useEffect(() => {
    if (!materialState || disallowedMaterials.has(materialState.type)) return

    const color = envMapComponent.envMapSourceColor ?? tempColor
    const resolution = 64 // Min value required
    /** @todo track in resource manager */
    const texture = new DataTexture(getRGBArray(new Color(color)), resolution, resolution, RGBAFormat)
    texture.needsUpdate = true
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    const material = materialState as MeshStandardMaterial
    material.envMap = texture
    return () => {
      texture.dispose()
    }
  }, [envMapComponent.envMapSourceColor, materialState, envMapComponent.type])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => <QueryReactor Components={[EnvMapComponent]} ChildEntityReactor={EnvMapReactor} />
})
