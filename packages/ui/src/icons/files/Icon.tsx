import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Icon = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 21"
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
      d="M16.483 8.6v1.9q0 .507-.075.994M2.935 8.6v1.9c0 3.673 3.033 6.65 6.774 6.65m0 0V20m0-2.85a6.82 6.82 0 0 0 4.93-2.09M5.838 20h7.742M19 17.91l-6.768-6m2.407 3.15c.414-.43.01-.041.297-.57zm-2.026-6.65V3.85c0-1.574-1.3-2.85-2.904-2.85A2.9 2.9 0 0 0 6.95 2.957m5.281 8.953L1 1.95l5.806 5.13v3.42c0 1.574 1.3 2.85 2.903 2.85 1.08 0 2.024-.58 2.523-1.44"
    />
  </svg>
)
const ForwardRef = forwardRef(Icon)
export default ForwardRef
