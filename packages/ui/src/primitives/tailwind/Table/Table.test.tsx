import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import { TableStory } from './index.stories'

describe('Table', () => {
  it('- should render', () => {
    const wrapper = shallow(<TableStory />)
    expect(wrapper).toMatchSnapshot()
  })
})
