import {
  defineComponent,
  Entity,
  entityExists,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'

export const ResourceProgressComponent = defineComponent({
  name: 'ResourceProgressComponent',

  schema: S.Record(
    S.String(),
    S.Object({
      progress: S.Number()
    })
  ),

  setResource(entity: Entity, url: string, progress: number, total: number) {
    if (!entityExists(entity)) return
    setComponent(entity, ResourceProgressComponent)

    const percentage = total ? Math.floor((progress / total) * 100) : 0
    setComponent(entity, ResourceProgressComponent, {
      [url]: { progress: percentage }
    })
  },

  removeResource(entity: Entity, url: string) {
    const component = getOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return
    if (!component[url]) return

    delete component[url]
    setComponent(entity, ResourceProgressComponent)

    if (!Object.keys(component).length) {
      removeComponent(entity, ResourceProgressComponent)
    }
  },

  getResourcesLoaded(entity: Entity) {
    const component = getOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return true

    return Object.values(component).every((resource) => resource.progress === 100)
  },

  useResourcesLoaded(entity: Entity) {
    const component = useOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return true

    return Object.values(component).every((resource) => resource.progress === 100)
  },

  getResourcesProgress(entity: Entity) {
    const component = getOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return 100

    const resources = Object.values(component)
    const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
    const total = resources.length
    if (!total) return 0

    return Math.floor(progress / total)
  },

  useResourcesProgress(entity: Entity) {
    const component = useOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return 100

    const resources = Object.values(component)
    const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
    const total = resources.length
    if (!total) return 0

    return Math.floor(progress / total)
  },

  // Only call this in contexts where the array of entities never changes or the component calling this is remounted every time this array changes
  useResourcesProgressForEntities(entities: Entity[]) {
    const components = entities
      .map((entity) => useOptionalComponent(entity, ResourceProgressComponent))
      .filter(Boolean) as Record<string, { progress: number }>[]

    if (!components.length) return 100

    const progress = components.reduce((acc, component) => {
      const resources = Object.values(component)
      const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
      const total = resources.length
      if (!total) return acc
      return acc + progress / total
    }, 0)
    const total = components.length
    if (!total) return 0

    return Math.floor(progress / total)
  },

  getPendingResources(entity: Entity) {
    const component = getOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return 0

    return Object.values(component).filter((resource) => resource.progress < 100).length
  },

  usePendingResources(entity: Entity) {
    const component = useOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return 0

    return Object.values(component).filter((resource) => resource.progress < 100).length
  },

  useAllPendingResources() {
    const query = useQuery([ResourceProgressComponent])
    return query.reduce((acc, entity) => acc + ResourceProgressComponent.getPendingResources(entity), 0)
  }
})
