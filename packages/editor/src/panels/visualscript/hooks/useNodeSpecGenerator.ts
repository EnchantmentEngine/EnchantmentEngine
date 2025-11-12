// Generates node specs based on provided configuration,
// and caches the results.

import { useEffect, useState } from 'react'

import { getComponent } from '@ir-engine/ecs'
import {
  IRegistry,
  NodeConfigurationJSON,
  NodeSpecJSON,
  writeDefaultNodeSpecsToJSON,
  writeNodeSpecToJSON
} from '@ir-engine/visual-script'

import { EngineVariableGet, EngineVariableSet, EngineVariableUse, VisualScriptComponent } from '@ir-engine/engine'
import { SelectionState } from '../../../services/SelectionServices'

export class NodeSpecGenerator {
  private registry: IRegistry
  private specsWithoutConfig?: NodeSpecJSON[]
  private specsCache: { [cacheKey: string]: NodeSpecJSON } = {}

  constructor(registry: IRegistry) {
    this.registry = registry
  }

  getNodeTypes(): string[] {
    return Object.keys(this.registry.nodes)
  }

  getNodeSpec(nodeTypeName: string, configuration: NodeConfigurationJSON): NodeSpecJSON {
    const entities = SelectionState.getSelectedEntities()
    const entity = entities[entities.length - 1]

    const visualScriptComponent = getComponent(entity, VisualScriptComponent)

    const generateCacheKey = () => {
      let cacheKey = nodeTypeName + '\x01' + JSON.stringify(configuration)
      if (!nodeTypeName.includes('variable')) return cacheKey
      const variableNames = visualScriptComponent.visualScript?.variables?.map((variable) => {
        return { name: variable.name, type: variable.valueTypeName }
      })
      if (variableNames!.length === 0) return cacheKey
      cacheKey = nodeTypeName + '\x01' + JSON.stringify(configuration) + '\x01' + JSON.stringify(variableNames)
      return cacheKey
    }

    const cacheKey = generateCacheKey()
    if (!this.specsCache[cacheKey]) {
      const variableNodeAdjustSpec = () => {
        if (!nodeTypeName.includes('variable')) return
        const variable = visualScriptComponent.visualScript?.variables?.find(
          (variable) => variable.name === configuration.variableName
        )
        if (variable === undefined) return
        let sockets = specJson.inputs
        switch (nodeTypeName) {
          case EngineVariableSet.typeName: {
            sockets = specJson.inputs
            break
          }
          case EngineVariableUse.typeName:
          case EngineVariableGet.typeName: {
            sockets = specJson.outputs
            break
          }
        }
        let valueSocket = sockets.find((socket) => socket.name === 'value')
        valueSocket = {
          ...valueSocket!,
          valueType: variable!.valueTypeName!
        }
        sockets = sockets.filter((socket) => socket.name !== 'value')
        sockets = [...sockets, valueSocket]
        switch (nodeTypeName) {
          case EngineVariableSet.typeName: {
            specJson.inputs = sockets
            break
          }
          case EngineVariableUse.typeName:
          case EngineVariableGet.typeName: {
            specJson.outputs = sockets
            break
          }
        }
        return
      }

      // variableNodeAdjustSpec could be potentially be moved into writeNodeSpecToJSON, by passing in the variables into writeNodeSpecToJSON
      // but writeNodeSpecToJSON is used in other places too,
      //unsure what unforeseen effects adding variables as an arguement and moving variableNodeAdjustSpec into writeNodeSpecToJSON will have
      const specJson = writeNodeSpecToJSON(this.registry, nodeTypeName, configuration)
      variableNodeAdjustSpec()
      this.specsCache[cacheKey] = specJson
    }

    return this.specsCache[cacheKey]
  }

  getAllNodeSpecs(): NodeSpecJSON[] {
    if (!this.specsWithoutConfig) {
      this.specsWithoutConfig = writeDefaultNodeSpecsToJSON(this.registry)
    }

    return this.specsWithoutConfig
  }
}

export const useNodeSpecGenerator = (registry: IRegistry) => {
  const [specGenerator, setSpecGenerator] = useState<NodeSpecGenerator>()

  useEffect(() => {
    setSpecGenerator(new NodeSpecGenerator(registry))
  }, [registry.nodes, registry.values, registry.dependencies])

  return specGenerator
}
