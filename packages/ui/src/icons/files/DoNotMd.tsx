import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const DoNotMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      strokeWidth={1.5}
      d="M15.303 15.303A7.5 7.5 0 0 0 4.697 4.697m10.606 10.606A7.5 7.5 0 0 1 4.697 4.697m10.606 10.606L4.697 4.697"
    />
  </svg>
)
const ForwardRef = forwardRef(DoNotMd)
export default ForwardRef
