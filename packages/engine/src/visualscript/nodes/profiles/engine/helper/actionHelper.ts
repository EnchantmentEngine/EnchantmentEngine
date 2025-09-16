import { SystemUUID } from '@ir-engine/ecs'
import { ActionQueueHandle } from '@ir-engine/hyperflux'
import { NodeDefinition } from '@ir-engine/visual-script'

const skipAction = ['']

// export function generateActionNodeSchema(action) {
//   const nodeschema = {}
//   const schema = action
//   if (schema === null) {
//     return nodeschema
//   }
//   if (schema === undefined) {
//     return nodeschema
//   }
//   for (const [name, value] of Object.entries(schema)) {
//     const socketValue = getParserType(value)

//     if (socketValue) nodeschema[name] = socketValue
//   }
//   return nodeschema
// }

export function registerActionDispatchers() {
  const dispatchers: NodeDefinition[] = []
  // const skipped: string[] = []
  // for (const [actionType, action] of Object.entries(ActionDefinitions)) {
  //   const { type, ...actionDef } = action.actionShape
  //   const actionInput = {}
  //   if (skipAction.includes(actionType)) {
  //     skipped.push(actionType)
  //     continue
  //   }
  //   const inputsockets = generateActionNodeSchema(actionDef)
  //   if (Object.keys(inputsockets).length === 0) {
  //     skipped.push(actionType)
  //     continue
  //   }

  //   const primaryType = Array.isArray(type) ? type[0] : type
  //   const nameArray = primaryType.split('.')
  //   const dispatchName = startCase(nameArray.pop().toLowerCase())
  //   const namePath = nameArray.splice(1).join('/')

  //   const node = makeFlowNodeDefinition({
  //     typeName: `action/${namePath}/${dispatchName}/dispatch`,
  //     category: NodeCategory.Action,
  //     label: `dispatch ${namePath} ${dispatchName}`,
  //     in: {
  //       flow: 'flow',
  //       ...inputsockets
  //     },
  //     out: { flow: 'flow' },
  //     initialState: undefined,
  //     triggered: ({ read, write, commit }) => {
  //       //read from the read and set dict acccordingly
  //       const inputs = Object.entries(node.in).splice(1)
  //       for (const [input, type] of inputs) {
  //         actionInput[input] = NodetoEnginetype(read(input as any), type)
  //       }
  //       dispatchAction(ActionDefinitions[type](actionInput as Action))
  //       commit('flow')
  //     }
  //   })
  //   dispatchers.push(node)
  // }
  return dispatchers
}

type State = {
  queue: ActionQueueHandle
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  queue: undefined!,
  systemUUID: '' as SystemUUID
})
let systemCounter = 0

export function registerActionConsumers() {
  const consumers: NodeDefinition[] = []
  // const skipped: string[] = []
  // for (const [actionType, action] of Object.entries(ActionDefinitions)) {
  //   const { type, ...actionDef } = action.actionShape
  //   if (skipAction.includes(actionType)) {
  //     skipped.push(actionType)
  //     continue
  //   }
  //   const outputSockets = generateActionNodeSchema(actionDef)
  //   if (Object.keys(outputSockets).length === 0) {
  //     skipped.push(actionType)
  //     continue
  //   }

  //   const primaryType = Array.isArray(type) ? type[0] : type
  //   const nameArray = primaryType.split('.')
  //   const dispatchName = startCase(nameArray.pop().toLowerCase())
  //   const namePath = nameArray.splice(1).join('/')

  //   const node = makeEventNodeDefinition({
  //     typeName: `action/${namePath}/${dispatchName}/consume`,
  //     category: NodeCategory.Action,
  //     label: `on ${namePath} ${dispatchName}`,
  //     in: {
  //       system: (_, graph) => {
  //         const systemDefinitions = Array.from(SystemDefinitions.keys()).map((key) => key as string)
  //         const groups = systemDefinitions.filter((key) => key.includes('group')).sort()
  //         const nonGroups = systemDefinitions.filter((key) => !key.includes('group')).sort()
  //         const choices = [...groups, ...nonGroups]
  //         return {
  //           key: 'system',
  //           valueType: 'string',
  //           choices: choices,
  //           defaultValue: InputSystemGroup
  //         }
  //       }
  //     },
  //     out: { flow: 'flow', ...outputSockets },
  //     initialState: initialState(),
  //     init: ({ read, write, commit, graph }) => {
  //       //read from the read and set dict acccordingly

  //       const system = read<SystemUUID>('system')

  //       const queue = defineActionQueue(ActionDefinitions[type].matches)
  //       queue() // flush the queue
  //       const systemUUID = defineSystem({
  //         uuid: `visual-script-onAction-${dispatchName}` + systemCounter++,
  //         insert: { with: system },
  //         execute: () => {
  //           const currQueue = queue()
  //           if (currQueue.length === 0) return
  //           const tempQueue = currQueue
  //           for (let i = 0; i < tempQueue.length; i++) {
  //             const currAction = tempQueue[i]
  //             for (const [output, type] of Object.entries(outputSockets)) {
  //               write(output as any, NodetoEnginetype(currAction[output], type))
  //             }
  //             commit('flow')
  //           }
  //           queue() // clear the queue
  //         }
  //       })
  //       const state: State = {
  //         queue,
  //         systemUUID
  //       }

  //       return state
  //     },
  //     dispose: ({ state: { queue, systemUUID }, graph: { getDependency } }) => {
  //       destroySystem(systemUUID)
  //       removeActionQueue(queue)
  //       return initialState()
  //     }
  //   })
  //   consumers.push(node)
  // }
  return consumers
}
