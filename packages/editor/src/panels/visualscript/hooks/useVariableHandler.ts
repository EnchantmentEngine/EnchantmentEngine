import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { VariableJSON } from '@ir-engine/visual-script'

import { useVisualScriptFlow } from './useVisualScriptFlow'

type VisualScriptFlow = ReturnType<typeof useVisualScriptFlow>

export const useVariableHandler = ({
  variables,
  setVariables
}: Pick<VisualScriptFlow, 'variables' | 'setVariables'>) => {
  const createVariable = (): VariableJSON => ({
    id: uuidv4(),
    name: 'variable ' + Math.random().toString(36).slice(-6),
    valueTypeName: 'string',
    initialValue: ''
  })

  const handleAddVariable = useMemo(
    () => () => {
      try {
        setVariables((graphVariable) => [...graphVariable, createVariable()])
      } catch (error) {
        console.error('Error adding variable:', error)
      }
    },
    [variables]
  )

  const handleEditVariable = (editedVariable: VariableJSON) => {
    try {
      setVariables((currentVariables) => {
        const filterList = currentVariables.filter((variable) => variable.id !== editedVariable.id)
        return [...filterList, editedVariable]
      })
    } catch (error) {
      console.error('Error editing variable:', error)
    }
  }

  const handleDeleteVariable = (deleteVariable: VariableJSON) => {
    try {
      setVariables((currentVariables) => currentVariables.filter((variable) => variable.id !== deleteVariable.id))
    } catch (error) {
      console.error('Error deleting variable:', error)
    }
  }

  return { handleAddVariable, handleEditVariable, handleDeleteVariable }
}
