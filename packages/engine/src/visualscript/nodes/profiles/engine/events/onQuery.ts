import { Component, ComponentMap } from '@ir-engine/ecs/src/ComponentFunctions'
import { Query, defineQuery, removeQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { SystemDefinitions, SystemUUID, defineSystem, destroySystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { NodeCategory, SocketsList, makeEventNodeDefinition, sequence } from '@ir-engine/visual-script'

let systemCounter = 0

type State = {
  query: Query
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  query: undefined!,
  systemUUID: '' as SystemUUID
})

export const OnQuery = makeEventNodeDefinition({
  typeName: 'engine/query/use',
  category: NodeCategory.Engine,
  label: 'On Query',
  configuration: {
    numInputs: {
      valueType: 'number',
      defaultValue: 1
    }
  },
  in: (_) => {
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
    const system = () => {
      const systemDefinitions = Array.from(SystemDefinitions.keys()).map((key) => key as string)
      const groups = systemDefinitions.filter((key) => key.includes('group')).sort()
      const nonGroups = systemDefinitions.filter((key) => !key.includes('group')).sort()
      const choices = [...groups, ...nonGroups]
      return {
        key: 'system',
        valueType: 'string',
        choices: choices,
        defaultValue: InputSystemGroup
      }
    }
    // unsure how to get all system groups

    sockets.push({ ...type() }, { ...system() })

    for (const index of sequence(1, (_.numInputs ?? OnQuery.configuration?.numInputs.defaultValue) + 1)) {
      sockets.push({ ...componentName(index) })
    }
    return sockets
  },

  out: {
    flow: 'flow',
    entity: 'entity'
  },
  initialState: initialState(),
  init: ({ read, write, commit, configuration }) => {
    const type = read<string>('type')
    const system = read<SystemUUID>('system')

    const queryComponents: Component[] = []
    for (const index of sequence(1, (configuration.numInputs ?? OnQuery.configuration?.numInputs.defaultValue) + 1)) {
      const componentName = read<string>(`componentName${index}`)
      const component = ComponentMap.get(componentName)!
      queryComponents.push(component)
    }
    const query = defineQuery(queryComponents)[type]
    let prevQueryResult = []
    let newQueryResult = []
    const systemUUID = defineSystem({
      uuid: 'visual-script-onQuery-' + systemCounter++,
      insert: { with: system },
      execute: () => {
        newQueryResult = query()
        if (newQueryResult.length === 0) return
        if (prevQueryResult === newQueryResult) return //dont bother if same result
        const tempResult = newQueryResult
        for (let i = 0; i < tempResult.length; i++) {
          console.log('DEBUG in code', tempResult[i])
          write('entity', tempResult[i])
          commit('flow')
        }
        prevQueryResult = tempResult
      }
    })
    const state: State = {
      query,
      systemUUID
    }

    return state
  },
  dispose: ({ state: { query, systemUUID } }) => {
    destroySystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
