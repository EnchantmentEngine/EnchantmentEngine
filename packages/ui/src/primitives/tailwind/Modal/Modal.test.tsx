import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import React from 'react'
import Modal from './index'

describe('Modal component', () => {
  beforeEach(() => {
    render(<Modal onSubmit={() => {}} />)
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a container element with the data-testid attribute "modal"', () => {
    const modal = screen.getByTestId('modal')
    // @ts-expect-error
    expect(modal).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "modal-cancel-button"', () => {
    const modalCancelButton = screen.getByTestId('modal-cancel-button')
    // @ts-expect-error
    expect(modalCancelButton).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "modal-submit-button"', () => {
    screen.debug(document.body, Infinity)
    const modalSubmitButton = screen.getByTestId('modal-submit-button')
    // @ts-expect-error
    expect(modalSubmitButton).toBeInTheDocument()
  })
})
