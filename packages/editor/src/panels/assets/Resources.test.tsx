import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import React from 'react'
import { DndWrapper } from '../../components/dnd/DndWrapper'
import Resources from './resources'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

vi.mock('./hooks', () => ({
  useAssetsCategory: vi.fn().mockReturnValue({
    sidebarWidth: {
      value: 300,
      set: vi.fn()
    }
  }),
  AssetsRefreshState: {
    triggerRefresh: vi.fn()
  },
  useAssetsQuery: vi.fn().mockReturnValue({
    category: { currentCategoryPath: { set: vi.fn(), get: vi.fn().mockReturnValue('') } },
    search: {
      value: ''
    },
    refetchResources: vi.fn(),
    staticResourcesPagination: {
      skip: {
        value: 0,
        set: vi.fn()
      },
      total: {
        value: 0,
        set: vi.fn()
      }
    },
    resources: [
      {
        id: 'mock-resource-id',
        key: 'mock-key',
        name: 'mock-name',
        url: 'mock-url',
        mimeType: 'image/png',
        thumbnailURL: '',
        tags: ['mock-tag']
      }
    ]
  })
}))

const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
  root: null,
  rootMargin: '',
  thresholds: []
}))

global.IntersectionObserver = mockIntersectionObserver

describe('Resources component', () => {
  beforeEach(() => {
    createEngine()
    render(
      <div id="test-dnd-context">
        <DndWrapper id="test-dnd-context">
          <Resources />
        </DndWrapper>
      </div>
    )
  })

  afterEach(() => {
    cleanup()
    destroyEngine()
  })

  it('should render a group of resource components with relevant data-testid attributes', async () => {
    const itemsContainer = screen.getByTestId('assets-panel-resource-items-container')
    expect(itemsContainer).toBeInTheDocument()
  })

  it('should render a container element of resource items that has the data-testid "assets-panel-resource-items"', async () => {
    const resourceItems = await screen.findAllByTestId('assets-panel-resource-items')
    expect(resourceItems.length).toBeGreaterThan(0)
  })

  it('should render resource file elements that have the data-testid attribute "assets-panel-resource-file"', async () => {
    const resourceFiles = await screen.findAllByTestId('assets-panel-resource-file')
    expect(resourceFiles.length).toBeGreaterThan(0)
  })

  it('should render resource file icon elements that have the data-testid attribute "assets-panel-resource-file-icon"', async () => {
    const resourceIcons = await screen.findAllByTestId('assets-panel-resource-file-icon')
    expect(resourceIcons.length).toBeGreaterThan(0)
  })

  it('should render resource file name elements that have the data-testid attribute "assets-panel-resource-file-name"', async () => {
    const resourceFileNames = await screen.findAllByTestId('assets-panel-resource-file-name')
    expect(resourceFileNames.length).toBeGreaterThan(0)
  })
})
