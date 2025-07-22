import { Component, ComponentMap, defineQuery, removeQuery } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { NodeCategory, SocketsList, makeFunctionNodeDefinition, sequence } from '@ir-engine/visual-script'

export const getQuery = makeFunctionNodeDefinition({
  typeName: 'engine/query/get',
  category: NodeCategory.Engine,
  label: 'get Query',
  configuration: {
    numInputs: {
      valueType: 'number',
      defaultValue: 1
    }
  },
  in: (_, graphApi) => {
    const sockets: SocketsList = []

    const componentName = (index) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      return {
        key: `componentName${index}`,
        valueType: 'string',
        choices: choices,
        defaultValue: TransformComponent.name
      }
    }
    const type = () => {
      const choices = ['enter', 'exit']
      return {
        key: 'type',
        valueType: 'string',
        choices: choices,
        defaultValue: choices[0]
      }
    }
    // unsure how to get all system groups

    sockets.push({ ...type() })

    for (const index of sequence(1, (_.numInputs ?? getQuery.configuration?.numInputs.defaultValue) + 1)) {
      sockets.push({ ...componentName(index) })
    }
    return sockets
  },

  out: {
    entityList: 'list'
  },
  exec: ({ read, write, graph, configuration }) => {
    const type = read<string>('type')

    const queryComponents: Component[] = []
    for (const index of sequence(1, (configuration.numInputs ?? getQuery.configuration?.numInputs.defaultValue) + 1)) {
      const componentName = read<string>(`componentName${index}`)
      const component = ComponentMap.get(componentName)!
      queryComponents.push(component)
    }
    const query = defineQuery(queryComponents)[type]()
    write('entityList', query)
    removeQuery(query)
  }
})
