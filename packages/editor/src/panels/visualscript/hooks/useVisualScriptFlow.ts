import { omit } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { useEdgesState, useNodesState } from 'reactflow'

import { GraphJSON, VariableJSON } from '@ir-engine/visual-script'

import { autoLayout } from '../../../panels/visualscript/util/autoLayout'
import { hasPositionMetaData } from '../../../panels/visualscript/util/hasPositionMetaData'
import { visualToFlow } from '../transformers/VisualToFlow'
import { flowToVisual } from '../transformers/flowToVisual'
import { useCustomNodeTypes } from './useCustomNodeTypes'
import { NodeSpecGenerator } from './useNodeSpecGenerator'

export const fetchVisualScriptJson = async (url: string) => (await (await fetch(url)).json()) as GraphJSON

/**
 * Hook that returns the nodes and edges for react-flow, and the visual script Json for the visual-script.
 * If nodes or edges are changes, the visual script json is updated automatically.
 * The visual script json can be set manually, in which case the nodes and edges are updated to match the visual script json.
 * @param param0
 * @returns
 */
export const useVisualScriptFlow = ({
  initialVisualScriptJson,
  specGenerator
}: {
  initialVisualScriptJson: GraphJSON
  specGenerator: NodeSpecGenerator | undefined
}) => {
  const [visualScriptJson, setStoredVisualScriptJson] = useState<GraphJSON | undefined>()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [variables, setVariables] = useState<VariableJSON[]>([])

  const setVisualScriptJson = useCallback(
    (visualScriptJson: GraphJSON) => {
      if (!visualScriptJson) return

      const [nodes, edges] = visualToFlow(visualScriptJson)

      if (hasPositionMetaData(visualScriptJson) === false) {
        autoLayout(nodes, edges)
      }

      setNodes(nodes)
      setEdges(edges)
      setStoredVisualScriptJson(visualScriptJson)
      setVariables(visualScriptJson.variables ?? [])
    },
    [setEdges, setNodes, setVariables]
  )

  useEffect(() => {
    if (!initialVisualScriptJson) return
    setVisualScriptJson(initialVisualScriptJson)
  }, [initialVisualScriptJson, setVisualScriptJson])

  useEffect(() => {
    if (!specGenerator) return
    // when nodes and edges are updated, update the visual script json with the flow to visual behavior
    const visualScriptJson = flowToVisual(nodes, edges, variables, specGenerator)
    setStoredVisualScriptJson(visualScriptJson)
  }, [nodes, edges, variables, specGenerator])

  const nodeTypes = useCustomNodeTypes({
    specGenerator
  })

  const deleteNodes = (deletedNodes) => {
    const filterNodes = nodes.map((node) => {
      if (!node.parentNode) return node
      const parentNode = deletedNodes.find((deletedNode) => deletedNode.id === node.parentNode)
      if (parentNode === undefined) return node
      const newNode = omit(node, 'parentNode')
      newNode.position.x += parentNode.position.x
      newNode.position.y += parentNode.position.y
      return newNode
    })
    setNodes(filterNodes)
  }

  return {
    nodes,
    edges,
    variables,
    setVariables,
    onEdgesChange,
    onNodesChange,
    setVisualScriptJson,
    visualScriptJson,
    deleteNodes,
    nodeTypes
  }
}
