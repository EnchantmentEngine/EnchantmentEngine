import React, { useEffect, useState } from 'react'
import { NodeTypes } from 'reactflow'

import { Node } from '../../../panels/visualscript/node'
import { NodeSpecGenerator } from './useNodeSpecGenerator'

const getCustomNodeTypes = (specGenerator: NodeSpecGenerator) => {
  return specGenerator.getNodeTypes().reduce((nodes: NodeTypes, nodeType) => {
    nodes[nodeType] = (props) => {
      const spec = specGenerator.getNodeSpec(nodeType, props.data.configuration)
      return <Node spec={spec} specGenerator={specGenerator} {...props} />
    }
    return nodes
  }, {})
}

export const useCustomNodeTypes = ({ specGenerator }: { specGenerator: NodeSpecGenerator | undefined }) => {
  const [customNodeTypes, setCustomNodeTypes] = useState<NodeTypes>()
  useEffect(() => {
    if (!specGenerator) return
    const customNodeTypes = getCustomNodeTypes(specGenerator)

    setCustomNodeTypes(customNodeTypes)
  }, [specGenerator])

  return customNodeTypes
}
