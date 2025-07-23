import { ComponentMap, defineComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { Assert, NodeCategory, makeFlowNodeDefinition } from '@ir-engine/visual-script'

export const addComponent = makeFlowNodeDefinition({
  typeName: 'engine/component/addComponent',
  category: NodeCategory.Engine,
  label: 'Add Component',
  in: {
    flow: 'flow',
    entity: 'entity',
    componentName: (_) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit }) => {
    const entity = Number.parseInt(read('entity')) as Entity
    const componentName = read<string>('componentName')
    const component = ComponentMap.get(componentName)!
    setComponent(entity, component)
    write('entity', entity)
    commit('flow')
  }
})

export const deleteComponent = makeFlowNodeDefinition({
  typeName: 'engine/component/deleteComponent',
  category: NodeCategory.Engine,
  label: 'Delete Component',
  in: {
    flow: 'flow',
    entity: 'entity',
    componentName: (_) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit }) => {
    const entity = Number.parseInt(read('entity')) as Entity
    const componentName = read<string>('componentName')
    const component = ComponentMap.get(componentName)!
    removeComponent(entity, component)
    write('entity', entity)
    commit('flow')
  }
})

export const setTag = makeFlowNodeDefinition({
  typeName: 'engine/component/tag/set',
  category: NodeCategory.Engine,
  label: 'set Tag',
  in: {
    flow: 'flow',
    entity: 'entity',
    tagName: 'string'
  },
  out: { flow: 'flow', entity: 'entity', tagName: 'string' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const entity = Number.parseInt(read('entity')) as Entity
    const tagName = read<string>('tagName')
    const tag = defineComponent({ name: `bg-tag.${tagName}` })

    setComponent(entity, tag)

    write('entity', entity)
    write('tagName', tagName)
    commit('flow')
  }
})

export const removeTag = makeFlowNodeDefinition({
  typeName: 'engine/component/tag/remove',
  category: NodeCategory.Engine,
  label: 'remove Tag',
  in: {
    flow: 'flow',
    entity: 'entity',
    tagName: 'string'
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const entity = Number.parseInt(read('entity')) as Entity
    const tagName = `bg-tag.${read<string>('tagName')}`
    const component = ComponentMap.get(tagName)!
    Assert.mustBeDefined(component, `Component ${tagName} does not exist`)
    removeComponent(entity, component)
    write('entity', entity)
    commit('flow')
  }
})
