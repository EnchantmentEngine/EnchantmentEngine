import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import ConfirmDialog from './index'

describe('ConfirmDialog component', () => {
  beforeEach(() => {
    render(<ConfirmDialog text="Test" onSubmit={() => {}} />)
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a button with the data-testid attribute "confirm-dialog"', () => {
    const confirmDialog = screen.getByTestId('confirm-dialog')
    // @ts-expect-error
    expect(confirmDialog).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "confirm-dialog-text-element"', () => {
    screen.debug(document.body, Infinity)
    const confirmDialogTextElement = screen.getByTestId('confirm-dialog-text-element')
    // @ts-expect-error
    expect(confirmDialogTextElement).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "confirm-dialog-text-element"', () => {
    screen.debug(document.body, Infinity)
    const confirmDialogTextElement = screen.getByTestId('confirm-dialog-text-element')
    // @ts-expect-error
    expect(confirmDialogTextElement).toBeInTheDocument()
  })
})
