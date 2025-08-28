import React from 'react'
import { MdOutlineHeatPump, MdOutlineWatch, MdOutlineWindPower } from 'react-icons/md'
import Select, { SelectProps } from '../../../../primitives/tailwind/Select'

/**Tailwind `Select` styled for studio */
const SelectInput = (props: SelectProps) => {
  return <Select {...props} />
}

SelectInput.displayName = 'SelectInput'
SelectInput.defaultProps = {
  options: [
    { label: 'Cuboid', value: 'a', icon: <MdOutlineWatch /> },
    { label: 'Cylinder', value: 'b', icon: <MdOutlineHeatPump /> },
    { label: 'Cube', value: 'c', icon: <MdOutlineWindPower /> }
  ],
  value: 'a',
  onChange: () => {},
  width: 'full'
}

export default SelectInput
