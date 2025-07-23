import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MouseRightClickMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10 1.667A5.833 5.833 0 0 0 4.168 7.5v5a5.833 5.833 0 0 0 11.667 0v-5m-5.833-5.833A5.833 5.833 0 0 1 15.834 7.5m-5.833-5.833V7.5h5.833"
    />
    <path fill="#F7F8FA" d="M10.416 7.083V1.667s2.23.539 3.333 1.25c1.473.95 1.667 4.166 1.667 4.166z" />
  </svg>
)
const ForwardRef = forwardRef(MouseRightClickMd)
export default ForwardRef
