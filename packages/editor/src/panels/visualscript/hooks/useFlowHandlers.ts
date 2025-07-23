import { MouseEvent as ReactMouseEvent, useCallback, useEffect, useState } from 'react'
import { Connection, Node, OnConnectStartParams, XYPosition } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { calculateNewEdge } from '../../../panels/visualscript/util/calculateNewEdge'
import { getNodePickerFilters } from '../../../panels/visualscript/util/getPickerFilters'
import { NodeSpecGenerator } from './useNodeSpecGenerator'
import { useVisualScriptFlow } from './useVisualScriptFlow'

type VisualScriptFlow = ReturnType<typeof useVisualScriptFlow>

const useNodePickFilters = ({
  nodes,
  lastConnectStart,
  specGenerator
}: {
  nodes: Node[]
  lastConnectStart: OnConnectStartParams | undefined
  specGenerator: NodeSpecGenerator | undefined
}) => {
  const [nodePickFilters, setNodePickFilters] = useState(getNodePickerFilters(nodes, lastConnectStart, specGenerator))

  useEffect(() => {
    setNodePickFilters(getNodePickerFilters(nodes, lastConnectStart, specGenerator))
  }, [nodes, lastConnectStart, specGenerator])

  return nodePickFilters
}

export const useFlowHandlers = ({
  onEdgesChange,
  onNodesChange,
  nodes,
  specGenerator
}: Pick<VisualScriptFlow, 'onEdgesChange' | 'onNodesChange'> & {
  nodes: Node[]
  specGenerator: NodeSpecGenerator | undefined
}) => {
  const [lastConnectStart, setLastConnectStart] = useState<OnConnectStartParams>()
  const [nodePickerVisibility, setNodePickerVisibility] = useState<XYPosition>()
  const [nodePickerLastOpened, setNodePickerLastOpened] = useState<number | undefined>()

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === null) return
      if (connection.target === null) return

      const newEdge = {
        id: uuidv4(),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      }
      onEdgesChange([
        {
          type: 'add',
          item: newEdge
        }
      ])
    },
    [onEdgesChange]
  )

  const closeNodePicker = useCallback(() => {
    if (nodePickerLastOpened && Date.now() - nodePickerLastOpened < 100) return
    setLastConnectStart(undefined)
    setNodePickerVisibility(undefined)
  }, [nodePickerLastOpened])

  const handleAddNode = useCallback(
    (nodeType: string, position: XYPosition) => {
      closeNodePicker()
      const newNode = {
        id: uuidv4(),
        type: nodeType,
        position,
        data: { configuration: {}, values: {} } //fill with default values here
      }
      onNodesChange([
        {
          type: 'add',
          item: newNode
        }
      ])

      if (lastConnectStart === undefined) return

      // add an edge if we started on a socket
      const originNode = nodes.find((node) => node.id === lastConnectStart.nodeId)
      if (originNode === undefined) return
      if (!specGenerator) return
      onEdgesChange([
        {
          type: 'add',
          item: calculateNewEdge(originNode, nodeType, newNode.id, lastConnectStart, specGenerator)
        }
      ])
    },
    [closeNodePicker, lastConnectStart, nodes, onEdgesChange, onNodesChange, specGenerator]
  )

  const handleStartConnect = useCallback((e: ReactMouseEvent, params: OnConnectStartParams) => {
    setLastConnectStart(params)
  }, [])

  const handleStopConnect = useCallback((e: MouseEvent) => {
    const element = e.target as HTMLElement
    if (element.classList.contains('react-flow__pane')) {
      const targetBounds = element.getBoundingClientRect()
      setNodePickerVisibility({ x: e.clientX - targetBounds.left, y: e.clientY - targetBounds.top })
      setNodePickerLastOpened(Date.now())
    } else {
      setLastConnectStart(undefined)
    }
  }, [])

  const handlePaneClick = useCallback(() => closeNodePicker(), [closeNodePicker])

  const handlePaneContextMenu = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
    const graphPane = e.target as HTMLElement
    const paneBounds = graphPane.getBoundingClientRect()

    setNodePickerVisibility({ x: e.clientX - paneBounds.left, y: e.clientY - paneBounds.top })
    setNodePickerLastOpened(Date.now())
  }, [])

  const nodePickFilters = useNodePickFilters({
    nodes,
    lastConnectStart,
    specGenerator
  })

  return {
    onConnect,
    handleStartConnect,
    handleStopConnect,
    handlePaneClick,
    handlePaneContextMenu,
    lastConnectStart,
    nodePickerVisibility,
    handleAddNode,
    closeNodePicker,
    nodePickFilters
  }
}
