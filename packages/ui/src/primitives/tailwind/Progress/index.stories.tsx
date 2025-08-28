import Component from './index'

export default {
  title: 'Primitives/Tailwind/Progress',
  component: Component,
  parameters: {
    componentSubtitle: 'Progress',
    jest: 'Progress.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    className: 'w-[50vw]',
    value: 10
  }
}
