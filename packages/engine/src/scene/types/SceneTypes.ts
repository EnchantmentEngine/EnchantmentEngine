import { EntityUUID } from '@ir-engine/ecs'

export type ComponentJsonType = {
  name: string
  props?: any
}

export type EntityJsonType = {
  name: string | EntityUUID
  components: ComponentJsonType[]
  parent?: EntityUUID
  index?: number
}

export type SceneJsonType = {
  entities: Record<EntityUUID, EntityJsonType>
  root: EntityUUID
  version: number
}

export type SceneJSONDataType = {
  name: string
  scene: SceneJsonType
  thumbnailUrl: string
  project: string
}
