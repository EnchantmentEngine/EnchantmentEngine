import { Fiber } from '../Execution/Fiber'
import { VisualScriptEngine } from '../Execution/VisualScriptEngine'
import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { NodeConfiguration } from './Node'
import { readInputFromSockets, writeOutputsToSocket } from './NodeSockets'
import { INodeDescription } from './Registry/NodeDescription'

export const NodeType = {
  Event: 'Event',
  Flow: 'Flow',
  Async: 'Async',
  Function: 'Function'
} as const

export type NodeType = (typeof NodeType)[keyof typeof NodeType]

export interface INode {
  readonly inputs: Socket[]
  readonly outputs: Socket[]
  readonly graph: IGraph
  description: INodeDescription
  configuration: NodeConfiguration
  nodeType: NodeType
  label?: string
  metadata?: any
}

export interface IFunctionNode extends INode {
  nodeType: 'Function'
  exec: (node: INode) => void
}

export interface IEventNode extends INode {
  nodeType: 'Event'
  init: (engine: VisualScriptEngine) => void
  dispose: (engine: VisualScriptEngine) => void
}

export interface IFlowNode extends INode {
  nodeType: 'Flow'
  triggered: (fiber: Fiber, triggeringSocketName: string) => void
}

export interface IAsyncNode extends INode {
  nodeType: 'Async'
  triggered: (engine: VisualScriptEngine, triggeringSocketName: string, finished: () => void) => void
  dispose: () => void
}

export const isFlowNode = (node: INode): node is IFlowNode => node.nodeType === 'Flow'

export const isEventNode = (node: INode): node is IEventNode => node.nodeType === 'Event'

export const isAsyncNode = (node: INode): node is IAsyncNode => node.nodeType === 'Async'

export const isFunctionNode = (node: INode): node is IFunctionNode => node.nodeType === 'Function'

export const makeNodeInstance = (node: INode) => {
  const readInput = <T>(inputName: string): T => {
    return readInputFromSockets(node.inputs, inputName, node.description.typeName)
  }

  const writeOutput = <T>(outputName: string, value: T) => {
    writeOutputsToSocket(node.outputs, outputName, value, node.description.typeName)
  }

  return {
    ...node,
    readInput,
    writeOutput
  }
}
