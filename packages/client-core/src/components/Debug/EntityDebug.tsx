import { getAllEntities, getEntityComponents } from '@ir-engine/ecs'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { EntityTreeComponent, UUIDComponent, entityExists } from '@ir-engine/ecs'
import {
  Component,
  ComponentMap,
  Layers,
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { SuspendedQueryChildState, defineQuery, removeQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import {
  HyperFlux,
  NO_PROXY,
  defineState,
  getState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MaterialMapState } from '@ir-engine/spatial/src/materials/MaterialComponent'
import { Button, Input } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { MeshStandardMaterial } from 'three'
import { useFrameUpdate } from './useFrameUpdate'

const renderEntityTreeRoots = (roots: Entity[]) => {
  return Object.fromEntries(
    roots
      .map((entity, i) => {
        if (!entity || !entityExists(entity)) return []
        return [
          `${entity} - ${
            getOptionalComponent(entity, NameComponent) ??
            (hasComponent(entity, UUIDComponent) && UUIDComponent.get(entity)) ??
            'Unknown'
          }`,
          renderEntityTree(entity)
        ]
      })
      .filter(([exists]) => !!exists)
  )
}

const renderEntityTree = (entity: Entity) => {
  const node = getComponent(entity, EntityTreeComponent)
  return {
    components: renderEntityComponents(entity),
    children: node
      ? {
          ...node.children.reduce(
            (r, child) =>
              Object.assign(r, {
                [`${child} - ${
                  getOptionalComponent(child, NameComponent) ??
                  (hasComponent(child, UUIDComponent) && UUIDComponent.get(child)) ??
                  'Unknown'
                }`]: renderEntityTree(child)
              }),
            {}
          )
        }
      : {}
  }
}

const renderEntityComponents = (entity: Entity) => {
  return Object.fromEntries(
    entityExists(entity)
      ? getEntityComponents(HyperFlux.store, entity).reduce<[string, any][]>((components, C: Component<any, any>) => {
          if (C !== NameComponent) components.push([C.name, getComponent(entity, C)])
          return components
        }, [])
      : []
  )
}

const getQueryFromString = (queryString: string) => {
  const queryComponents = queryString
    .split(',')
    .filter((name) => ComponentMap.has(name))
    .map((name) => ComponentMap.get(name)!)
  const query = defineQuery(queryComponents)
  const entities = query()
  removeQuery(query)
  return entities
}

const renderAllEntities = (filter: string, queryString: string) => {
  const entities = queryString ? getQueryFromString(queryString) : (getAllEntities(HyperFlux.store) as Entity[])
  return {
    ...Object.fromEntries(
      [...entities.entries()]
        .map(([, eid]) => {
          if (!entityExists(eid)) return null!

          const label = `${eid} - ${
            getOptionalComponent(eid, NameComponent) ??
            (hasComponent(eid, UUIDComponent) && UUIDComponent.get(eid)) ??
            ''
          }`

          if (
            filter !== '' &&
            (!hasComponent(eid, NameComponent) || label.toLowerCase().indexOf(filter.toLowerCase()) === -1)
          )
            return null!

          return [label, renderEntityComponents(eid)]
        })
        .filter((exists) => !!exists)
    )
  }
}

const EntitySearchState = defineState({
  name: 'EntitySearchState',
  initial: {
    search: '',
    query: '',
    materialDebug: false
  },
  extension: syncStateWithLocalStorage(['search', 'query'])
})

const shouldExpandNodeInitially = (keyPath: any, data: any, level: number) => level < 2

const simulationSources = defineQuery([GLTFComponent])
const authoringSources = defineQuery([GLTFComponent], Layers.Authoring)

export const EntityDebug = () => {
  const { t } = useTranslation()

  useFrameUpdate()

  const namedEntities = useHookstate({})
  const erroredComponents = useHookstate([] as any[])
  const suspendedEntities = useMutableState(SuspendedQueryChildState)
    .get(NO_PROXY)
    .map((c) => [c.entity, { props: c.props, reactor: c.ChildEntityReactor }] as [Entity, any])
    .reduce(
      (acc, v) => {
        const [entity, vals] = v
        const entityLabel = `${
          getOptionalComponent(entity, NameComponent) ?? getOptionalComponent(entity, UUIDComponent)
        } - ${entity}`
        if (!(entityLabel in acc)) acc[entityLabel] = []
        acc[entityLabel].push(vals)
        return acc
      },
      {} as Record<Entity, Array<any>>
    )

  const entityTree = useHookstate({ siimulation: {}, authoring: {} } as any)
  const entitySearch = useMutableState(EntitySearchState).search
  const entityQuery = useMutableState(EntitySearchState).query
  const materialDebug = useMutableState(EntitySearchState).materialDebug

  erroredComponents.set(
    [...HyperFlux.store.activeReactors.values()]
      .filter((reactor) => (reactor as any).entity && reactor.errors.length)
      .map((reactor) => {
        return reactor.errors.map((error) => {
          return {
            entity: (reactor as any).entity,
            component: (reactor as any).component,
            error
          }
        })
      })
      .flat()
  )

  useExecute(
    () => {
      namedEntities.set(renderAllEntities(entitySearch.value, entityQuery.value))
      entityTree.set({
        simulation: renderEntityTreeRoots(simulationSources()),
        authoring: renderEntityTreeRoots(authoringSources())
      })
    },
    { after: PresentationSystemGroup }
  )

  useEffect(() => {
    if (!materialDebug.value) return
    const material = getState(MaterialMapState).get(UndefinedEntity) as MeshStandardMaterial
    material.color.set(0xff00ff)
    return () => {
      material.color.set(0xffffff)
    }
  }, [materialDebug.value])

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <Button className="mb-2" onClick={() => materialDebug.set(!materialDebug.value)}>
        Material Debug {materialDebug.value ? 'Enabled' : 'Disabled'}
      </Button>
      <div className="my-1">
        <Text className="text-text-primary-button">{t('common:debug.scenes')}</Text>
        <JSONTree
          data={entityTree.get(NO_PROXY)}
          shouldExpandNodeInitially={shouldExpandNodeInitially}
          postprocessValue={(v: any) => v?.value ?? v}
        />
      </div>
      <div className="my-1">
        <Text className="text-text-primary-button">{t('common:debug.entities')}</Text>
        <Input
          placeholder="Search..."
          value={entitySearch.value}
          onChange={(event) => entitySearch.set(event.target.value)}
        />
        <Input placeholder="Query..." value={entityQuery.value} onChange={(e) => entityQuery.set(e.target.value)} />
        <JSONTree data={namedEntities.get(NO_PROXY)} />
      </div>
      <div className="my-1">
        <Text className="text-text-primary-button">{t('common:debug.suspendedEntities')}</Text>
        <JSONTree data={suspendedEntities} />
      </div>
      <div className="my-1">
        <Text className="text-text-primary-button">{t('common:debug.erroredEntities')}</Text>
        <JSONTree data={erroredComponents.get(NO_PROXY)} />
      </div>
    </div>
  )
}
