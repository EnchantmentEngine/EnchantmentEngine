import { NodeSpecJSON } from '@ir-engine/visual-script'

export type Color = 'red' | 'green' | 'lime' | 'purple' | 'blue' | 'gray' | 'white' | 'orange' | 'cyan' | 'indigo'

export const colors: Record<Color, [string, string, string]> = {
  red: ['bg-rose-900', 'border-[#dd6b20]', 'text-[#fff]'],
  green: ['bg-green-900', 'border-[#38a169]', 'text-[#fff]'],
  lime: ['bg-[#84cc16]', 'border-[#84cc16]', 'text-[#2d3748]'],
  purple: ['bg-purple-900', 'border-[#9f7aea]', 'text-[#fff]'],
  blue: ['bg-blue-900', 'border-[#22d3ee]', 'text-[#fff]'],
  gray: ['bg-[#718096]', 'border-[#718096]', 'text-[#fff]'],
  white: ['bg-[#fff]', 'border-[#fff]', 'text-[#4a5568]'],
  orange: ['bg-orange-900', 'border-[#f59e0b]', 'text-[#fff]'],
  cyan: ['bg-cyan-800', 'border-[#2b6cb0]', 'text-[#fff]'],
  indigo: ['bg-indigo-900', 'border-[#4a5568]', 'text-[#fff]']
}

export const valueTypeColorMap: Record<string, string> = {
  flow: 'white',
  number: 'green',
  float: 'green',
  integer: 'lime',
  boolean: 'red',
  string: 'purple'
}

export const categoryColorMap: Record<NodeSpecJSON['category'], Color> = {
  Logic: 'red',
  Math: 'purple',
  Engine: 'blue',
  Action: 'orange',
  Flow: 'green',
  Variable: 'cyan',
  Debug: 'indigo',
  None: 'gray'
}
