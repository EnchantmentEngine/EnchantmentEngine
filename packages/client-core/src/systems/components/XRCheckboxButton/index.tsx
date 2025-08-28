import React from 'react'

import { CheckLg } from '@ir-engine/ui/src/icons'
import styleString from './index.scss?inline'

type LabelPositionVariant = 'start' | 'end' | 'none'

const XRCheckboxButton = (props) => {
  const {
    labelPosition = 'end',
    labelContent,
    checked,
    ...inputProps
  }: { labelPosition: LabelPositionVariant; labelContent: any; checked: boolean; inputProps: any } = props

  return (
    <>
      <style>{styleString}</style>
      <div className="checkboxContainer">
        {labelPosition === 'start' && <span className="label left">{labelContent}</span>}
        <label className="checkbox">
          <input type="checkbox" checked={checked} {...inputProps} />
          {checked && (
            <span className="checkboxIcon">
              <CheckLg />
            </span>
          )}
        </label>
        {labelPosition === 'end' && <span className="label right">{labelContent}</span>}
      </div>
    </>
  )
}

export default XRCheckboxButton
