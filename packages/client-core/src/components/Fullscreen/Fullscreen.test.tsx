import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import React from 'react'
import { Fullscreen } from './index'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('MoreOptionsMenu component', () => {
  let fullscreenElement: HTMLElement | null = null
  beforeEach(() => {
    createEngine()

    // Mock requestFullscreen
    Object.defineProperty(document.body, 'requestFullscreen', {
      configurable: true,
      value: vi.fn().mockImplementation(() => {
        fullscreenElement = document.body
        Object.defineProperty(document, 'fullscreenElement', {
          configurable: true,
          get: () => fullscreenElement
        })
        document.dispatchEvent(new Event('fullscreenchange'))
        return Promise.resolve()
      })
    })

    // Mock exitFullscreen
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: vi.fn().mockImplementation(() => {
        fullscreenElement = null
        Object.defineProperty(document, 'fullscreenElement', {
          configurable: true,
          get: () => fullscreenElement
        })
        document.dispatchEvent(new Event('fullscreenchange'))
        return Promise.resolve()
      })
    })

    render(<Fullscreen />)
  })

  afterEach(() => {
    destroyEngine()
    cleanup()
  })

  it('should render a button with data-testid "enter-fullscreen-button"', () => {
    const fullscreenButton = screen.getByTestId('enter-fullscreen-button')
    // @ts-expect-error
    expect(fullscreenButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "exit-fullscreen-button" after full screen mode is activated', () => {
    const fullscreenButton = screen.getByTestId('enter-fullscreen-button')
    fireEvent.click(fullscreenButton)

    screen.debug(document.body, Infinity)
    const exitFullscreenButton = screen.getByTestId('exit-fullscreen-button')
    // @ts-expect-error
    expect(exitFullscreenButton).toBeInTheDocument()
  })
})
