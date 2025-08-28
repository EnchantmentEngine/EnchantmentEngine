import Component from './index'

export default {
  title: 'Primitives/Tailwind/Autocomplete',
  component: Component,
  parameters: {
    componentSubtitle: 'Autocomplete',
    jest: 'Autocomplete.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    value: 'a1',
    options: [
      { label: 'A1', value: 'a1' },
      { label: 'B2', value: 'b2' },
      { label: 'C3', value: 'c3' }
    ],
    onSelect: () => {},
    onChange: () => {}
  }
}
