import { Rows01Md } from '@ir-engine/ui/src/icons'
import { ArgTypes } from '@storybook/react'
import React, { useEffect } from 'react'
import Select, { OptionType, SelectProps } from './index'

const argTypes: ArgTypes = {
  numberOfListItems: {
    control: 'number',
    name: 'Number of List Items'
  },
  width: {
    control: 'select',
    options: ['sm', 'md', 'lg', 'full']
  },
  inputHeight: {
    control: 'select',
    options: ['xs', 'l', 'xl']
  },
  labelText: {
    control: {
      type: 'text'
    }
  },
  labelPosition: {
    control: {
      type: 'select'
    },
    options: ['top', 'left']
  },
  showCheckmark: {
    control: {
      type: 'boolean'
    }
  },
  disabled: {
    control: {
      type: 'boolean'
    }
  },
  helperText: {
    control: {
      type: 'text'
    }
  },
  state: {
    control: {
      type: 'select'
    },
    options: ['success', 'error']
  },
  searchMode: {
    control: {
      type: 'select'
    },
    options: ['prefix', 'fuzzy']
  }
}

export default {
  title: 'Primitives/Tailwind/Select',
  component: Select,
  parameters: {
    componentSubtitle: 'Select',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2508-3421&t=XJmPDraRXGrLFAp3-4'
    }
  },
  argTypes,
  args: {
    numberOfListItems: 5
  }
}

const Renderer = ({ numberOfListItems, labelText, labelPosition, generateItem, items, ...props }) => {
  const _items = items || ([] as OptionType[])
  for (let i = 0; i < numberOfListItems; i++) {
    if (generateItem) {
      // @ts-ignore
      _items.push(generateItem(i))
    } else if (!items) {
      _items.push({
        value: i,
        label: `Account Settings ${i}`
      })
    }
  }

  const [value, setValue] = React.useState(-1)

  const onChange = (value: number) => {
    setValue(value)
  }

  const [labelProps, setLabelProps] = React.useState(undefined as SelectProps['labelProps'] | undefined)

  useEffect(() => {
    if (labelText && labelPosition) {
      setLabelProps({
        text: labelText,
        position: labelPosition
      })
    } else {
      setLabelProps(undefined)
    }
  }, [labelText, labelPosition])

  return <Select options={_items} value={value} onChange={onChange} labelProps={labelProps} {...props} />
}

export const Default = {
  render: Renderer
}

export const SecondaryText = {
  render: Renderer,
  args: {
    generateItem: (i: number) => ({ value: i, label: `Account Settings ${i}`, secondaryText: 'secondary' }),
    showCheckmark: false
  }
}

export const SecondaryTextWithIcon = {
  render: Renderer,
  args: {
    generateItem: (i: number) => ({
      value: i,
      label: `Account Settings ${i}`,
      secondaryText: 'secondary',
      Icon: Rows01Md
    }),
    showCheckmark: false
  }
}

export const Searchable = {
  render: Renderer,
  args: {
    items: [
      {
        value: 1,
        label: 'Apple',
        secondaryText: 'A sweet red fruit rich in fiber and vitamins'
      },
      {
        value: 2,
        label: 'Banana',
        secondaryText: 'A tropical fruit high in potassium'
      },
      {
        value: 3,
        label: 'Carrot',
        secondaryText: 'A root vegetable great for vision health'
      },
      {
        value: 4,
        label: 'Dragon Fruit',
        secondaryText: 'An exotic fruit with a vibrant pink skin'
      },
      {
        value: 5,
        label: 'Eggplant',
        secondaryText: 'A versatile vegetable commonly used in cooking'
      },
      {
        value: 6,
        label: 'Fig',
        secondaryText: 'A small fruit with a unique, sweet flavor'
      },
      {
        value: 7,
        label: 'Grape',
        secondaryText: 'A juicy fruit used to make wine'
      },
      {
        value: 8,
        label: 'Honeydew Melon',
        secondaryText: 'A refreshing melon with a pale green flesh'
      },
      {
        value: 9,
        label: 'Iceberg Lettuce',
        secondaryText: 'A crisp, leafy vegetable often used in salads'
      },
      {
        value: 10,
        label: 'Jackfruit',
        secondaryText: 'A large fruit with a sweet and distinctive flavor'
      }
    ],
    width: 'lg',
    showCheckmark: false,
    searchMode: 'prefix'
  }
}

export const WithStartComponent = {
  render: Renderer,
  args: {
    items: [
      {
        value: 1,
        label: 'Apple',
        secondaryText: 'A sweet red fruit rich in fiber and vitamins'
      },
      {
        value: 2,
        label: 'Banana',
        secondaryText: 'A tropical fruit high in potassium'
      },
      {
        value: 3,
        label: 'Carrot',
        secondaryText: 'A root vegetable great for vision health'
      },
      {
        value: 4,
        label: 'Dragon Fruit',
        secondaryText: 'An exotic fruit with a vibrant pink skin'
      },
      {
        value: 5,
        label: 'Eggplant',
        secondaryText: 'A versatile vegetable commonly used in cooking'
      },
      {
        value: 6,
        label: 'Fig',
        secondaryText: 'A small fruit with a unique, sweet flavor'
      },
      {
        value: 7,
        label: 'Grape',
        secondaryText: 'A juicy fruit used to make wine'
      },
      {
        value: 8,
        label: 'Honeydew Melon',
        secondaryText: 'A refreshing melon with a pale green flesh'
      },
      {
        value: 9,
        label: 'Iceberg Lettuce',
        secondaryText: 'A crisp, leafy vegetable often used in salads'
      },
      {
        value: 10,
        label: 'Jackfruit',
        secondaryText: 'A large fruit with a sweet and distinctive flavor'
      }
    ],
    width: 'lg',
    showCheckmark: false,
    startComponent: <span className="text-xs text-text-inactive">X</span>,
    searchMode: 'prefix'
  }
}
