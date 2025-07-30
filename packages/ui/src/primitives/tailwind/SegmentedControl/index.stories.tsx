import { ArgTypes } from '@storybook/react'
import React from 'react'
import SegmentedControl, { OptionType } from './index'

const argTypes: ArgTypes = {
  numberOfListItems: {
    control: 'number',
    name: 'Number of List Items'
  },
  layout: {
    control: 'select',
    options: [undefined, 'single-row', 'two-row', 'vertical'],
    name: 'Layout Type'
  }
}

export default {
  title: 'Primitives/Tailwind/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    componentSubtitle: 'SegmentedControl',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/DXwFHGa5g0peqqSjyjpxQz/Studio-Design?node-id=16047-7190&p=f&t=a7fomun8NPlzHEP4-0'
    }
  },
  argTypes,
  args: {
    numberOfListItems: 2,
    layout: undefined
  }
}

const Renderer = ({ numberOfListItems, layout, generateItem, items, ...props }) => {
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

  const [value, setValue] = React.useState(0)

  const onChange = (value: number) => {
    setValue(value)
  }

  return <SegmentedControl layout={layout} options={_items} value={value} onChange={onChange} {...props} />
}

export const Default = {
  render: Renderer
}
