import React from 'react'
import { MdOutlineHeatPump, MdOutlineWatch, MdOutlineWindPower } from 'react-icons/md'
import SegmentedControl, { SegmentedControlProps } from '../../../../primitives/tailwind/SegmentedControl'

/**Tailwind `Select` styled for studio */
const SegmentedControlInput = (props: SegmentedControlProps) => {
  return <SegmentedControl {...props} />
}

SegmentedControlInput.displayName = 'SegmentedControlInput'
SegmentedControlInput.defaultProps = {
  options: [
    { label: 'Cuboid', value: 'a', icon: <MdOutlineWatch /> },
    { label: 'Cylinder', value: 'b', icon: <MdOutlineHeatPump /> },
    { label: 'Cube', value: 'c', icon: <MdOutlineWindPower /> }
  ],
  value: 'a',
  onChange: () => {},
  width: 'full'
}

export default SegmentedControlInput
