
import { Assert } from '../Diagnostics/Assert'
import { Fiber } from '../Execution/Fiber'
import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { Node, NodeConfiguration } from './Node'
import { IFlowNodeDefinition, NodeCategory } from './NodeDefinitions'
import { IFlowNode, INode } from './NodeInstance'
import { NodeDescription } from './Registry/NodeDescription'

export class FlowNode extends Node<'Flow'> implements IFlowNode {
  constructor(
    description: NodeDescription,
    graph: IGraph,
    inputs: Socket[] = [],
    outputs: Socket[] = [],
    configuration: NodeConfiguration = {}
  ) {
    // determine if this is an eval node
    super({
      description: {
        ...description,
        category: description.category as NodeCategory
      },
      inputs,
      outputs,
      graph,
      configuration,
      nodeType: 'Flow'
    })

    // must have at least one input flow socket
    Assert.mustBeTrue(this.inputs.some((socket) => socket.valueTypeName === 'flow'))
  }

  triggered(fiber: Fiber, triggeringSocketName: string) {
    throw new Error('not implemented')
  }
}

export class FlowNode2 extends FlowNode {
  constructor(props: {
    description: NodeDescription
    graph: IGraph
    inputs?: Socket[]
    outputs?: Socket[]
    configuration?: NodeConfiguration
  }) {
    super(props.description, props.graph, props.inputs, props.outputs, props.configuration)
  }
}

export class FlowNodeInstance<TFlowNodeDefinition extends IFlowNodeDefinition>
  extends Node<'Flow'>
  implements IFlowNode
{
  private triggeredInner: TFlowNodeDefinition['triggered']
  private state: TFlowNodeDefinition['initialState']
  private readonly outputSocketKeys: string[]

  constructor(nodeProps: Omit<INode, 'nodeType'> & Pick<TFlowNodeDefinition, 'triggered' | 'initialState'>) {
    super({ ...nodeProps, nodeType: 'Flow' })
    this.triggeredInner = nodeProps.triggered
    this.state = nodeProps.initialState
    this.outputSocketKeys = nodeProps.outputs.map((s) => s.name)
  }

  public triggered = (fiber: Fiber, triggeringSocketName: string) => {
    this.state = this.triggeredInner({
      commit: (outFlowName, fiberCompletedListener) => fiber.commit(this, outFlowName, fiberCompletedListener),
      read: this.readInput,
      write: this.writeOutput,
      graph: this.graph,
      state: this.state,
      configuration: this.configuration,
      outputSocketKeys: this.outputSocketKeys,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      triggeringSocketName
    })
  }
}
