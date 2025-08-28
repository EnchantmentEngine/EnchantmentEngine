import ProgressBar from './index'
const argTypes = {}

export default {
  title: 'Editor/Input/Progress',
  component: ProgressBar,
  parameters: {
    componentSubtitle: 'ProgressBar',
    jest: 'ProgressBar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: ProgressBar.defaultProps }
