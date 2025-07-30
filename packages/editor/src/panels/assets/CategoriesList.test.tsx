import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import React from 'react'
import CategoriesList from './categories'

vi.mock('./hooks', () => ({
  assetCategories: [
    {
      name: 'Category 1',
      path: '/mock-category-1',
      depth: 0,
      children: [
        {
          name: 'Subcategory A',
          path: '/sub-cat-a',
          depth: 1,
          children: []
        },
        {
          name: 'Subcategory B',
          path: '/sub-cat-b',
          depth: 1,
          children: []
        }
      ]
    },
    {
      name: 'Category 2',
      path: '/mock-category-2',
      depth: 0,
      children: [
        {
          name: 'Subcategory C',
          path: '/sub-cat-c',
          depth: 1,
          children: []
        }
      ]
    }
  ],
  useAssetsCategory: vi.fn().mockReturnValue({
    currentCategoryPath: { set: vi.fn() },
    sidebarWidth: {
      value: 300,
      set: vi.fn()
    }
  }),
  useAssetsQuery: vi.fn().mockReturnValue({
    refetchResources: vi.fn(),
    staticResourcesPagination: {
      skip: { set: vi.fn() }
    }
  })
}))
function CategoriesListTestWrapper() {
  const [selected, setSelected] = React.useState<string | undefined>(undefined)

  const handleClick = (category?: string) => {
    setSelected(category)
  }

  return <CategoriesList selected={selected} onClick={handleClick} />
}

describe('CategoriesList component', () => {
  beforeEach(() => {
    createEngine()
    render(<CategoriesListTestWrapper />)
  })

  afterEach(() => {
    cleanup()
    destroyEngine()
  })

  it('should render a button with data-testid "assets-tab-assets-section-button"', () => {
    const assetTabAssetsSectionButton = screen.getByTestId('assets-tab-assets-section-button')
    expect(assetTabAssetsSectionButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "assets-tab-files-section-button"', () => {
    const assetTabFilesSectionButton = screen.getByTestId('assets-tab-files-section-button')
    expect(assetTabFilesSectionButton).toBeInTheDocument()
  })

  it('should render a list element that has the data-testid attributes "assets-category-list"', async () => {
    const assetTabAssetsSectionButton = screen.getByTestId('assets-tab-assets-section-button')
    fireEvent.click(assetTabAssetsSectionButton)

    const assetCategoryList = screen.getByTestId('assets-category-list')
    expect(assetCategoryList).toBeInTheDocument()
  })

  it('should render an asset container element with the data-testid attribute "assets-panel-category"', async () => {
    const assetTabAssetsSectionButton = screen.getByTestId('assets-tab-assets-section-button')
    fireEvent.click(assetTabAssetsSectionButton)

    const assetCategoryContainer = await screen.findAllByTestId('assets-panel-category')
    expect(assetCategoryContainer.length).toBeGreaterThan(0)
  })
  it('should render an element with the data-testid attribute "item-name"', async () => {
    const assetTabAssetsSectionButton = screen.getByTestId('assets-tab-assets-section-button')
    fireEvent.click(assetTabAssetsSectionButton)

    const assetCategoryNames = await screen.findAllByTestId('item-name')
    expect(assetCategoryNames.length).toBeGreaterThan(0)
  })
})
