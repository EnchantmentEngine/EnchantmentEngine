import { useCallback } from 'react'
import { useReactFlow } from 'reactflow'

export const useChangeNode = (id: string, changeConfig = false, changeValues = true) => {
  const instance = useReactFlow()

  return useCallback(
    (key: string, value: any) => {
      instance.setNodes((nodes) =>
        nodes.map((n) => {
          if (n.id !== id) return n
          const newValues = changeValues ? { [key]: value } : {}
          const newConfig = changeConfig ? { [key]: value } : {}
          return {
            ...n,
            data: {
              ...n.data,
              values: {
                ...n.data.values,
                ...newValues
              },
              configuration: {
                ...n.data.configuration,
                ...newConfig
              }
            }
          }
        })
      )
    },
    [instance, id]
  )
}
