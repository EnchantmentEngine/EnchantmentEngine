import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Group',
  component: Component,
  parameters: {
    componentSubtitle: 'InputGroup',
    jest: 'Group.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = {
  args: {
    label: 'group label',
    info: 'input group info'
  }
}
