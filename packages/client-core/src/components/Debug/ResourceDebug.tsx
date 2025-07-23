import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { Entity, getOptionalComponent, UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import { defineState, syncStateWithLocalStorage, useMutableState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Resource, ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

const MB = 1024 * 1024
const roundToTwo = (num: number) => Math.round(num * 100) / 100

const ResourceSearchState = defineState({
  name: 'ResourceSearchState',
  initial: {
    search: ''
  },
  extension: syncStateWithLocalStorage(['search'])
})

const getTotalSize = (resources: Record<string, Record<string, Resource[]>>) =>
  Object.values(resources).reduce((acc, type) => {
    return (
      acc +
      Object.values(type).reduce((acc, entity) => {
        return (
          acc +
          entity
            .filter((resource) => 'size' in resource.metadata)
            .reduce((acc, resource) => acc + resource.metadata.size!, 0)
        )
      }, 0)
    )
  }, 0)

const getSrcFromResource = (resource: any) => resource.asset.url ?? resource.asset.src ?? 'Unknown'

const getEntityLabel = (entity: Entity, val: Resource) =>
  `${entity} - ${
    entity === UndefinedEntity
      ? getSrcFromResource(val)
      : getOptionalComponent(entity, NameComponent) ?? getOptionalComponent(entity, UUIDComponent) ?? 'Unknown'
  }`

const getSizeLabel = (size: number) => ` (${roundToTwo(size / MB)} MB)`

export function ResourceDebug() {
  const { t } = useTranslation()

  const resourceState = useMutableState(ResourceState)
  const entriesSortedByType = Object.entries(resourceState.resources.value).reduce(
    (acc, [key, val]) => {
      const res = val as Resource
      if (!acc[val.type]) acc[val.type] = {}
      const entity = val.entity
      const entityLabel = getEntityLabel(entity, res)
      if (!acc[val.type][entityLabel]) acc[val.type][entityLabel] = []
      acc[val.type][entityLabel].push(res)
      return acc
    },
    {} as Record<string, Record<string, Resource[]>>
  )

  const entriesOnGPU = Object.entries(resourceState.resources.value).reduce(
    (acc, [key, val]) => {
      const res = val as Resource
      if (!val.metadata?.onGPU || !val.metadata?.size) return acc
      if (!acc[val.type]) acc[val.type] = {}
      const entity = val.entity
      const entityLabel = getEntityLabel(entity, res)
      if (!acc[val.type][entityLabel]) acc[val.type][entityLabel] = []
      acc[val.type][entityLabel].push(res)
      return acc
    },
    {} as Record<string, Record<string, Resource[]>>
  )
  for (const type in entriesOnGPU) {
    for (const entity in entriesOnGPU[type]) {
      const size = entriesOnGPU[type][entity].reduce((acc, resource) => acc + resource.metadata.size!, 0)
      entriesOnGPU[type][`${entity}${getSizeLabel(size)}`] = entriesOnGPU[type][entity]
      delete entriesOnGPU[type][entity]
    }
  }
  const totalVRAM = roundToTwo(getTotalSize(entriesOnGPU) / MB)

  const entriesOnCPU = Object.entries(resourceState.resources.value).reduce(
    (acc, [key, val]) => {
      const res = val as Resource
      if (val.metadata?.discarded || !val.metadata?.size) return acc
      if (!acc[val.type]) acc[val.type] = {}
      const entity = val.entity
      const entityLabel = getEntityLabel(entity, res)
      if (!acc[val.type][entityLabel]) acc[val.type][entityLabel] = []
      acc[val.type][entityLabel].push(res)
      return acc
    },
    {} as Record<string, Record<string, Resource[]>>
  )
  for (const type in entriesOnCPU) {
    for (const entity in entriesOnCPU[type]) {
      const size = entriesOnCPU[type][entity].reduce((acc, resource) => acc + resource.metadata.size!, 0)
      entriesOnCPU[type][`${entity}${getSizeLabel(size)}`] = entriesOnCPU[type][entity]
      delete entriesOnCPU[type][entity]
    }
  }
  const totalRAM = roundToTwo(getTotalSize(entriesOnCPU) / MB)

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <div className="my-1">
        <Text className="text-text-primary-button">{t('common:debug.resources')}</Text>
        {/* <Input
          type="text"
          placeholder="Search..."
          value={stateSearch.value}
          onChange={(event) => stateSearch.set(event.target.value)}
        /> */}
        <JSONTree data={entriesSortedByType} hideRoot />
      </div>
      <div className="my-1">
        <Text className="text-text-primary-button">{`Total VRAM: ${totalVRAM} MB`}</Text>
        <JSONTree data={entriesOnGPU} />
      </div>
      <div className="my-1">
        <Text className="text-text-primary-button">{`Total RAM: ${totalRAM} MB`}</Text>
        <JSONTree data={entriesOnCPU} />
      </div>
    </div>
  )
}
