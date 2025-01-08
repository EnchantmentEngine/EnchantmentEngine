import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ArrowTopRightOnSquare = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M10.5 18h8.25A2.25 2.25 0 0 0 21 15.75V5.25A2.25 2.25 0 0 0 18.75 3H8.25A2.25 2.25 0 0 0 6 5.25v8.25m10.5-6L3 21m0 0h5.25M3 21v-5.25"
    />
  </svg>
)
const ForwardRef = forwardRef(ArrowTopRightOnSquare)
export default ForwardRef
