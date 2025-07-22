import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import LoadingView from './index'
import { Default as story } from './index.stories'

describe('LoadingView', () => {
  it('- should render', () => {
    const wrapper = shallow(<LoadingView {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
