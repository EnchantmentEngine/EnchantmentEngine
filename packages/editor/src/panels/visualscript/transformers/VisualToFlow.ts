import { Edge, Node } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { GraphJSON, NodeConfigurationJSON } from '@ir-engine/visual-script'

export const visualToFlow = (visualScript: GraphJSON): [Node[], Edge[]] => {
  const nodes: Node[] = []
  const edges: Edge[] = []

  visualScript.nodes?.forEach((nodeJSON) => {
    const node: Node = {
      id: nodeJSON.id,
      type: nodeJSON.type,
      position: {
        x: nodeJSON.metadata?.positionX ? Number(nodeJSON.metadata?.positionX) : 0,
        y: nodeJSON.metadata?.positionY ? Number(nodeJSON.metadata?.positionY) : 0
      },
      data: {
        configuration: {} as NodeConfigurationJSON,
        values: {} as { [key: string]: any }
      }
    }
    if (nodeJSON.metadata?.parentNode) {
      node.parentNode = nodeJSON.metadata.parentNode
    }
    if (nodeJSON.metadata?.style) {
      node.style = nodeJSON.metadata.style as any
    }
    if (nodeJSON.metadata?.label) {
      node.data.label = nodeJSON.metadata.label
    }
    nodes.push(node)

    if (nodeJSON.configuration) {
      for (const [inputKey, input] of Object.entries(nodeJSON.configuration)) {
        node.data.configuration[inputKey] = input
      }
    }

    if (nodeJSON.parameters) {
      for (const [inputKey, input] of Object.entries(nodeJSON.parameters)) {
        if ('link' in input && input.link !== undefined) {
          edges.push({
            id: uuidv4(),
            source: input.link.nodeId,
            sourceHandle: input.link.socket,
            target: nodeJSON.id,
            targetHandle: inputKey
          })
        }
        if ('value' in input) {
          node.data.values[inputKey] = input.value
        }
      }
    }

    if (nodeJSON.flows) {
      for (const [inputKey, link] of Object.entries(nodeJSON.flows)) {
        edges.push({
          id: uuidv4(),
          source: nodeJSON.id,
          sourceHandle: inputKey,
          target: link.nodeId,
          targetHandle: link.socket
        })
      }
    }
  })

  return [nodes, edges]
}
