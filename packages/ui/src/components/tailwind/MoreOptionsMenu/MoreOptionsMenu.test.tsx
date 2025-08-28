import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import React from 'react'
import MoreOptionsMenu from './index'

describe('MoreOptionsMenu component', () => {
  beforeEach(() => {
    render(
      <MoreOptionsMenu
        actionProps={[
          {
            label: 'Share Project',
            onClick: () => {}
          },
          {
            label: 'Delete Project',
            onClick: () => {}
          },
          {
            label: 'Rename',
            onClick: () => {}
          },
          {
            label: 'Delete',
            onClick: () => {}
          }
        ]}
      />
    )
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a button with data-testid "more-options-button"', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    expect(moreOptionsButton).toBeInTheDocument()
  })

  it('should render a list container element with the data-testid attribute "more-options-list" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const moreOptionsList = screen.getByTestId('more-options-list')
    expect(moreOptionsList).toBeInTheDocument()
  })
  it('should render a "share project" button with the data-testid attribute "share-project-button" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const shareProjectOption = screen.getByTestId('share-project-button')
    expect(shareProjectOption).toBeInTheDocument()
  })

  it('should render a "delete project" button with the data-testid attribute "delete-project-button" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const deleteProjectOption = screen.getByTestId('delete-project-button')
    expect(deleteProjectOption).toBeInTheDocument()
  })

  it('should render a "rename project" button with the data-testid attribute "rename-button" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const renameOption = screen.getByTestId('rename-button')
    expect(renameOption).toBeInTheDocument()
  })

  it('should render a "delete" button with the data-testid attribute "delete-button" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const deleteOption = screen.getByTestId('delete-button')
    expect(deleteOption).toBeInTheDocument()
  })
})
