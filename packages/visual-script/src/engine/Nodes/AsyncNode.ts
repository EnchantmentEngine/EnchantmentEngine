
import { Assert } from '../Diagnostics/Assert'
import { VisualScriptEngine } from '../Execution/VisualScriptEngine'
import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { Node, NodeConfiguration } from './Node'
import { IAsyncNodeDefinition, NodeCategory } from './NodeDefinitions'
import { IAsyncNode, INode } from './NodeInstance'
import { NodeDescription } from './Registry/NodeDescription'

// async flow node with only a single flow input
export class AsyncNode extends Node<'Async'> {
  constructor(
    description: NodeDescription,
    graph: IGraph,
    inputs: Socket[] = [],
    outputs: Socket[] = [],
    configuration: NodeConfiguration = {}
  ) {
    super({
      description: {
        ...description,
        category: description.category as NodeCategory
      },
      inputs,
      outputs,
      graph,
      nodeType: 'Async',
      configuration
    })

    // must have at least one input flow socket
    Assert.mustBeTrue(this.inputs.some((socket) => socket.valueTypeName === 'flow'))

    // must have at least one output flow socket
    Assert.mustBeTrue(this.outputs.some((socket) => socket.valueTypeName === 'flow'))
  }

  triggered(engine: VisualScriptEngine, triggeringSocketName: string, finished: () => void) {
    throw new Error('not implemented')
  }

  dispose() {
    throw new Error('not implemented')
  }
}

export class AsyncNode2 extends AsyncNode {
  constructor(props: { description: NodeDescription; graph: IGraph; inputs?: Socket[]; outputs?: Socket[] }) {
    super(props.description, props.graph, props.inputs, props.outputs)
  }
}

export class AsyncNodeInstance<TAsyncNodeDef extends IAsyncNodeDefinition> extends Node<'Async'> implements IAsyncNode {
  private triggeredInner: TAsyncNodeDef['triggered']
  private disposeInner: TAsyncNodeDef['dispose']
  private state: TAsyncNodeDef['initialState']

  constructor(node: Omit<INode, 'nodeType'> & Pick<TAsyncNodeDef, 'triggered' | 'initialState' | 'dispose'>) {
    super({ ...node, nodeType: 'Async' })

    this.triggeredInner = node.triggered
    this.disposeInner = node.dispose
    this.state = node.initialState
  }

  triggered = (
    engine: Pick<VisualScriptEngine, 'commitToNewFiber'>,
    triggeringSocketName: string,
    finished: () => void
  ) => {
    this.triggeredInner({
      read: this.readInput,
      write: this.writeOutput,
      commit: (outFlowname, fiberCompletedListener) =>
        engine.commitToNewFiber(this, outFlowname, fiberCompletedListener),
      configuration: this.configuration,
      graph: this.graph,
      finished,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      triggeringSocketName
    })
  }
  dispose = () => {
    this.state = this.disposeInner({ state: this.state, graph: this.graph })
  }
}
