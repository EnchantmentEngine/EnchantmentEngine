import { EntityTreeComponent, getAllComponents, getComponent, serializeComponent, UUIDComponent } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EditorState } from '../services/EditorServices'

export type EntityCopyDataType = { name: string; children: EntityCopyDataType[]; components: ComponentCopyDataType[] }
export type ComponentCopyDataType = { name: string; json: Record<string, unknown> }

// fallback to avoid error at readText
export const CopyState = defineState({
  name: 'CopyState',
  initial: ''
})

export const CopyPasteFunctions = {
  _generateEntityCopyData: (entities: Entity[]) =>
    entities
      .map((entity) => {
        const rootEntity = getState(EditorState).rootEntity
        const sourceId = getComponent(entity, UUIDComponent).entitySourceID
        if (sourceId !== GLTFComponent.getSourceID(rootEntity)) {
          return
        }
        const name = getComponent(entity, NameComponent)
        const children = getComponent(entity, EntityTreeComponent).children as Entity[]
        return {
          name: name,
          children: CopyPasteFunctions._generateEntityCopyData(children),
          components: CopyPasteFunctions._generateComponentCopyData(entity)
        }
      })
      .filter((e) => e !== undefined) as EntityCopyDataType[],

  _generateComponentCopyData: (entity: Entity) => {
    const components = getAllComponents(entity)
    const componentData = components
      .map((component) => {
        if (!component.jsonID) return
        const json = serializeComponent(entity, component)
        if (!json) return
        return {
          name: component.jsonID,
          json
        } as ComponentCopyDataType
      })
      .filter((c) => typeof c?.json === 'object' && c.json !== null)
      .filter((c) => c !== undefined)
    return componentData
  },

  copyEntities: async (entities: Entity[]) => {
    const copyData = JSON.stringify(CopyPasteFunctions._generateEntityCopyData(entities))
    await navigator.clipboard.writeText(copyData)
    getMutableState(CopyState).set(copyData)
  },

  getPastedEntities: async () => {
    let clipboardText = ''
    try {
      clipboardText = await navigator.clipboard.readText()
    } catch {
      clipboardText = getState(CopyState)
    }

    // eslint-disable-next-line no-useless-catch
    try {
      const nodeEntitiesData = JSON.parse(clipboardText) as EntityCopyDataType[]
      return nodeEntitiesData
    } catch (err) {
      throw err
    }
  }
}
