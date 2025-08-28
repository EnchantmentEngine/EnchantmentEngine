import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Numeric/Stepper',
  component: Component,
  parameters: {
    componentSubtitle: 'NumericStepperInput',
    jest: 'NumericStepper.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
