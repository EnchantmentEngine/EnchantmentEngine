import { Decorator } from '@storybook/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

/**
 * Simple Router Decorator for Storybook
 * Provides basic routing functionality using MemoryRouter
 */
export const SimpleRouterDecorator: Decorator = (Story, context) => {
  const routerConfig = context.parameters?.router as
    | {
        initialEntries?: string[]
        initialIndex?: number
      }
    | undefined

  const initialEntries = routerConfig?.initialEntries || ['/']
  const initialIndex = routerConfig?.initialIndex || 0

  return (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Routes>
        <Route path="*" element={<Story />} />
      </Routes>
    </MemoryRouter>
  )
}

export default SimpleRouterDecorator
