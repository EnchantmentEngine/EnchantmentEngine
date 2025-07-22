import Component from './index'

const argTypes = {
  uniformScaling: {
    control: {
      type: 'boolean'
    }
  }
}

export default {
  title: 'Editor/Input/Vector3',
  component: Component,
  parameters: {
    componentSubtitle: 'Vector3Input',
    jest: 'Vector3.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
