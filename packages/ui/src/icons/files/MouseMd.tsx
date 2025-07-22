import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MouseMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M10 7.5V5m0 13.333A5.833 5.833 0 0 1 4.165 12.5v-5a5.833 5.833 0 1 1 11.667 0v5a5.833 5.833 0 0 1-5.834 5.833"
    />
  </svg>
)
const ForwardRef = forwardRef(MouseMd)
export default ForwardRef
