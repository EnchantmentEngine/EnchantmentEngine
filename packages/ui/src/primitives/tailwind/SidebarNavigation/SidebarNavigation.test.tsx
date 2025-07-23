import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import React from 'react'
import SidebarNavigation from './index'

describe('SidebarNavigation component', () => {
  beforeEach(() => {
    render(<SidebarNavigation labels={['']} currentTabIndex={0} onChange={() => {}} />)
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a button with data-testid "sidebar-navigation-button"', () => {
    screen.debug(document.body, Infinity)
    const sidebarNavigationButton = screen.getByTestId('sidebar-navigation-button')
    // @ts-expect-error
    expect(sidebarNavigationButton).toBeInTheDocument()
  })
})
