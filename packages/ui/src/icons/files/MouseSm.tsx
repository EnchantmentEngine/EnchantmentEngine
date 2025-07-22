import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MouseSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 6V4m0 10.667A4.667 4.667 0 0 1 3.335 10V6a4.667 4.667 0 0 1 9.333 0v4a4.667 4.667 0 0 1-4.666 4.667"
    />
  </svg>
)
const ForwardRef = forwardRef(MouseSm)
export default ForwardRef
