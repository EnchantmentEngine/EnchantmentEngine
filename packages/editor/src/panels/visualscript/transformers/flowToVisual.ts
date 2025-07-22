import { Edge, Node } from 'reactflow'

import { GraphJSON, NodeJSON, ValueJSON, VariableJSON } from '@ir-engine/visual-script'

import { NodeSpecGenerator } from '../hooks/useNodeSpecGenerator'

const isNullish = (value: any): value is null | undefined => value === undefined || value === null

export const flowToVisual = (
  nodes: Node[],
  edges: Edge[],
  variables: VariableJSON[],
  specGenerator: NodeSpecGenerator
): GraphJSON => {
  const visualScript: GraphJSON = { nodes: [], variables: variables, customEvents: [] }

  nodes.forEach((node) => {
    if (node.type === undefined) return
    const nodeSpec = specGenerator.getNodeSpec(node.type, node.data.configuration)
    if (nodeSpec === undefined) return
    const visualNode: NodeJSON = {
      id: node.id,
      type: node.type,
      metadata: {
        positionX: String(node.position.x),
        positionY: String(node.position.y)
      }
    }
    Object.entries(node.data.configuration).forEach(([key, value]) => {
      if (visualNode.configuration === undefined) {
        visualNode.configuration = {}
      }
      visualNode.configuration[key] = value as ValueJSON
    })

    Object.entries(node.data.values).forEach(([key, value]) => {
      if (visualNode.parameters === undefined) {
        visualNode.parameters = {}
      }
      visualNode.parameters[key] = { value: value as string }
    })
    if (node.parentNode) {
      visualNode.metadata!.parentNode = node.parentNode
    }
    if (node.style) {
      visualNode.metadata!.style = node.style as any
    }
    if (node.data.label) {
      visualNode.metadata!.label = node.data.label as any
    }
    // check for
    edges
      .filter((edge) => edge.target === node.id)
      .forEach((edge) => {
        const inputSpec = nodeSpec.inputs.find((input) => input.name === edge.targetHandle)
        if (inputSpec && inputSpec.valueType === 'flow') {
          // skip flows
          return
        }
        if (visualNode.parameters === undefined) {
          visualNode.parameters = {}
        }
        if (isNullish(edge.targetHandle)) return
        if (isNullish(edge.sourceHandle)) return

        // TODO: some of these are flow outputs, and should be saved differently.  -Ben, Oct 11, 2022
        visualNode.parameters[edge.targetHandle] = {
          link: { nodeId: edge.source, socket: edge.sourceHandle }
        }
      })

    edges
      .filter((edge) => edge.source === node.id)
      .forEach((edge) => {
        const outputSpec = nodeSpec.outputs.find((output) => output.name === edge.sourceHandle)
        if (outputSpec && outputSpec.valueType !== 'flow') {
          return
        }
        if (visualNode.flows === undefined) {
          visualNode.flows = {}
        }
        if (isNullish(edge.targetHandle)) return
        if (isNullish(edge.sourceHandle)) return

        // TODO: some of these are flow outputs, and should be saved differently.  -Ben, Oct 11, 2022
        visualNode.flows[edge.sourceHandle] = {
          nodeId: edge.target,
          socket: edge.targetHandle
        }
      })

    // TODO filter out any orphan nodes at this point, to avoid errors further down inside visual-script

    visualScript.nodes?.push(visualNode)
  })

  return visualScript
}
