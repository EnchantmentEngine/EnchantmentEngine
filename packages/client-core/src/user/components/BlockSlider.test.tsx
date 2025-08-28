import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import React from 'react'
import BlockSlider from './BlockSlider'

describe('BlockSlider component', () => {
  beforeEach(() => {
    render(<BlockSlider label="" value={0} onChange={() => {}} />)
  })

  afterEach(() => {
    cleanup()
  })

  it('should render an element with data-testid "slider-label"', () => {
    const sliderLabel = screen.getByTestId('slider-label')
    // @ts-expect-error
    expect(sliderLabel).toBeInTheDocument()
  })

  it('should render an input element with data-testid "slider-text-value-input"', async () => {
    const sliderTextValueInputs = await screen.findAllByTestId('slider-text-value-input')
    expect(sliderTextValueInputs.length).toBeGreaterThan(0)
  })

  it('should render an input element with data-testid "slider-draggable-value-input"', async () => {
    const sliderDraggableValueInputs = await screen.findAllByTestId('slider-draggable-value-input')
    expect(sliderDraggableValueInputs.length).toBeGreaterThan(0)
  })
})
