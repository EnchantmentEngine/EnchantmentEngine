import React, { ReactNode } from 'react'
import Text from '../../../primitives/tailwind/Text'

export const PanelTitle = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontSize="sm" className="leading-none">
      {children}
    </Text>
  )
}

export const PanelDragContainer = ({ children, dataTestId }: { children: ReactNode; dataTestId?: string }) => {
  return (
    <div className="flex cursor-pointer rounded-t-md px-4 py-2" data-testid={dataTestId || ''}>
      {children}
    </div>
  )
}
