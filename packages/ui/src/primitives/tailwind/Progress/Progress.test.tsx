import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Progress from './index'
import { Default as story } from './index.stories'

describe('Progress', () => {
  it('- should render', () => {
    const wrapper = shallow(<Progress {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
