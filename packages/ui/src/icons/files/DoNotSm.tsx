import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const DoNotSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M12.243 12.243a6 6 0 1 0-8.486-8.486m8.486 8.486a6 6 0 1 1-8.486-8.486m8.486 8.486L3.757 3.757"
    />
  </svg>
)
const ForwardRef = forwardRef(DoNotSm)
export default ForwardRef
