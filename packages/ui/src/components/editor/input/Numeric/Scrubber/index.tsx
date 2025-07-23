import React from 'react'
import NumericInput, { NumericInputProp } from '..'
import Scrubber from '../../../layout/Scrubber'

const removeNumericInputOnlyProps = (props) => {
  const removeElement = (object, keyToRemove) => {
    const { [keyToRemove]: removedKey, ...updatedObject } = object
    return updatedObject
  }
  props = removeElement(props, 'inputClassName')
  props = removeElement(props, 'prefixIconClassName')
  props = removeElement(props, 'PreFixIcon')
  props = removeElement(props, 'prefixClassName')
  props = removeElement(props, 'suffixIconClassName')
  props = removeElement(props, 'SuffixIcon')
  return props
}

export default (props: NumericInputProp) => (
  <Scrubber className="w-full" {...removeNumericInputOnlyProps(props)}>
    <NumericInput className="w-full" {...props} />
  </Scrubber>
)
