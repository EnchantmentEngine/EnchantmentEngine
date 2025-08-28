import Component from './index'

export default {
  title: 'Primitives/Tailwind/Toggle',
  component: Component,
  parameters: {
    componentSubtitle: 'Toggle',
    jest: 'Toggle.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Off = {
  args: {
    label: 'Toggle Off Example',
    value: false,
    onChange: () => {},
    disabled: false
  }
}

export const On = {
  args: {
    label: 'Toggle On Example',
    value: true,
    onChange: () => {},
    disabled: false
  }
}
