import {
  Component,
  deserializeComponent,
  hasComponent,
  serializeComponent,
  SerializedComponentType
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, SourceID } from '@ir-engine/ecs/src/Entity'
import { setNestedObject } from '@ir-engine/hyperflux'

import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { SelectionState } from '../../services/SelectionServices'

export type EditorPropType = {
  entity: Entity
  component?: Component
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

export const updateProperty = <C extends Component, K extends keyof SerializedComponentType<C>>(
  component: C,
  propName: K,
  nodes = SelectionState.getSelectedEntities()
) => {
  return (value: SerializedComponentType<C>[K]) => {
    updateProperties(component, { [propName]: value } as any, nodes)
  }
}

export const updateProperties = <C extends Component>(
  component: C,
  properties: Partial<SerializedComponentType<C>>,
  nodes = SelectionState.getSelectedEntities()
) => {
  for (let i = 0; i < nodes.length; i++) {
    const entity = nodes[i]
    const currentComponent = hasComponent(entity, component) ? serializeComponent(entity, component) : {}
    for (const [key, val] of Object.entries(properties)) {
      if (key.includes('.')) {
        setNestedObject(currentComponent, key, val)
      } else {
        currentComponent[key] = val
      }
    }
    deserializeComponent(entity, component, currentComponent)
  }
}

/**
 * @todo add types for period separated string property support & later JSON pointers
 */
export const commitProperty = <C extends Component, K extends keyof SerializedComponentType<C>>(
  component: C,
  propName: K,
  nodes = SelectionState.getSelectedEntities()
) => {
  return (value: SerializedComponentType<C>[K]) => {
    commitProperties(component, { [propName]: value } as any, nodes)
  }
}

export const commitProperties = <C extends Component>(
  component: C,
  properties: Partial<SerializedComponentType<C>>,
  nodes = SelectionState.getSelectedEntities()
) => {
  EditorControlFunctions.modifyProperty(nodes, component, properties)

  const affectedAssets = new Set<SourceID>(nodes.map((entity) => GLTFComponent.getSourceID(entity)))

  for (const assetID of affectedAssets) {
    AuthoringState.snapshot(assetID)
  }
}
