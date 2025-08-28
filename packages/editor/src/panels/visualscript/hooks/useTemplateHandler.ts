import { useMemo } from 'react'
import { Edge, Node } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { useMutableState } from '@ir-engine/hyperflux'
import { GraphTemplate, VisualScriptState } from '@ir-engine/visual-script'

import { useSelectionHandler } from './useSelectionHandler'
import { useVisualScriptFlow } from './useVisualScriptFlow'

type SelectionHandler = ReturnType<typeof useSelectionHandler>
type VisualScriptFlow = ReturnType<typeof useVisualScriptFlow>
export const useTemplateHandler = ({
  selectedNodes,
  selectedEdges,
  pasteNodes,
  onNodesChange
}: Pick<SelectionHandler, 'pasteNodes'> &
  Pick<VisualScriptFlow, 'onNodesChange'> & {
    selectedNodes: Node[]
    selectedEdges: Edge[]
  }) => {
  const visualScriptState = useMutableState(VisualScriptState)

  const createGraphTemplate = (nodes: Node[], edges: Edge[]): GraphTemplate => ({
    id: uuidv4(),
    name: 'New template ' + Math.random().toString(36).slice(-6),
    nodes,
    edges
  })

  const handleAddTemplate = useMemo(
    () =>
      (nodes: Node[] = selectedNodes, edges: Edge[] = selectedEdges) => {
        try {
          visualScriptState.templates.set((currentTemplates) => [
            ...currentTemplates,
            createGraphTemplate(nodes, edges)
          ])
        } catch (error) {
          console.error('Error adding template:', error)
        }
      },
    [selectedNodes, selectedEdges]
  )

  const handleEditTemplate = (editedTemplate: GraphTemplate) => {
    try {
      visualScriptState.templates.set((currentTemplates) => {
        const filterList = currentTemplates.filter((template) => template.id !== editedTemplate.id)
        return [...filterList, editedTemplate]
      })
    } catch (error) {
      console.error('Error editing template:', error)
    }
  }

  const handleDeleteTemplate = (deleteTemplate: GraphTemplate) => {
    try {
      visualScriptState.templates.set((currentTemplates) =>
        currentTemplates.filter((template) => template.id !== deleteTemplate.id)
      )
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const handleApplyTemplate = (template: GraphTemplate) => {
    try {
      console.log('DEBUG ', template.name)
      pasteNodes(template.nodes, template.edges, true, template.name)
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  return { handleAddTemplate, handleEditTemplate, handleDeleteTemplate, handleApplyTemplate }
}
