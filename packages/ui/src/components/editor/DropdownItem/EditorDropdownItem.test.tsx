import { cleanup, render, type RenderResult, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, type TestContext } from 'vitest'

import React from 'react'
import EditorDropdownItem from './index'

interface EditorDropdownItemContext extends TestContext {
  rerender: RenderResult['rerender']
}

describe('EditorDropdownItem component', () => {
  beforeEach<EditorDropdownItemContext>((context) => {
    const { rerender } = render(<EditorDropdownItem label="assets-panel-category" collapsed={true} />)
    context.rerender = rerender
  })
  afterEach(() => {
    cleanup()
  })

  it('should render an element container with the data-testid attribute "assets-panel-category"', () => {
    const container = screen.getByTestId('assets-panel-category')
    expect(container).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "item-name"', () => {
    const itemName = screen.getByTestId('item-name')
    expect(itemName).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "expand-item" when "collapsed" state is true', () => {
    const expandItemIcon = screen.getByTestId('expand-item')
    expect(expandItemIcon).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "collapse-item" when "collapsed" state is false', (context: EditorDropdownItemContext) => {
    context.rerender(<EditorDropdownItem label="assets-panel-category" collapsed={false} />)

    const collapseItemIcon = screen.getByTestId('collapse-item')
    expect(collapseItemIcon).toBeInTheDocument()
  })
})
