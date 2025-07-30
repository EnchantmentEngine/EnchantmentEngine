import Component from './index'

const argTypes = {
  uniformScaling: {
    control: {
      type: 'boolean'
    }
  }
}

export default {
  title: 'Editor/Input/Vector4',
  component: Component,
  parameters: {
    componentSubtitle: 'Vector4Input',
    jest: 'Vector4.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
