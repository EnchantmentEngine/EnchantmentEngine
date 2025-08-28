import React, { useEffect } from 'react'

import {
  defineSystem,
  Entity,
  entityExists,
  hasComponent,
  haveCommonAncestor,
  PresentationSystemGroup,
  QueryReactor,
  removeComponent,
  setComponent,
  UndefinedEntity,
  useComponent,
  useHasComponent,
  useOptionalComponent,
  useQuery,
  useQueryBySource,
  UUIDComponent
} from '@ir-engine/ecs'

import { MaterialComponent } from '@ir-engine/spatial/src/materials/MaterialComponent'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { useTexture } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import {
  Color,
  CubeReflectionMapping,
  CubeTexture,
  DataTexture,
  EquirectangularReflectionMapping,
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
  const materialComponentEntities = useQueryBySource(entity, [MaterialComponent])
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
  const material = useHasComponent(entity, MaterialComponent)
  useEffect(() => {
    if (!material) return
    setComponent(entity, MaterialComponent, { envMapIntensity: envMapComponent.envMapIntensity })
  }, [envMapComponent.envMapIntensity, material])
  return null
}

const EnvMapSkyboxReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const backgroundQuery = useQuery([BackgroundComponent])
  const material = useHasComponent(entity, MaterialComponent)
  useEffect(() => {
    return () => {
      if (!hasComponent(entity, MaterialComponent)) return
      setComponent(entity, MaterialComponent, { envMap: null })
    }
  }, [])

  let i = 0
  for (i; i < backgroundQuery.length; i++) if (haveCommonAncestor(entity, backgroundQuery[i])) break
  const backgroundComponent = useOptionalComponent(backgroundQuery[i], BackgroundComponent)

  useEffect(() => {
    if (!material || !backgroundComponent) return

    setComponent(entity, MaterialComponent, { envMap: backgroundComponent as Texture })
    ResourceState.addEntityResource(entity, backgroundComponent as Texture)
  }, [backgroundComponent, material])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapCubemapReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const material = useHasComponent(entity, MaterialComponent)
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  useEffect(() => {
    return () => {
      if (!hasComponent(entity, MaterialComponent)) return
      setComponent(entity, MaterialComponent, { envMap: null })
    }
  }, [])
  useEffect(() => {
    if (!material) return
    const abortController = new AbortController()
    loadCubeMapTexture(
      envMapComponent.envMapCubemapURL,
      (texture: CubeTexture | undefined) => {
        if (abortController.signal.aborted || !hasComponent(entity, MaterialComponent)) return
        if (!texture) return
        texture.mapping = CubeReflectionMapping
        texture.colorSpace = SRGBColorSpace
        setComponent(entity, MaterialComponent, { envMap: texture })
        removeError(entity, EnvMapComponent, 'MISSING_FILE')
      },
      undefined,
      (_) => {
        if (abortController.signal.aborted || !hasComponent(entity, MaterialComponent)) return
        setComponent(entity, MaterialComponent, { envMap: null })
        addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
      }
    )
    return () => {
      abortController.abort()
      if (!entityExists(entity) || !hasComponent(entity, MaterialComponent)) return
      setComponent(entity, MaterialComponent, { envMap: null })
    }
  }, [envMapComponent.envMapCubemapURL, material])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapEquirectangularReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)

  const [envMapTexture, error] = useTexture(envMapComponent.envMapSourceURL, entity)

  useEffect(() => {
    return () => {
      if (!hasComponent(entity, MaterialComponent)) return
      setComponent(entity, MaterialComponent, { envMap: null })
    }
  }, [])

  useEffect(() => {
    if (!envMapTexture || !envMapTexture.isTexture) return
    envMapTexture.mapping = EquirectangularReflectionMapping
    setComponent(entity, MaterialComponent, { envMap: envMapTexture })
  }, [envMapTexture])

  useEffect(() => {
    if (!error) return
    setComponent(entity, MaterialComponent, { envMap: null })
    addError(entity, EnvMapComponent, 'MISSING_FILE', 'Skybox texture could not be found!')
  }, [error])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

const EnvMapBakeReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const { entity, rootEntity } = props
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)
  const bakeEntity =
    UUIDComponent.useEntityFromSameSourceByID(props.rootEntity, envMapComponent.envMapSourceEntityUUID) ??
    UndefinedEntity
  const bakeComponent = useOptionalComponent(bakeEntity, EnvMapBakeComponent)
  const transformComponent = useOptionalComponent(bakeEntity, TransformComponent)

  const [envMaptexture, error] = useTexture(bakeComponent?.envMapOrigin ?? '', bakeEntity)

  useEffect(() => {
    return () => {
      if (!entityExists(entity) || !hasComponent(entity, MaterialComponent)) return
      setComponent(entity, MaterialComponent, { envMap: null })
      removeComponent(entity, BoxProjectionPlugin)
    }
  }, [])

  useEffect(() => {
    const texture = envMaptexture
    if (!texture) return
    texture.mapping = EquirectangularReflectionMapping
    setComponent(entity, MaterialComponent, { envMap: texture })
  }, [envMaptexture, envMapComponent.type])

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
  const envMapComponent = useComponent(rootEntity, EnvMapComponent)

  useEffect(() => {
    return () => {
      if (!entityExists(entity) || !hasComponent(entity, MaterialComponent)) return
      setComponent(entity, MaterialComponent, { envMap: null })
    }
  }, [])

  useEffect(() => {
    const color = envMapComponent.envMapSourceColor ?? tempColor
    const resolution = 64 // Min value required
    /** @todo track in resource manager */
    const texture = new DataTexture(getRGBArray(new Color(color)), resolution, resolution, RGBAFormat)
    texture.needsUpdate = true
    texture.colorSpace = SRGBColorSpace
    texture.mapping = EquirectangularReflectionMapping
    setComponent(entity, MaterialComponent, { envMap: texture })
    return () => {
      texture.dispose()
    }
  }, [envMapComponent.envMapSourceColor, envMapComponent.type])

  return <IntensityReactor entity={entity} rootEntity={rootEntity} />
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => <QueryReactor Components={[EnvMapComponent]} ChildEntityReactor={EnvMapReactor} />
})
