import React, { ReactNode } from 'react'
import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Array',
  component: Component,
  parameters: {
    componentSubtitle: 'ArrayInput',
    jest: 'Array.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    label: 'Source Path',
    containerClassName: 'w-96',
    values: ['test name 1', 'test value 2', 'test 3', 'test 4'],
    inputLabel: 'Path',
    onChange: () => {}
  }
}

export const CustomerRender = {
  args: {
    label: 'Source Path',
    containerClassName: 'w-96',
    values: [
      <span className="mr-2 text-sm text-gray-500">test name 1</span>,
      <span className="mr-2 text-sm text-gray-500">test value 2</span>,
      <span className="mr-2 text-sm text-gray-500">test 3</span>,
      <span className="mr-2 text-sm text-gray-500">test 4</span>
    ],
    inputLabel: 'Path',
    onChange: () => {},
    renderFunction: (value: ReactNode) => {
      return (
        <div className="flex w-full items-center justify-between">
          {value}
          <button className="rounded bg-blue-500 px-2 py-1 text-white">Click Me</button>
        </div>
      )
    }
  }
}
