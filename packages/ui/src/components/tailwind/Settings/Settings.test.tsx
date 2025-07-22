import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Settings from './index'
import { Default as story } from './index.stories'

describe('Settings', () => {
  it('- should render', () => {
    const wrapper = shallow(<Settings {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
