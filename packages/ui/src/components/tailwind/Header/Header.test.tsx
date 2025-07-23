import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Header from './index'
import { Default as story } from './index.stories'

describe('Header', () => {
  it('- should render', () => {
    const wrapper = shallow(<Header {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
