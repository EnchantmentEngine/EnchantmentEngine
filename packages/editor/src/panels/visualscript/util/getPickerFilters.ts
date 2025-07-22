import { Node, OnConnectStartParams } from 'reactflow'

import { NodeSpecGenerator } from '../hooks'
import { getSocketsByNodeTypeAndHandleType } from './getSocketsByNodeTypeAndHandleType'

type NodePickerFilters = {
  handleType: 'source' | 'target'
  valueType: string
}

export const getNodePickerFilters = (
  nodes: Node[],
  params: OnConnectStartParams | undefined,
  specGenerator: NodeSpecGenerator | undefined
): NodePickerFilters | undefined => {
  if (params === undefined) return

  const originNode = nodes.find((node) => node.id === params.nodeId)
  if (originNode === undefined) return

  const sockets = specGenerator
    ? getSocketsByNodeTypeAndHandleType(
        specGenerator,
        originNode.type,
        originNode.data.configuration,
        params.handleType
      )
    : undefined

  const socket = sockets?.find((socket) => socket.name === params.handleId)

  if (socket === undefined) return

  return {
    handleType: params.handleType === 'source' ? 'target' : 'source',
    valueType: socket.valueType
  }
}
