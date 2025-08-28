import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import AvatarImage from './index'
import { Default as story } from './index.stories'

describe('AvatarImage component', () => {
  beforeEach(() => {
    render(<AvatarImage {...story?.args} />)
  })

  it('should render an image element with the data-testid attribute "avatar-image"', () => {
    const avatarImage = screen.getByTestId('avatar-image')
    // @ts-expect-error
    expect(avatarImage).toBeInTheDocument()
  })
})
